import { AuthClient } from './authClient'
import { OAuthFailureReason } from './oauthFailure'

// OAuth のリダイレクト先ページ用の復帰処理。
//
// Cognito は登録済みのコールバック URL にしか戻せないため、記事ページからログインしても
// 戻り先はサイトのルートなど固定の 1 ページになる。そのページにコメント欄（#blogcomments）が
// 無いとウィジェットは描画されないが、ログイン開始時に customState として渡した元のパスは
// 受け取れるので、それを使って元のページへ戻す。
//
// トークンの交換自体は Amplify.configure が走った時点で始まるので、このモジュールは
// 遷移だけを担当する。取りこぼしを避けるため Amplify.configure より前に呼ぶこと。
//
// 復帰ページは待機表示を出したまま遷移を待つ。そのため「成功して遷移する」以外の結末でも
// 必ずどれかの出口に辿り着かせる。出口が 1 つしかないと、交換が失敗したときや
// そもそも交換が始まらないときに、待機表示が永久に残ってしまう。
export interface OAuthReturnEnv {
  // ログインが進行中か。進行中でなければ Amplify は成功も失敗も通知しない
  isInFlight(): boolean
  // 戻り先の記事パス。交換が失敗してイベントが来なくても URL の state から復元できる
  recoverPath(): string | null
  // 失敗した理由を戻り先の記事ページへ持ち越す
  reportFailure(reason: OAuthFailureReason): void
  // 遷移しないまま終わるとき、待機表示を畳む
  dismiss(): void
}

export const startOAuthReturn = (
  authClient: AuthClient,
  navigate: (pathname: string) => void,
  env: OAuthReturnEnv,
): (() => void) => {
  const unsubscribe = authClient.onAuthEvent((event) => {
    switch (event.type) {
      case 'customOAuthState':
        // 空とルートは戻り先がこのページ自身なので遷移しない。ログインは成功している
        if (event.state === '' || event.state === '/') {
          finish(null)
          return
        }
        finish(event.state)
        return
      case 'signInFailure':
        env.reportFailure('exchange')
        finish(env.recoverPath())
        return
      default:
        return
    }
  })

  const finish = (path: string | null) => {
    unsubscribe()
    if (path) navigate(path)
    else env.dismiss()
  }

  if (!env.isInFlight()) {
    // 交換の済んだ URL を開き直した場合など。待っても何も起きないので自分で決着をつける。
    // 前回の復帰で交換だけ通っていたなら既にログイン済みなので、失敗としては扱わない。
    // 呼び出し元は この直後に Amplify.configure を呼ぶ。await を挟んでそれを待ってから見る
    void (async () => {
      await Promise.resolve()
      const user = await authClient.currentUser()
      if (!user) env.reportFailure('no-flow')
      finish(env.recoverPath())
    })()
  }

  return unsubscribe
}
