# Lean Canvas

> AI-powered lean canvas tool for rapid business model design.

Lean Canvas provides a 9-section business model canvas where each section is backed by a dedicated LangGraph agent. Chat with any section to brainstorm, refine, and validate your business model assumptions. All AI interactions route through the Frame OS `frame-agent` gateway.

## Features

- **9 canvas sections** — Problem, Solution, Key Metrics, Unique Value Proposition, Unfair Advantage, Channels, Customer Segments, Cost Structure, Revenue Streams
- **Per-section chat** — each section has its own LangGraph agent with isolated context
- **GET /api/tools** — capability manifest for frame-agent discovery (ADR-0007)
- **Module Federation remote** — renders inside the Frame OS shell
- **Carbon Design System** — consistent dark/light theming

## Architecture

```
packages/
  shared/        CanvasSection types, Message, CanvasThread
  agent-graph/   LangGraph canvas section nodes — 9 domain system prompts
  api/           Express server (:3026) — GET /api/tools, POST /api/canvas/:section/chat
  browser-app/   React + Carbon DS (:3025) — Module Federation remote (Dashboard + Settings)
```

All LLM calls route through `frame-agent` at port 4001 — no direct Anthropic SDK usage.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 5, Module Federation |
| UI | React 18, Carbon Design System |
| State | Redux Toolkit |
| AI | LangGraph (per-section agents), routed through frame-agent |
| Shared | @ojfbot/frame-ui-components (DashboardLayout) |
| Language | TypeScript |

## Getting Started

**Prerequisites:** Node >= 24 (via `fnm use`), pnpm 9

```bash
pnpm install
pnpm dev:all    # API on :3026, frontend on :3025
```

## Roadmap

- [x] Monorepo scaffold (4 packages)
- [x] Module Federation remote registered in shell
- [x] 9-section canvas layout with Carbon DS
- [x] GET /api/tools capability manifest
- [ ] Per-section LangGraph agent integration
- [ ] Canvas export (PDF, Markdown)
- [ ] Template library (pre-filled canvases for common models)

## License

MIT

## Frame OS Ecosystem

Part of [Frame OS](https://github.com/ojfbot/shell) — an AI-native application OS.

| Repo | Description |
|------|-------------|
| [shell](https://github.com/ojfbot/shell) | Module Federation host + frame-agent LLM gateway |
| [core](https://github.com/ojfbot/core) | Workflow framework — 30+ slash commands + TypeScript engine |
| [cv-builder](https://github.com/ojfbot/cv-builder) | AI-powered resume builder with LangGraph agents |
| [blogengine](https://github.com/ojfbot/BlogEngine) | AI blog content creation platform |
| [TripPlanner](https://github.com/ojfbot/TripPlanner) | AI trip planner with 11-phase pipeline |
| [core-reader](https://github.com/ojfbot/core-reader) | Documentation viewer for the core framework |
| **lean-canvas** | **AI-powered lean canvas business model tool (this repo)** |
| [gastown-pilot](https://github.com/ojfbot/gastown-pilot) | Multi-agent coordination dashboard |
| [seh-study](https://github.com/ojfbot/seh-study) | NASA SEH spaced repetition study tool |
| [daily-logger](https://github.com/ojfbot/daily-logger) | Automated daily dev blog pipeline |
| [purefoy](https://github.com/ojfbot/purefoy) | Roger Deakins cinematography knowledge base |
| [MrPlug](https://github.com/ojfbot/MrPlug) | Chrome extension for AI UI feedback |
| [frame-ui-components](https://github.com/ojfbot/frame-ui-components) | Shared component library (Carbon DS) |
