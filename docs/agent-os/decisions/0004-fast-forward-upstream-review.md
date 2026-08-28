# ADR 0004: Fast-forward mirror plus reviewed upstream PR

- Status: accepted
- Date: 2026-08-27

## Decision

`upstream-master` advances only by fast-forward to canonical Seelen `master`. Differences enter `main` through an
ordinary pull request after Agent OS gates pass.

## Consequences

The automation fails on rewritten upstream history and never force-pushes or auto-merges. Agent OS milestone branches
are created from `main` and remain reviewable work packages.
