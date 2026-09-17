// mutation の失敗から、画面に出してよい文言を取り出す。
//
// Lambda が throw したエラーの message は GraphQL の errors[0].message として届くが、
// その中には内部の例外名（ConditionalCheckFailedException など）も混ざる。読者に見せてよいのは
// Lambda が印を付けたものだけなので、印のあるものだけ中身を出し、他は呼び出し側の文言に置き換える。
// 印は amplify/functions/shared/userError.mjs の USER_ERROR_PREFIX と同じ文字列。
const USER_ERROR_PREFIX = 'UserError: '

const rawMessage = (error: unknown): string => {
  const e = error as { errors?: { message?: string }[]; message?: string } | undefined
  return e?.errors?.[0]?.message ?? e?.message ?? ''
}

export const errorMessage = (error: unknown, fallback: string): string => {
  const raw = rawMessage(error)
  const at = raw.indexOf(USER_ERROR_PREFIX)
  return at === -1 ? fallback : raw.slice(at + USER_ERROR_PREFIX.length)
}
