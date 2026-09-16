import { AuthClient } from './authClient'

// OAuth のリダイレクト先ページ用の復帰処理。
//
// Cognito は登録済みのコールバック URL にしか戻せないため、記事ページからログインしても
// 戻り先はサイトのルートなど固定の 1 ページになる。そのページにコメント欄（#blogcomments）が
// 無いとウィジェットは描画されないが、ログイン開始時に customState として渡した元のパスは
// 受け取れるので、それを使って元のページへ戻す。
//
// トークンの交換自体は Amplify.configure が走った時点で始まるので、このモジュールは
// 遷移だけを担当する。取りこぼしを避けるため Amplify.configure より前に呼ぶこと。
export const startOAuthReturn = (
  authClient: AuthClient,
  navigate: (pathname: string) => void,
): (() => void) => {
  const unsubscribe = authClient.onAuthEvent((event) => {
    if (event.type !== 'customOAuthState') return
    // 空とルートは戻り先がこのページ自身なので何もしない
    if (event.state === '' || event.state === '/') return
    unsubscribe()
    navigate(event.state)
  })
  return unsubscribe
}
