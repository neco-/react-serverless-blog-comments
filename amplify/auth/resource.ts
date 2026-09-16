import { defineAuth, referenceAuth } from '@aws-amplify/backend'

// 認証は 2 通りの構成を選べる。
//
//  1. 既存の Cognito を参照する（下の環境変数を 5 つすべて設定する）
//     すでに運用しているユーザープールにコメントを紐付けたいとき。
//
//  2. このプロジェクト専用の Cognito を新しく作る（環境変数を設定しない＝既定）
//     はじめて構築するとき。`npx ampx sandbox` だけで動く。
//
// リソースの識別子はリポジトリに書かない。公開リポジトリに実環境の
// ユーザープール ID・IAM ロール ARN・AWS アカウント ID を残さないため。
// 参照先は Amplify コンソールのブランチ環境変数、またはローカルの環境変数で渡す。
// 設定の手順は docs/setup.md を参照。

const REFERENCE_KEYS = [
  'BLOGCOMMENTS_USER_POOL_ID',
  'BLOGCOMMENTS_USER_POOL_CLIENT_ID',
  'BLOGCOMMENTS_IDENTITY_POOL_ID',
  'BLOGCOMMENTS_AUTH_ROLE_ARN',
  'BLOGCOMMENTS_UNAUTH_ROLE_ARN',
] as const

type ReferenceKey = (typeof REFERENCE_KEYS)[number]

// 全部あれば参照、全部無ければ新規作成。中途半端なときは黙って新規作成せず落とす。
// 既存プールを参照したいのに環境変数を 1 つ書き忘れて、別のプールが作られて
// 「ログインできるのに前のコメントが消えた」ように見えるのを避けるため。
const readReference = (): Record<ReferenceKey, string> | null => {
  const entries = REFERENCE_KEYS.map((key) => [key, process.env[key] ?? ''] as const)
  const missing = entries.filter(([, value]) => !value).map(([key]) => key)

  if (missing.length === REFERENCE_KEYS.length) return null
  if (missing.length > 0) {
    throw new Error(
      '既存の Cognito を参照する設定が揃っていません。次の環境変数も設定してください: ' +
        missing.join(', ') +
        '\n（すべて未設定にすると、このプロジェクト専用の Cognito を新しく作ります）',
    )
  }
  return Object.fromEntries(entries) as Record<ReferenceKey, string>
}

const reference = readReference()

// 新規に作る場合の既定。メールアドレスでのサインアップ／サインインだけを有効にする。
// ソーシャルログイン（Google / LINE など）はシークレットとコールバック URL の登録が要るので、
// 既定では有効にしない。追加の手順は docs/setup.md を参照。
const createOwnUserPool = () =>
  defineAuth({
    loginWith: {
      email: true,
    },
    // 表示名に使う。fullname が Cognito の name 属性で、authClient.ts が読むのはこれ。
    // 未設定ならユーザー名にフォールバックする（src/lib/authClient.ts の resolveDisplayName）。
    userAttributes: {
      fullname: { mutable: true, required: false },
    },
  })

const useExistingUserPool = (ref: Record<ReferenceKey, string>) =>
  referenceAuth({
    userPoolId: ref.BLOGCOMMENTS_USER_POOL_ID,
    userPoolClientId: ref.BLOGCOMMENTS_USER_POOL_CLIENT_ID,
    identityPoolId: ref.BLOGCOMMENTS_IDENTITY_POOL_ID,
    authRoleArn: ref.BLOGCOMMENTS_AUTH_ROLE_ARN,
    unauthRoleArn: ref.BLOGCOMMENTS_UNAUTH_ROLE_ARN,
  })

export const auth = reference ? useExistingUserPool(reference) : createOwnUserPool()
