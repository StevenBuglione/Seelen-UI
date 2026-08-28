# ADR 0003: Build the safety foundation before production UI

- Status: accepted
- Date: 2026-08-27

## Decision

M01 runtime-mode isolation and M02 Shell Studio are hard prerequisites for production shell design. The current Seelen
development startup is not an Agent OS development loop.

## Consequences

No production orb, shell redesign, hook, service, autostart, updater, installer, or live-shell experiment is permitted
in M00. A failed safety acceptance criterion stops the milestone sequence.
