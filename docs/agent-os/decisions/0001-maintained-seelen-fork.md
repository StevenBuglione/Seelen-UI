# ADR 0001: Maintain a narrow Seelen UI fork

- Status: accepted
- Date: 2026-08-27

## Decision

Agent OS shell work lives in a maintained fork of Seelen UI, not only in a theme or third-party widget bundle. Agent OS
patches remain isolated in named modules, shared libraries, tools, and documentation.

## Consequences

The fork retains Seelen's AGPL-3.0-or-later obligations. Upstream changes are mirrored and reviewed. Every modification
to an upstream subsystem is listed in `UPSTREAM_PATCHES.md`.
