export function getLogger(module: string) {
  const prefix = `[lean-canvas:${module}]`
  return {
    info: (msg: string, meta?: object) => console.log(`${prefix} ${msg}`, meta ?? ''),
    warn: (msg: string, meta?: object) => console.warn(`${prefix} ${msg}`, meta ?? ''),
    error: (msg: string, meta?: object) => console.error(`${prefix} ${msg}`, meta ?? ''),
  }
}
