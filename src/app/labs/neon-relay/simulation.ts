export type Phase = "ready" | "playing" | "paused" | "won" | "lost";
export type Vector = { x: number; z: number };
export type Enemy = Vector & {
  id: number;
  kind: "scout" | "sentinel" | "boss";
  hp: number;
  maxHp: number;
  shot: number;
};
export type Shot = Vector & { id: number; vx: number; vz: number; hostile: boolean; life: number };
export type Pickup = Vector & { id: number; kind: "core" | "health" };
export type Spark = Vector & { id: number; vx: number; vz: number; life: number; color: number };
export type Input = { x: number; z: number; fire: boolean; dash: boolean; pulse: boolean };
export type Snapshot = {
  phase: Phase;
  hp: number;
  score: number;
  wave: number;
  cores: number;
  time: number;
  dash: number;
  pulse: number;
  repair: boolean;
  boss: boolean;
  kills: number;
};

export const RADIUS = 22;
export const COVER = Array.from({ length: 6 }, (_, index) => ({
  x: Math.cos((index / 6) * Math.PI * 2 + 0.25) * 9,
  z: Math.sin((index / 6) * Math.PI * 2 + 0.25) * 9,
  radius: 1.4,
}));
export const distance = (a: Vector, b: Vector) => Math.hypot(a.x - b.x, a.z - b.z);

export class Simulation {
  phase: Phase = "ready";
  player = { x: 0, z: 14, angle: 0, hp: 100, invulnerable: 0, dashTime: 0 };
  enemies: Enemy[] = [];
  shots: Shot[] = [];
  pickups: Pickup[] = [];
  sparks: Spark[] = [];
  score = 0;
  wave = 1;
  cores = 0;
  time = 180;
  dashCooldown = 0;
  pulseCooldown = 0;
  pulseRing = 0;
  pulseOrigin: Vector = { x: 0, z: 14 };
  repairAvailable = true;
  kills = 0;
  elapsed = 0;
  private nextId = 1;
  private seed: number;
  private spawnClock = 0;
  private fireClock = 0;
  private direction: Vector = { x: 0, z: -1 };

  constructor(seed = 17) {
    this.seed = seed >>> 0;
    this.placeCores();
  }

  private random() {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  start() {
    this.phase = "playing";
  }
  pause() {
    if (this.phase === "playing") this.phase = "paused";
  }
  resume() {
    if (this.phase === "paused") this.phase = "playing";
  }

  repair() {
    if (this.phase !== "playing" || !this.repairAvailable || this.player.hp >= 100) return false;
    this.player.hp = Math.min(100, this.player.hp + 30);
    this.repairAvailable = false;
    this.burst(this.player, 0x67f5c8, 16);
    return true;
  }

  snapshot(): Snapshot {
    return {
      phase: this.phase,
      hp: Math.ceil(this.player.hp),
      score: this.score,
      wave: this.wave,
      cores: this.cores,
      time: Math.max(0, this.time),
      dash: this.dashCooldown,
      pulse: this.pulseCooldown,
      repair: this.repairAvailable,
      boss: this.enemies.some((enemy) => enemy.kind === "boss"),
      kills: this.kills,
    };
  }

  private placeCores() {
    const offset = this.random() * Math.PI * 2;
    for (let i = 0; i < 3; i++) {
      const angle = offset + (i / 3) * Math.PI * 2;
      this.pickups.push({ id: this.nextId++, x: Math.cos(angle) * 15, z: Math.sin(angle) * 15, kind: "core" });
    }
  }

  private burst(at: Vector, color: number, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = this.random() * Math.PI * 2;
      const speed = 2 + this.random() * 5;
      this.sparks.push({
        ...at,
        id: this.nextId++,
        vx: Math.cos(angle) * speed,
        vz: Math.sin(angle) * speed,
        life: 0.7,
        color,
      });
    }
    if (this.sparks.length > 180) this.sparks.splice(0, this.sparks.length - 180);
  }

  private move(body: Vector, dx: number, dz: number, radius: number) {
    const free = (x: number, z: number) =>
      COVER.every((cover) => Math.hypot(x - cover.x, z - cover.z) >= cover.radius + radius);
    if (free(body.x + dx, body.z)) body.x += dx;
    if (free(body.x, body.z + dz)) body.z += dz;
    const length = Math.hypot(body.x, body.z);
    if (length > RADIUS - radius) {
      body.x *= (RADIUS - radius) / length;
      body.z *= (RADIUS - radius) / length;
    }
  }

  private spawn(kind?: Enemy["kind"]) {
    const angle = this.random() * Math.PI * 2;
    const selected = kind ?? (this.wave > 1 && this.random() < 0.4 ? "sentinel" : "scout");
    const hp = selected === "boss" ? 34 : selected === "sentinel" ? 5 : 2;
    this.enemies.push({
      id: this.nextId++,
      x: Math.cos(angle) * 20,
      z: Math.sin(angle) * 20,
      kind: selected,
      hp,
      maxHp: hp,
      shot: 1.8,
    });
  }

  private hurt(amount: number) {
    if (this.player.invulnerable > 0) return;
    this.player.hp = Math.max(0, this.player.hp - amount);
    this.player.invulnerable = 0.85;
    this.burst(this.player, 0xff657a, 8);
    if (!this.player.hp) this.phase = "lost";
  }

  private kill(enemy: Enemy) {
    this.score += enemy.kind === "boss" ? 1500 : enemy.kind === "sentinel" ? 200 : 100;
    this.kills++;
    this.burst(enemy, enemy.kind === "boss" ? 0xb7a1ff : 0xff916b, 16);
    if (this.random() < 0.22) this.pickups.push({ id: this.nextId++, x: enemy.x, z: enemy.z, kind: "health" });
  }

  step(delta: number, input: Input) {
    if (this.phase !== "playing") return;
    // Ignore long suspended frames instead of moving through obstacles or
    // applying a whole tab's absence as damage in one update.
    const dt = Math.min(Math.max(delta, 0), 0.05);
    this.time -= dt;
    this.elapsed += dt;
    if (this.time <= 0) {
      this.time = 0;
      this.phase = "lost";
      return;
    }
    this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.pulseCooldown = Math.max(0, this.pulseCooldown - dt);
    this.pulseRing = Math.max(0, this.pulseRing - dt);

    const length = Math.hypot(input.x, input.z);
    const direction = length ? { x: input.x / length, z: input.z / length } : { x: 0, z: 0 };
    if (length) this.direction = direction;
    if (input.dash && !this.dashCooldown) {
      this.player.dashTime = 0.22;
      this.player.invulnerable = Math.max(this.player.invulnerable, 0.3);
      this.dashCooldown = 2.4;
      this.burst(this.player, 0x66e6ff, 8);
    }
    const dashing = this.player.dashTime > 0;
    const velocity = dashing ? this.direction : direction;
    this.move(this.player, velocity.x * (dashing ? 27 : 7.5) * dt, velocity.z * (dashing ? 27 : 7.5) * dt, 0.75);
    this.player.dashTime = Math.max(0, this.player.dashTime - dt);

    if (input.pulse && !this.pulseCooldown) {
      this.pulseCooldown = 9;
      this.pulseRing = 0.65;
      this.pulseOrigin = { x: this.player.x, z: this.player.z };
      for (const enemy of this.enemies) if (distance(enemy, this.player) < 8) enemy.hp -= 5;
      this.burst(this.player, 0x84f7e8, 22);
    }

    this.spawnClock -= dt;
    if (this.spawnClock <= 0 && this.enemies.length < 9 + this.wave) {
      this.spawn();
      this.spawnClock = 2.8 - this.wave * 0.45;
    }
    let target: Enemy | undefined;
    let nearest = 30;
    for (const enemy of this.enemies) {
      const range = distance(enemy, this.player);
      if (range < nearest && enemy.hp > 0) {
        nearest = range;
        target = enemy;
      }
    }
    const aim = target
      ? Math.atan2(target.x - this.player.x, target.z - this.player.z)
      : Math.atan2(this.direction.x, this.direction.z);
    this.player.angle = aim;
    this.fireClock = Math.max(0, this.fireClock - dt);
    if (input.fire && !this.fireClock) {
      this.fireClock = 0.15;
      this.shots.push({
        id: this.nextId++,
        x: this.player.x + Math.sin(aim) * 1.2,
        z: this.player.z + Math.cos(aim) * 1.2,
        vx: Math.sin(aim) * 36,
        vz: Math.cos(aim) * 36,
        hostile: false,
        life: 1.45,
      });
    }

    for (const enemy of this.enemies) {
      if (enemy.hp <= 0) continue;
      const range = distance(enemy, this.player);
      const dx = this.player.x - enemy.x;
      const dz = this.player.z - enemy.z;
      const speed = enemy.kind === "scout" ? 2.5 + this.wave * 0.45 : enemy.kind === "boss" ? 1.2 : 1.7;
      if (range > (enemy.kind === "scout" ? 0.9 : 7))
        this.move(enemy, (dx / range) * speed * dt, (dz / range) * speed * dt, enemy.kind === "boss" ? 2 : 0.85);
      if (range < (enemy.kind === "boss" ? 2.8 : 1.5)) this.hurt(12);
      if (dashing && range < 2 && enemy.kind !== "boss") enemy.hp = 0;
      enemy.shot -= dt;
      if (enemy.kind !== "scout" && enemy.shot <= 0 && this.shots.length < 90) {
        enemy.shot = enemy.kind === "boss" ? 1.2 : 2.4;
        const aimAngle = Math.atan2(dx, dz);
        const spread = enemy.kind === "boss" ? [-0.3, 0, 0.3] : [0];
        for (const offset of spread)
          this.shots.push({
            id: this.nextId++,
            x: enemy.x,
            z: enemy.z,
            vx: Math.sin(aimAngle + offset) * 8,
            vz: Math.cos(aimAngle + offset) * 8,
            hostile: true,
            life: 5,
          });
      }
    }

    for (const shot of this.shots) {
      shot.x += shot.vx * dt;
      shot.z += shot.vz * dt;
      shot.life -= dt;
      if (COVER.some((cover) => distance(shot, cover) < cover.radius)) shot.life = 0;
      if (shot.life <= 0) continue;
      if (shot.hostile) {
        if (distance(shot, this.player) < 1) {
          this.hurt(8);
          shot.life = 0;
        }
      } else {
        for (const enemy of this.enemies) {
          if (enemy.hp > 0 && distance(shot, enemy) < (enemy.kind === "boss" ? 2.2 : 1.1)) {
            enemy.hp--;
            shot.life = 0;
            this.burst(shot, 0xffbd82, 3);
            break;
          }
        }
      }
    }
    for (const enemy of this.enemies) if (enemy.hp <= 0) this.kill(enemy);
    this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
    this.shots = this.shots.filter((shot) => shot.life > 0 && Math.hypot(shot.x, shot.z) < 29);
    if (this.phase !== "playing") return;

    this.pickups = this.pickups.filter((pickup) => {
      if (distance(pickup, this.player) > 1.7) return true;
      if (pickup.kind === "core") {
        this.cores++;
        this.score += 250;
      } else this.player.hp = Math.min(100, this.player.hp + 18);
      this.burst(pickup, pickup.kind === "core" ? 0xffdf82 : 0x84f7c0, 10);
      return false;
    });
    for (const spark of this.sparks) {
      spark.x += spark.vx * dt;
      spark.z += spark.vz * dt;
      spark.life -= dt;
    }
    this.sparks = this.sparks.filter((spark) => spark.life > 0);

    // A fatal hit always wins over a deposit on the same simulation tick.
    if (this.phase !== "playing") return;
    if (
      this.cores >= 3 &&
      Math.hypot(this.player.x, this.player.z) < 3 &&
      !this.enemies.some((enemy) => enemy.kind === "boss")
    ) {
      if (this.wave === 3) {
        this.score += Math.floor(this.time) * 10;
        this.phase = "won";
      } else {
        this.wave++;
        this.cores = 0;
        this.player.hp = Math.min(100, this.player.hp + 15);
        this.repairAvailable = true;
        this.shots = [];
        this.enemies = [];
        this.time = Math.min(180, this.time + 20);
        this.spawnClock = 1;
        this.placeCores();
        if (this.wave === 3) this.spawn("boss");
        this.burst(this.player, 0x66e6ff, 30);
      }
    }
  }
}
