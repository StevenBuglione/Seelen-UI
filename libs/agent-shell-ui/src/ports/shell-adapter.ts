import { DeterministicSource, FakeClock, FIXTURE_NETWORK_LATENCY_MS } from "../state/determinism.ts";
import { createFixtureScenario, isFixtureName } from "../state/fixtures.ts";
import type { FixtureName, FixtureSnapshot, InjectionKind, StudioInjection, TraceEnvelope } from "../state/types.ts";

export interface ShellAdapter {
  snapshot(): FixtureSnapshot;
  loadFixture(name: FixtureName): FixtureSnapshot;
  inject(event: StudioInjection): FixtureSnapshot;
  replay(envelopes: readonly TraceEnvelope[]): FixtureSnapshot;
  advanceClock(durationMs: number): FixtureSnapshot;
}

const fixtureForInjection: Record<InjectionKind, FixtureName> = {
  "user-speech": "user-speaking",
  "agent-transcript": "thinking",
  plan: "planning",
  command: "acting-single-step",
  "image-generation": "image-generating",
  "mcp-tool": "mcp-app-loading",
  approval: "waiting-for-approval",
  error: "error-recoverable",
  cancellation: "interrupted",
  reconnection: "reconnecting",
  "multi-agent": "multi-agent-progress",
};

export class FixtureShellAdapter implements ShellAdapter {
  readonly #clock = new FakeClock();
  readonly #source = new DeterministicSource();
  #snapshot: FixtureSnapshot;
  #traceMonotonicMs = 0;

  constructor(initialFixture: FixtureName = "idle") {
    this.#snapshot = this.#makeSnapshot(initialFixture);
  }

  snapshot(): FixtureSnapshot {
    return structuredClone(this.#snapshot);
  }

  loadFixture(name: FixtureName): FixtureSnapshot {
    this.#snapshot = this.#makeSnapshot(name);
    return this.snapshot();
  }

  inject(event: StudioInjection): FixtureSnapshot {
    const next = this.#makeSnapshot(fixtureForInjection[event.kind]);
    if (event.text) {
      next.state.message = event.text;
    }
    this.#snapshot = next;
    return this.snapshot();
  }

  replay(envelopes: readonly TraceEnvelope[]): FixtureSnapshot {
    this.#traceMonotonicMs = 0;
    for (const envelope of envelopes) {
      const fixture = typeof envelope.payload.fixture === "string" &&
          isFixtureName(envelope.payload.fixture)
        ? envelope.payload.fixture
        : fixtureForTraceType(envelope.type);
      this.#clock.advanceBy(envelope.monotonicMs - this.#traceMonotonicMs);
      this.#traceMonotonicMs = envelope.monotonicMs;
      this.#snapshot = this.#makeSnapshot(fixture);
      if (typeof envelope.payload.message === "string") {
        this.#snapshot.state.message = envelope.payload.message;
      }
    }
    return this.snapshot();
  }

  advanceClock(durationMs: number): FixtureSnapshot {
    this.#clock.advanceBy(durationMs);
    this.#snapshot = { ...this.#snapshot, clockMs: this.#clock.now() };
    return this.snapshot();
  }

  #makeSnapshot(name: FixtureName): FixtureSnapshot {
    const scenario = createFixtureScenario(name);
    return {
      ...scenario,
      clockMs: this.#clock.now(),
      deterministicId: this.#source.nextId(),
      randomValue: this.#source.nextRandom(),
      networkLatencyMs: FIXTURE_NETWORK_LATENCY_MS,
    };
  }
}

function fixtureForTraceType(type: string): FixtureName {
  const exact = Object.entries(fixtureForInjection).find(([kind]) => type.includes(kind));
  return exact?.[1] ?? "thinking";
}
