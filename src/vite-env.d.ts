/// <reference types="vite/client" />

declare const __DEV_MERGE_CONFIG__: Record<string, any>

declare module '*.proto' {
  const src: string
  export default src
}
