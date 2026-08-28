# Agent runtime client

M04 generated shell/runtime types and the browser-safe trace replay adapter. The Rust `agent-contracts` crate is the
source of truth. This package never opens the named pipe directly; a later typed native shell backend owns that boundary
and webviews receive only validated messages.
