// ログイン開始時に渡した元記事のパスを、復帰 URL の state から取り出す。
//
// Amplify は state を `<乱数>-<customState を 16 進にしたもの>` の形で作る
// （signInWithRedirect の oauthSignIn と completeOAuthFlow の getCustomState に対応）。
// 交換が成功したときは Amplify が customOAuthState イベントで同じ値を渡してくれるが、
// 交換が失敗したときはイベントが来ない。その場合でも state は URL に残っているので、
// ここから戻り先を復元して記事へ帰す。
export const recoverPathFromState = (search: string): string | null => {
  const state = new URLSearchParams(search).get('state')
  if (!state) return null

  // 最初の - より後ろが customState。パス側に - があっても失わないよう繋ぎ直す
  const encoded = state.split('-').splice(1).join('-')
  if (encoded === '' || !/^(?:[0-9a-fA-F]{2})+$/.test(encoded)) return null

  const path = (encoded.match(/.{2}/g) ?? [])
    .map((byte) => String.fromCharCode(parseInt(byte, 16)))
    .join('')

  // サイト内の絶対パスだけを戻り先にする。// で始まる値は別サイトを指すため除く
  if (!path.startsWith('/') || path.startsWith('//')) return null
  // ルートは復帰ページ自身なので戻り先にならない
  if (path === '/') return null
  return path
}
