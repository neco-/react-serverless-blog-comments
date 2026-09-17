// 画面に出してよいエラー。
//
// Lambda が throw したエラーの message は、そのまま GraphQL の errors[0].message として
// ブラウザに届く。内部の例外名やテーブル名まで読者に見せたくないので、出してよいものにだけ
// 印を付け、フロントは印のあるものだけを表示する（src/lib/errorMessage.ts）。
// name は AppSync を越えないので、印は message に載せる。

export const USER_ERROR_PREFIX = 'UserError: '

export class UserError extends Error {
  constructor(message) {
    super(USER_ERROR_PREFIX + message)
    this.name = 'UserError'
  }
}
