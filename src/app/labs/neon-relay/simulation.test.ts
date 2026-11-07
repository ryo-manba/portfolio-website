import { describe, expect, it } from "vitest";
import { RADIUS, Simulation } from "./simulation";

const idle = { x: 0, z: 0, fire: false, dash: false, pulse: false };

describe("Neon Relay rules", () => {
  it("keeps paused games frozen and resumes without advancing suspended time", () => {
    const game = new Simulation();
    game.start();
    game.pause();
    game.step(20, { ...idle, x: 1, fire: true });
    expect(game.player.x).toBe(0);
    expect(game.time).toBe(180);
    expect(game.shots).toHaveLength(0);
    game.resume();
    game.step(20, idle);
    expect(game.time).toBeCloseTo(179.95);
  });

  it("does not make diagonal movement faster or allow leaving the arena", () => {
    const straight = new Simulation();
    const diagonal = new Simulation();
    straight.start();
    diagonal.start();
    straight.step(0.05, { ...idle, x: 1 });
    diagonal.step(0.05, { ...idle, x: 1, z: 1 });
    expect(Math.hypot(straight.player.x, straight.player.z - 14)).toBeCloseTo(
      Math.hypot(diagonal.player.x, diagonal.player.z - 14),
    );
    straight.player.x = RADIUS - 1;
    straight.player.z = 0;
    for (let i = 0; i < 40; i++) straight.step(0.05, { ...idle, x: 1, dash: true });
    expect(Math.hypot(straight.player.x, straight.player.z)).toBeLessThanOrEqual(RADIUS - 0.75);
  });

  it("enforces dash cooldown and grants brief invulnerability", () => {
    const game = new Simulation();
    game.start();
    game.step(0.05, { ...idle, dash: true });
    expect(game.dashCooldown).toBe(2.4);
    expect(game.player.invulnerable).toBeGreaterThan(0);
    game.step(0.05, { ...idle, dash: true });
    expect(game.dashCooldown).toBeCloseTo(2.35);
  });

  it("collects each core once and only advances a wave at the reactor", () => {
    const game = new Simulation();
    game.start();
    for (const pickup of [...game.pickups]) {
      game.player.x = pickup.x;
      game.player.z = pickup.z;
      game.step(0.016, idle);
    }
    expect(game.cores).toBe(3);
    expect(game.score).toBe(750);
    expect(game.wave).toBe(1);
    game.step(0.016, idle);
    expect(game.score).toBe(750);
    game.player.x = 0;
    game.player.z = 0;
    game.step(0.016, idle);
    expect(game.wave).toBe(2);
    expect(game.cores).toBe(0);
    expect(game.pickups.filter((pickup) => pickup.kind === "core")).toHaveLength(3);
  });

  it("requires defeating the final guardian before extraction", () => {
    const game = new Simulation();
    game.start();
    game.wave = 2;
    game.cores = 3;
    game.player.x = 0;
    game.player.z = 0;
    game.step(0.016, idle);
    const boss = game.enemies.find((enemy) => enemy.kind === "boss");
    expect(boss).toBeDefined();
    game.cores = 3;
    game.step(0.016, idle);
    expect(game.phase).toBe("playing");
    if (boss) boss.hp = 0;
    game.step(0.016, idle);
    expect(game.phase).toBe("won");
    const finalScore = game.score;
    game.step(1, idle);
    expect(game.score).toBe(finalScore);
  });

  it("limits repair to one charge per wave and never exceeds full health", () => {
    const game = new Simulation();
    game.start();
    expect(game.repair()).toBe(false);
    expect(game.repairAvailable).toBe(true);
    game.player.hp = 90;
    expect(game.repair()).toBe(true);
    expect(game.player.hp).toBe(100);
    game.player.hp = 50;
    expect(game.repair()).toBe(false);
    expect(game.player.hp).toBe(50);
  });

  it("ends the mission on timeout and prevents a simultaneous deposit from reviving it", () => {
    const game = new Simulation();
    game.start();
    game.wave = 3;
    game.cores = 3;
    game.player.x = 0;
    game.player.z = 0;
    game.time = 0.01;
    game.step(0.02, idle);
    expect(game.phase).toBe("lost");
    expect(game.time).toBe(0);
  });
});
