# ADR 0002: Separate the trusted runtime

- Status: accepted
- Date: 2026-08-27

## Decision

The trusted Agent OS runtime is a separate repository and process family from the Seelen fork. The boundary is an
authenticated, versioned, per-user Windows named-pipe protocol introduced in M04.

## Consequences

The shell, runtime, Codex App Server, and watchdog have independent failure domains. Webviews cannot own policy or talk
directly to the runtime pipe. Process separation requires legal review and is not assumed to resolve license questions.
