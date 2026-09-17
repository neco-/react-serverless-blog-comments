// OAuth リダイレクト後に元の記事ページへ戻すための遷移。テストで差し替えられるよう分離している。
// pathname への代入だと復帰 URL のクエリ（使用済みの code と state）が付いたまま残るので、
// パスごと入れ替えて捨てる。
export const navigateTo = (pathname: string) => {
  window.location.assign(pathname)
}

// 復帰ページ（ホスト側）が出している待機表示を畳む。
// 遷移しないまま復帰処理が終わるときに使う。出口が無いと待機表示が残り続けるため。
export const dismissOAuthReturnDialog = () => {
  window.dispatchEvent(new CustomEvent('blogcomments:oauth-return-done'))
}
