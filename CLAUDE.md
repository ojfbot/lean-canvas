# CLAUDE.md — lean-canvas

> **Before making any architectural decisions, read `domain-knowledge/frame-os-context.md`.**

## Skills

Project commands and skills live in `.claude/skills/`.

## Commands

```bash
pnpm install
pnpm dev:all          # API on :3026, frontend on :3025
pnpm build
pnpm test
pnpm lint
```

## Architecture

Frame OS sub-app. Module Federation remote exposed to the shell at `lean_canvas/remoteEntry.js`.

- `packages/shared/` — `CanvasSection` types, `Message`, `CanvasThread`
- `packages/agent-graph/` — LangGraph canvas section nodes; 9 domain system prompts; routes through `frame-agent` at `:4001`
- `packages/api/` — Express on `:3026`; `GET /api/tools` (ADR-0007); `POST /api/canvas/:section/chat`
- `packages/browser-app/` — Vite + Carbon DS on `:3025`; MF remote: exposes `Dashboard` + `Settings`

## Key constraints

- **No direct Anthropic SDK calls** — all LLM calls route through `frame-agent` at `:4001`
- **ADR-0020**: no Redux imports inside `packages/browser-app/src/components/` — props-in/callbacks-out
- **ADR-0019**: each canvas section agent operates with its own isolated context window
- **ADR-0007**: `GET /api/tools` must remain unauthenticated and return per-tool endpoints
- Ports: `3025` (frontend), `3026` (API) — do not conflict with other Frame apps
