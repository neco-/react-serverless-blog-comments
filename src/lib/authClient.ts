// 認証まわりで Amplify に依存する部分をこのモジュールに閉じ込める。
// フックやコンポーネントは AuthClient だけを見る。

export type AuthUser = { username: string; displayName: string }
export type OAuthProvider = 'Google' | 'Facebook' | 'LINE'
export type AuthEvent =
  | { type: 'signedIn'; user: AuthUser }
  | { type: 'signInFailure'; error: unknown }
  | { type: 'signedOut' }
  | { type: 'customOAuthState'; state: string }

export interface AuthClient {
  // 未ログインなら null
  currentUser(): Promise<AuthUser | null>
  signIn(username: string, password: string): Promise<void>
  signOut(): Promise<void>
  signInWithProvider(provider: OAuthProvider, customState: string): Promise<void>
  // 解除関数を返す
  onAuthEvent(listener: (event: AuthEvent) => void): () => void
}

// ---- Amplify v6 実装 ----
import { Hub } from 'aws-amplify/utils'
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signInWithRedirect,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth'

// OAuth ユーザーは name 属性を別途取得する（従来どおり）。取れなければ username。
const resolveDisplayName = async (fallback: string): Promise<string> => {
  try {
    const attr = await fetchUserAttributes()
    return attr.name ?? fallback
  } catch {
    return fallback
  }
}

export const createAmplifyAuthClient = (): AuthClient => ({
  async currentUser() {
    try {
      const user = await getCurrentUser()
      return { username: user.username, displayName: '' }
    } catch {
      return null
    }
  },
  async signIn(username, password) {
    await amplifySignIn({ username, password })
  },
  async signOut() {
    await amplifySignOut()
  },
  async signInWithProvider(provider, customState) {
    const p = provider === 'LINE' ? { custom: 'LINE' } : provider
    await signInWithRedirect({ provider: p, customState })
  },
  onAuthEvent(listener) {
    return Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signedIn': {
          const user = payload.data
          console.log('signedIn', user)
          listener({ type: 'signedIn', user: { username: user.username, displayName: await resolveDisplayName(user.username) } })
          break
        }
        case 'signInWithRedirect_failure':
          listener({ type: 'signInFailure', error: payload.data })
          break
        case 'signedOut':
          console.log('signedOut')
          listener({ type: 'signedOut' })
          break
        case 'customOAuthState':
          console.log('customOAuthState', payload.data)
          listener({ type: 'customOAuthState', state: payload.data })
          break
        default:
          console.log('Hub.listen', payload.event)
      }
    })
  },
})
