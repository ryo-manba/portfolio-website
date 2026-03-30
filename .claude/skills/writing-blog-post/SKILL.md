---
name: writing-blog-post
description: ブログ記事を作成する
---

# ブログ記事の作成ルール

## ファイル形式

- パス: `content/blog/{slug}.mdx`
- frontmatter:

```yaml
---
title: "記事タイトル"
date: "YYYY-MM-DD"
description: "記事の説明文"
tags: ["tag1", "tag2"]
lang: "ja"
---
```

## 文体

- 「です。ます。」の敬体で統一する
- 丁寧すぎず、簡潔に書く

## 構成

- 最初のセクションで「何を作ったか」を簡潔に説明する
- 各セクションは「何をするか → なぜそうするか」の流れにする
- コード例の前後に処理の意図を説明する
- 技術選定には理由を添える（「なぜ X か」セクション）

## 根拠とリンク

- 主張や技術的な事実にはすべてリンクを付ける
- リンク先に実際にその情報が記載されていることを確認する。記載がない場合はリンクを付けない
- 自分で検証していないことを断定しない。検証した範囲を正確に書く
- 公式ドキュメントに情報がなければソースコードへのリンクでもよい

## 画像

- GitHub リポジトリの画像を参照する場合は raw URL を使う
  - 例: `https://raw.githubusercontent.com/ryo-manba/{repo}/main/assets/{image}.png`

## 既存記事の参考

- `content/blog/tech-blog-rag-how-it-works.mdx` の構成を参考にする
