/// <reference types="vite/client" />

// ビルド時に差し込むクレジット表記（docs/config.md 参照）
interface ImportMetaEnv {
  readonly VITE_POWERED_BY_LABEL?: string
  readonly VITE_POWERED_BY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
