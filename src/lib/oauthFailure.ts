// ログインからの復帰に失敗したことを、戻り先の記事ページまで持ち越す。
//
// 復帰ページ（サイトのルート）にはコメント欄が無いので、そこで理由を出しても
// 読者は操作を続けられない。理由だけを預けて記事へ帰し、記事のコメント欄で伝える。
// 同じタブの中だけの一度きりの伝言なので sessionStorage に置く。

export type OAuthFailureReason = 'exchange' | 'no-flow'

const KEY = 'blogcomment-oauth-failure'
const REASONS: OAuthFailureReason[] = ['exchange', 'no-flow']

// 端末の開発者ツールを開けない読者にも理由が伝わるよう、短いコードを文言に入れる。
// exchange: トークンの引き換えに失敗した / no-flow: 進行中のログインが無かった
export const oauthFailureMessage = (reason: OAuthFailureReason): string =>
  reason === 'exchange'
    ? 'Sign in failed on the way back. Please try again. (code: exchange)'
    : 'Sign in did not complete. Please try again. (code: no-flow)'

export const reportOAuthFailure = (reason: OAuthFailureReason): void => {
  try {
    sessionStorage.setItem(KEY, reason)
  } catch {
    // 保存できなくても復帰そのものは続ける
  }
}

export const consumeOAuthFailure = (): OAuthFailureReason | null => {
  try {
    const stored = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return REASONS.includes(stored as OAuthFailureReason) ? (stored as OAuthFailureReason) : null
  } catch {
    return null
  }
}
