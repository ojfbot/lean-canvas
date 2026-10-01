/**
 * Lean Canvas API base URL. Loopback only in dev — a production bundle must
 * never reach for localhost (it triggers the browser's Local Network Access
 * prompt for every visitor). Empty means "no API configured".
 */
export const API_BASE: string =
  import.meta.env.VITE_LEAN_CANVAS_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3026' : '')
