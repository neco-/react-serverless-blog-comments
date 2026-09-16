// OAuth リダイレクト後に元の記事ページへ戻すための遷移。テストで差し替えられるよう分離している。
export const navigateTo = (pathname: string) => {
  window.location.pathname = pathname
}
