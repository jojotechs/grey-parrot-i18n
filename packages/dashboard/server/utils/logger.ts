import type { H3Event } from 'h3'

export function createLogger(event: H3Event) {
  const isDev = useRuntimeConfig().dev
  return {
    debug(...args: any[]) {
      if (isDev) {
        event.node.res.setHeader('x-debug', JSON.stringify(args))
      }
    },
    error(...args: any[]) {
      event.node.res.setHeader('x-error', JSON.stringify(args))
    },
  }
}
