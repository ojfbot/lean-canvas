# Implementation notes

## Deviations

- 2026-10-01 (no loopback in prod): plan said add the guard as a CI step after `pnpm build`; territory: ci.yml has no `pnpm build` — it builds `@lean-canvas/shared` then `@lean-canvas/browser-app` by filter. Added the `pnpm check:no-loopback` step directly after the browser-app build step.
- 2026-10-01 (no loopback in prod): plan said run type-check/tests; territory: `packages/browser-app` has no tsconfig (build is `vite build` only) and the repo has no test files (`vitest run` exits 1 on main too). Verified with the vite build and the loopback guard only.
