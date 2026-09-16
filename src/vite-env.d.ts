/// <reference types="vite/client" />

// ビルド時に差し込むサイト固有の表示（docs/config.md 参照）
interface ImportMetaEnv {
  readonly VITE_POWERED_BY_LABEL?: string
  readonly VITE_POWERED_BY_URL?: string
  readonly VITE_SITE_NAME?: string
  readonly VITE_SIGNUP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
