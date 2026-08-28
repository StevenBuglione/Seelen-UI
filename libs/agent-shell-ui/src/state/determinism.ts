export class FakeClock {
  #nowMs: number;

  constructor(startMs = 1_735_689_600_000) {
    this.#nowMs = startMs;
  }

  now(): number {
    return this.#nowMs;
  }

  advanceBy(durationMs: number): number {
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new RangeError(
        "fake clock duration must be a finite non-negative number",
      );
    }
    this.#nowMs += durationMs;
    return this.#nowMs;
  }

  advanceTo(monotonicMs: number): number {
    if (monotonicMs < this.#nowMs) {
      throw new RangeError("fake clock cannot move backwards");
    }
    this.#nowMs = monotonicMs;
    return this.#nowMs;
  }
}

export class DeterministicSource {
  #sequence = 0;
  #seed: number;

  constructor(seed = 0x0a05_2026) {
    this.#seed = seed >>> 0;
  }

  nextId(): string {
    this.#sequence += 1;
    return `fixture-${this.#sequence.toString().padStart(4, "0")}`;
  }

  nextRandom(): number {
    this.#seed = (1_664_525 * this.#seed + 1_013_904_223) >>> 0;
    return this.#seed / 0x1_0000_0000;
  }
}

export const FIXTURE_NETWORK_LATENCY_MS = 42;
