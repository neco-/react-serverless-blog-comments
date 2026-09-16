import ReactDOM from 'react-dom/client'

import { Amplify } from 'aws-amplify'
import { parseAmplifyConfig } from 'aws-amplify/utils'

import { BlogComment } from './components/BlogComment'
import { ClientsProvider } from './lib/clients'
import { createAmplifyAuthClient } from './lib/authClient'
import { createAmplifyApiClient } from './lib/apiClient'
import { startOAuthReturn } from './lib/oauthReturn'
import { navigateTo } from './lib/navigation'

import outputs from '../amplify_outputs.json'

if (import.meta.env.PROD) {
  // 本番では診断用の出力だけを止める。console.error は残す。
  // 失敗の原因が利用者のブラウザでしか分からないことがあり、消すと調査できなくなるため。
  console.log = () => {}
  console.debug = () => {}
}

const amplifyConfig = parseAmplifyConfig(outputs)

const oauth = amplifyConfig.Auth?.Cognito.loginWith?.oauth
if (oauth) {
  const { host } = window.location
  const filterHost = (urls: string[]) => {
    const matched = urls.filter((url) => new URL(url).host === host)
    return matched.length > 0 ? matched : urls
  }
  oauth.redirectSignIn = filterHost(oauth.redirectSignIn)
  oauth.redirectSignOut = filterHost(oauth.redirectSignOut)
}

const bc: HTMLElement | null = document.getElementById('blogcomments')

// コメント欄が無いページで読み込まれるのは OAuth の戻り先のときだけ。
// Amplify.configure でトークン交換が始まる前に購読しておく。
if (!bc) {
  startOAuthReturn(createAmplifyAuthClient(), navigateTo)
}

Amplify.configure(amplifyConfig)

if (bc) {
  const root = ReactDOM.createRoot(bc)
  if (root) {
    root.render(
      <ClientsProvider authClient={createAmplifyAuthClient()} apiClient={createAmplifyApiClient()}>
        <BlogComment />
      </ClientsProvider>
    )
  }
}
