export function useLogger() {
  return {
    debug(...args: any[]) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG]', ...args)
    },
  }
}
