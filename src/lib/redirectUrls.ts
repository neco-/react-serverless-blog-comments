// Cognito のコールバック URL は複数登録できる（localhost と本番など）。
// Amplify は渡された一覧の先頭を使うため、現在のホストに一致するものへ絞る。
// 一致が無ければ絞らずに元の一覧を返す。空配列を渡すとリダイレクト先が
// 決まらなくなり、ログインの導線ごと失われるため。
export const selectRedirectUrls = (urls: string[], host: string): string[] => {
  const matched = urls.filter((url) => new URL(url).host === host)
  return matched.length > 0 ? matched : urls
}
