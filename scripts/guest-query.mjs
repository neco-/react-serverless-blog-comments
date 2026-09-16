// 未ログイン（Cognito ID プールのゲスト）として AppSync に IAM 署名付き GraphQL を投げる検証用スクリプト。
// AWS アカウントの認証情報は不要（ID プールの未認証 ID を取得して署名する）。
//   node scripts/guest-query.mjs '<GraphQL クエリ>'
//   node scripts/guest-query.mjs <AppSync URL> '<GraphQL クエリ>' [identityPoolId]
// URL と ID プールは省略でき、そのときは amplify_outputs.json から読む。
// リポジトリには実環境の識別子を書かない（公開リポジトリに残さないため）。
import { SignatureV4 } from '@smithy/signature-v4'
import { Sha256 } from '@aws-crypto/sha256-js'
import { readFileSync } from 'node:fs'

const outputs = (() => {
  try {
    return JSON.parse(readFileSync(new URL('../amplify_outputs.json', import.meta.url), 'utf8'))
  } catch {
    return null
  }
})()

// URL を省いてクエリだけ渡せるようにする（amplify_outputs.json があるとき）
const args = process.argv.slice(2)
const [endpointArg, ...rest] = args[0]?.startsWith('http') ? args : [undefined, ...args]
const [query, identityPoolArg] = rest

const endpoint = endpointArg || outputs?.data?.url
const identityPoolId = identityPoolArg || outputs?.auth?.identity_pool_id
const region = outputs?.data?.aws_region ?? outputs?.auth?.aws_region ?? 'ap-northeast-1'

if (!endpoint || !query || !identityPoolId) {
  console.error(
    'AppSync URL と ID プール ID が必要です。amplify_outputs.json を置くか、引数で渡してください。\n' +
      "  node scripts/guest-query.mjs '<GraphQL クエリ>'\n" +
      "  node scripts/guest-query.mjs <AppSync URL> '<GraphQL クエリ>' [identityPoolId]",
  )
  process.exit(1)
}

const cognito = async (target, body) => {
  const res = await fetch(`https://cognito-identity.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-amz-json-1.1', 'x-amz-target': `AWSCognitoIdentityService.${target}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${target} failed: ${res.status} ${await res.text()}`)
  return res.json()
}
const { IdentityId } = await cognito('GetId', { IdentityPoolId: identityPoolId })
const { Credentials } = await cognito('GetCredentialsForIdentity', { IdentityId })

const url = new URL(endpoint)
const body = JSON.stringify({ query })
const signer = new SignatureV4({
  credentials: { accessKeyId: Credentials.AccessKeyId, secretAccessKey: Credentials.SecretKey, sessionToken: Credentials.SessionToken },
  region, service: 'appsync', sha256: Sha256,
})
const signed = await signer.sign({
  method: 'POST', protocol: 'https:', hostname: url.hostname, path: url.pathname, query: {},
  headers: { 'content-type': 'application/json', host: url.hostname }, body,
})
const res = await fetch(endpoint, { method: 'POST', headers: signed.headers, body })
console.log(res.status, (await res.text()).slice(0, 2000))
