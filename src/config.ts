// クレジット表記 (docs/config.md 参照)
// 両方が埋まっているときだけ、コメント欄の見出しの右にリンクを出します。既定では何も出しません。
// 値はビルド時の環境変数で差し込みます。リポジトリに書くと、公開用のコピーにも載るためです。
//   VITE_POWERED_BY_LABEL / VITE_POWERED_BY_URL
// 自分だけで使うなら、下の "" を直接書き換えても構いません。
export const POWERED_BY_LABEL = import.meta.env.VITE_POWERED_BY_LABEL ?? ""
export const POWERED_BY_URL = import.meta.env.VITE_POWERED_BY_URL ?? ""

// ログインボタンの表示/非表示 (docs/config.md 参照)
export const ENABLED_OAUTH_ORIGINAL = true
export const ENABLED_OAUTH_GOOGLE = true
export const ENABLED_OAUTH_LINE = true
export const ENABLED_OAUTH_GITHUB = false // 未実装のため非表示 (見た目だけのボタンだった)
