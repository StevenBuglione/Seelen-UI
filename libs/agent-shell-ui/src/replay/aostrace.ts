import type { TraceEnvelope } from "../state/types.ts";

const sources = new Set<TraceEnvelope["source"]>([
  "app-server",
  "runtime",
  "shell",
  "policy",
  "automation",
]);

export function parseAosTrace(text: string): TraceEnvelope[] {
  const envelopes = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => parseEnvelope(line, index + 1));

  for (let index = 1; index < envelopes.length; index += 1) {
    if (envelopes[index]!.seq <= envelopes[index - 1]!.seq) {
      throw new Error("trace sequence numbers must be strictly increasing");
    }
    if (envelopes[index]!.monotonicMs < envelopes[index - 1]!.monotonicMs) {
      throw new Error("trace monotonic timestamps cannot move backwards");
    }
  }
  return envelopes;
}

function parseEnvelope(line: string, lineNumber: number): TraceEnvelope {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new Error(`invalid trace JSON at line ${lineNumber}`);
  }
  if (!value || typeof value !== "object") {
    throw new Error(`trace line ${lineNumber} must be an object`);
  }
  const candidate = value as Partial<TraceEnvelope>;
  if (
    !Number.isSafeInteger(candidate.seq) ||
    !Number.isFinite(candidate.monotonicMs) ||
    typeof candidate.source !== "string" ||
    !sources.has(candidate.source as TraceEnvelope["source"]) ||
    typeof candidate.type !== "string" ||
    typeof candidate.correlationId !== "string" ||
    !candidate.payload ||
    typeof candidate.payload !== "object" ||
    Array.isArray(candidate.payload)
  ) {
    throw new Error(`trace envelope at line ${lineNumber} is incomplete`);
  }
  return candidate as TraceEnvelope;
}
