# 分散 Token Bucket Rate Limiter 詳細メモ

ローカル版 [(memo/rate-limiter.md)](./rate-limiter.md) の続編。Token Bucket を Redis で複数プロセス共有版に拡張する設計と論点をまとめる。

作業リポジトリ: `~/workspace/oss/sandbox/rate-limiter/distributed/`
設計ドキュメント: `~/workspace/oss/sandbox/docs/superpowers/specs/2026-05-29-rate-limiter-distributed-design.md`

## 1. 動機

ローカル版は 1 プロセス内では正しく動くが、複数の API サーバから同じユーザのリクエストが来ると、各サーバが独立したバケツを持つので **全体としては設定したレートを超えてしまう**。

```text
ユーザ user:42 のリクエスト → ロードバランサ
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
   API server 1                API server 2              API server 3
   TokenBucket(10)             TokenBucket(10)           TokenBucket(10)
        │                         │                         │
        └────── 各自独立で動く → 実効 3 倍のレートを通してしまう ──┘
```

解決策はシンプル: **状態を Redis などの共有ストアに集約する**。

## 2. 設計上の論点

### 2.1 アトミック性をどう保証するか

「補充 → 残量チェック → 消費」を Redis 経由でやろうとすると、何もしないとレース条件が出る。

```text
時刻 t0  プロセス A : HGET tokens → 5
時刻 t1  プロセス B : HGET tokens → 5
時刻 t2  プロセス A : 補充計算 (例: 5 → 5)、消費 → HSET tokens 4
時刻 t3  プロセス B : 補充計算 (例: 5 → 5)、消費 → HSET tokens 4
                ⇒ 2 個消費したのに 1 個分しか減っていない
```

選択肢は実質 2 つ:

| 方法                     | アトミック性     | 実装複雑度 | ネットワーク往復 |
| ------------------------ | ---------------- | ---------- | ---------------- |
| `WATCH` + `MULTI`/`EXEC` | 楽観的ロック     | 高 (リトライ要) | 最低 2 RTT      |
| **`EVAL` (Lua)** ★      | サーバサイド一括 | 低         | 1 RTT            |

Lua スクリプトは Redis サーバが実行中に他クライアントのコマンドを処理しないので、スクリプト内のコマンドが **自動的にアトミック** になる。複雑なロック設計を書かずに済む。

`INCR` などの単純コマンドだけだと Token Bucket の補充計算 (`min(capacity, tokens + elapsed × rate)`) を表現できないので、Lua は実質必須。

### 2.2 時刻ソース

| 方法                   | 利点                       | 欠点                                  |
| ---------------------- | -------------------------- | ------------------------------------- |
| クライアント時刻       | 実装が単純                 | 複数 API サーバの時計ずれで補充が乱れる |
| **Redis サーバ時刻** ★ | 真実は 1 つに集約          | Lua の中でしか取れない (要 `EVAL`)   |

NTP 同期は前提にできないので **Redis サーバ時刻を使う** のが安全。Lua の中で `redis.call('TIME')` 1 行。

```lua
local t = redis.call('TIME')       -- { 秒, マイクロ秒 }
local now = tonumber(t[1]) + tonumber(t[2]) / 1e6
```

### 2.3 状態の持ち方

| 方法                       | 操作                            | 欠点                                  |
| -------------------------- | ------------------------------- | ------------------------------------- |
| 2 キーに分ける             | 2 回の `GET`/`SET`              | アトミック性が壊れる                  |
| **`HASH` で 1 キーに集約** ★ | `HMGET`/`HMSET` で一括           | 微小なシリアライズオーバーヘッド      |

```
KEY: ratelimit:user:42
  tokens       → "4.2"            (現在のトークン残量、文字列化された float)
  last_refill  → "1717000000.5"   (Redis サーバ時刻、秒)
```

Lua の中でも `HMGET`/`HMSET` で 1 回の Redis 呼び出しで済む。

### 2.4 TTL の設定

アイドルなユーザのキーが溜まり続けないよう、毎回 `EXPIRE` を更新する。

```lua
redis.call('EXPIRE', KEYS[1], ttl_seconds)
```

目安: `capacity / refill_rate × 10` 秒
- `capacity = 10, refill_rate = 1/s` なら 100 秒
- このペースを 10 倍以上アイドルなキーは消えても問題ない (次回は満タンから再開)

## 3. Lua スクリプト全文

```lua
-- Token Bucket をサーバサイドでアトミックに実行する。
--
-- 入力:
--   KEYS[1] : 対象キー (例: ratelimit:user:42)
--   ARGV[1] : capacity (float)
--   ARGV[2] : refill_rate (float, 個/秒)
--   ARGV[3] : n (float, 取得したいトークン数)
--   ARGV[4] : ttl_seconds (int)
--
-- 返り値: { allowed (0|1), tokens_after (string) }

local capacity = tonumber(ARGV[1])
local rate     = tonumber(ARGV[2])
local n        = tonumber(ARGV[3])
local ttl      = tonumber(ARGV[4])

-- Redis サーバ時刻 (秒、小数)
local t = redis.call('TIME')
local now = tonumber(t[1]) + tonumber(t[2]) / 1e6

-- 既存状態 (キーが無ければ満タンスタート)
local raw = redis.call('HMGET', KEYS[1], 'tokens', 'last_refill')
local tokens      = tonumber(raw[1]) or capacity
local last_refill = tonumber(raw[2]) or now

-- 補充計算 (ローカル版と完全に同じロジック)
local elapsed = now - last_refill
if elapsed > 0 then
  tokens = math.min(capacity, tokens + elapsed * rate)
end

-- 残量判定と消費 (拒否時は消費しない)
local allowed = 0
if tokens >= n then
  tokens = tokens - n
  allowed = 1
end

-- 状態保存と TTL 更新
redis.call('HMSET', KEYS[1], 'tokens', tostring(tokens), 'last_refill', tostring(now))
redis.call('EXPIRE', KEYS[1], ttl)

return { allowed, tostring(tokens) }
```

`tostring()` で float を文字列化しているのは、Redis Lua の数値型 (整数のみ) 制約を回避するため。Python 側で `float()` で復元する。

## 4. WATCH/MULTI/EXEC 版 (比較学習用)

学習として「なぜ Lua が事実上の標準か」を体感するため、楽観的ロック版も書く。

```python
def try_acquire(self, n: float = 1.0) -> bool:
    for attempt in range(self._max_retries + 1):
        with self._redis.pipeline() as pipe:
            try:
                pipe.watch(self._key)
                raw = pipe.hmget(self._key, "tokens", "last_refill")
                now = self._now()
                tokens = float(raw[0]) if raw[0] is not None else self._capacity
                last_refill = float(raw[1]) if raw[1] is not None else now

                # 補充
                elapsed = now - last_refill
                if elapsed > 0:
                    tokens = min(self._capacity, tokens + elapsed * self._refill_rate)

                # 消費判定
                allowed = tokens >= n
                if allowed:
                    tokens -= n

                # トランザクション化
                pipe.multi()
                pipe.hset(self._key, mapping={"tokens": str(tokens), "last_refill": str(now)})
                pipe.expire(self._key, self._ttl_seconds())
                pipe.execute()
                return allowed
            except redis.WatchError:
                # 競合 → リトライ
                continue
    raise RuntimeError("too many WATCH retries")
```

特徴:

- `pipe.watch(key)` 後にキーが他クライアントから書き換えられると `execute()` が `WatchError` を投げる
- これを `try/except` で受けてリトライ
- 高競合下ではリトライが多発して性能が劣化する
- 時刻はクライアント側で取得して書き込む (= 時計ずれの影響あり)
- ネットワーク往復は最低 2 回 (WATCH+HGET → MULTI+EXEC)、競合時はさらに増える

## 5. Lua 版と WATCH 版の比較

| 観点                | Lua 版                                | WATCH 版                                  |
| ------------------- | ------------------------------------- | ----------------------------------------- |
| アトミック性        | サーバサイド一括実行で常に成立        | リトライで吸収 (高競合だと失敗の可能性)   |
| 時刻ソース          | Redis サーバ時刻                      | クライアント時刻 (時計ずれの影響あり)     |
| ネットワーク往復    | 1 RTT (EVALSHA)                       | 最低 2 RTT、競合時はさらに増える          |
| 実装複雑さ          | Lua の知識が必要                      | Python だけで書ける (ただしリトライロジック) |
| デバッグしやすさ    | Lua 実行中はログが取りづらい          | Python 側で全て見える                     |
| **本番採用度**      | ★ 推奨                                | 比較学習用                                |

## 6. 共通インターフェース

両実装に同じシグネチャを持たせると、テスト・デモ・ベンチマークが横並びに書ける。

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class DistributedTokenBucket(Protocol):
    def try_acquire(self, n: float = 1.0) -> bool: ...
```

`Protocol` (PEP 544) を使うことで継承関係を強制せず、`try_acquire` を持っていれば代入互換になる。**ローカル版 `TokenBucket` も同じシグネチャ** なので、3 つの実装を同じプロトコルとして扱える。

## 7. テスト戦略

### 7.1 Redis fixture (pytest)

```python
@pytest.fixture
def redis_client():
    client = redis.Redis(host="localhost", port=6379, db=15, decode_responses=True)
    client.flushdb()
    yield client
    client.flushdb()
    client.close()
```

- `db=15` をテスト専用に使う (本番 `db=0` を汚さない)
- 各テストの前後で `flushdb()` で状態クリア (テスト間の状態漏れを防ぐ)
- `decode_responses=True` で `bytes` → `str` 自動変換

### 7.2 検証ケース

両実装で共通:

1. 初期バースト (`capacity` 個まで連続成功、その次失敗)
2. 時間経過で補充される
3. TTL が設定される
4. 存在しないキーは満タンから始まる
5. バリデーション (`ValueError`)

WATCH 版固有:

6. 競合時に正常リトライして成功する
7. リトライ上限超過で `RuntimeError`

### 7.3 パリティテスト

両実装が同じイベント列で同じ `allowed` 結果を返すことを確認:

- 時刻ソースが違うので厳密な数値一致は期待しない
- `time.sleep` を挟むテストならズレが結果に影響しないレベル
- 2 つの実装が「ロジックとして等価」であることを担保

### 7.4 2 プロセス同時アクセスデモ

```python
import multiprocessing as mp
# 2 ワーカーで同じバケツに 30 リクエストずつ投げる
# 合計許可数が capacity + refill_rate × 経過秒 以下に収まることを確認
```

これが分散制御が効いている証拠になる。ローカル版を 2 つ独立で動かした場合は合計許可数が約 2 倍になるが、Redis 共有なら抑えられる。

### 7.5 ベンチマーク

```text
TokenBucket (local) :   2.5 ms   (メモリアクセスのみ)
LuaBucket   (Redis) : 180.0 ms   (1 RTT × 1000)
WatchBucket (Redis) : 420.0 ms   (2-3 RTT × 1000)
```

Lua 版が WATCH 版の半分以下になることを確認する。

## 8. Redis セットアップ

```bash
brew install redis
brew services start redis
redis-cli ping       # → PONG
```

Python クライアント:

```bash
.venv/bin/pip install redis
```

最新の `redis-py` (7.x) でも `EVAL`、`register_script`、`pipeline().watch()` などの API は安定している。

## 9. キー命名規則

`ratelimit:{scope}:{id}` を慣習として採用:

- `ratelimit:user:42` — ユーザ ID 別
- `ratelimit:ip:1.2.3.4` — IP 別
- `ratelimit:api_key:abc123` — API キー別
- `ratelimit:endpoint:/api/heavy` — エンドポイント別

複数を組み合わせる階層的レート制御 (例: 「ユーザ全体で 1000/h、特定の重い API で 10/min」) はこのプロジェクトのスコープ外だが、自然に拡張できる。

## 10. 学び

設計を詰めた結果、いくつかのメタな知見が得られた:

1. **分散版はローカル版とアルゴリズムが同じ** — 違うのは「状態の置き場所」と「アトミック性の保証方法」だけ。ローカル版を素直に書いていれば自然に分散化できる
2. **Redis Lua スクリプトは "ミニ ACID"** — 単一スクリプト内の一連のコマンドが自動でアトミックになる。複雑なロックを書かずに済む
3. **時刻の信頼源は 1 つに集約する** — 分散システムの教科書通り、サーバ時計に一元化することで設計が安定する
4. **共通インターフェースで複数実装を並置すると比較しやすい** — Lua 版と WATCH 版を同じ Protocol で実装すると、ベンチマーク・パリティ・デモが横並びになる
5. **状態を `float` で持つ設計が分散版でも効く** — ローカル版で「補充は連続関数として扱う」と決めたのが、Lua の中でもそのまま使える

## 11. スコープ外と将来拡張

- **Redis Cluster** での挙動確認 (キーが同じスロットに乗ることが前提)
- **Redis Sentinel/Failover** 時の挙動 (状態が一部巻き戻る可能性)
- **GCRA (Generic Cell Rate Algorithm)** — Token Bucket と等価だが状態が 1 つの数値で済む。分散実装の効率が良い
- **Sliding Window の分散実装** — Sorted Set を使う定番パターン
- **本番運用向け堅牢化** — 接続プール、リトライ、サーキットブレーカー、メトリクス
- **複数キー対応** — 階層的レート制御 (ユーザ + エンドポイント別など)

## 12. メモ運用

このファイルは sandbox 側の実装が進むたびに追記する。実装が一段落したら blog の MDX に書き起こす。
ローカル版と同じ流れ (`memo/rate-limiter.md` → `content/blog/20260528-token-bucket-rate-limiter-from-scratch.mdx` のような関係)。
