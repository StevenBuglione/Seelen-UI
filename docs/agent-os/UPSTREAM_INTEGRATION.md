# Upstream integration workflow

## Remotes and branches

```text
origin    https://github.com/StevenBuglione/Seelen-UI.git
upstream  https://github.com/eythaann/Seelen-UI.git

upstream-master  exact fast-forward mirror of upstream/master
main             reviewed Agent OS integration
codex/Mxx-*      milestone work
```

## Automated weekly flow

`.github/workflows/upstream-sync.yml` runs Mondays and can be dispatched manually. It:

1. fetches canonical `upstream/master`;
2. advances `upstream-master` with `git merge --ff-only`;
3. pushes without force;
4. opens one pull request from `upstream-master` to `main` when a difference exists.

A non-fast-forward upstream rewrite fails closed and requires a human decision. The automation never merges the pull
request.

## Review flow

Before merging an upstream sync:

1. verify the old and new upstream SHAs and update `UPSTREAM_BASELINE.md`;
2. review every intersection with `UPSTREAM_PATCHES.md`;
3. run unchanged upstream shell checks and the Agent OS protocol drift gate;
4. run Shell Studio visual/ARIA/interaction gates;
5. run Native Harness no-side-effect and reconnect gates;
6. run required disposable Windows integration tests;
7. update the evidence report and merge normally into `main`.

Do not merge upstream directly into a release branch, rebase Agent OS history, force-push the mirror, or retarget an
immutable release tag.
