// サインアウトは Cognito のログアウトを経由してサイトのルートへ戻る。
//
// ログインの復帰と違い、戻り先を URL に載せる手段が無い。Cognito に渡す logout_uri は
// 登録済みの URL と完全一致でなければならず（Amplify の getRedirectUrl が一致しない値を弾く）、
// 記事ごとの戻り先を作れないし、state のような付随する値も無い。
//
// そこで出発する前に戻り先を預けておき、着地するルートのページに送り返してもらう。
// 同じタブの中だけの一度きりの伝言なので sessionStorage に置く。
// 読み出すのは埋め込み先のページ側で、キーと形は docs/hugo.md に書いてある。

export const SIGNOUT_RETURN_KEY = 'blogcomment-signout-return'

export const rememberSignOutReturn = (path: string): void => {
  // サイト内の絶対パスだけを戻り先にする。// で始まる値は別サイトを指すため除く
  if (!path.startsWith('/') || path.startsWith('//')) return
  // ルートはログアウトの着地点そのものなので、戻り先にならない
  if (path === '/') return
  try {
    sessionStorage.setItem(SIGNOUT_RETURN_KEY, JSON.stringify({ path, at: Date.now() }))
  } catch {
    // 預けられなくてもサインアウトそのものは続ける
  }
}
