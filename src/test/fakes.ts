import { AuthClient, AuthEvent, AuthUser, OAuthProvider } from '../lib/authClient'
import { ApiClient, AuthMode, SubscriptionHandlers } from '../lib/apiClient'

export class FakeAuthClient implements AuthClient {
  user: AuthUser | null = null
  calls: Array<{ method: string; args: unknown[] }> = []
  private listeners = new Set<(event: AuthEvent) => void>()

  async currentUser() { this.calls.push({ method: 'currentUser', args: [] }); return this.user }
  async signIn(username: string, password: string) { this.calls.push({ method: 'signIn', args: [username, password] }) }
  async signOut() { this.calls.push({ method: 'signOut', args: [] }) }
  async signInWithProvider(provider: OAuthProvider, customState: string) {
    this.calls.push({ method: 'signInWithProvider', args: [provider, customState] })
  }
  onAuthEvent(listener: (event: AuthEvent) => void) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
  emit(event: AuthEvent) { this.listeners.forEach((l) => l(event)) }
  listenerCount() { return this.listeners.size }
}

export class FakeApiClient implements ApiClient {
  queries: Array<{ query: string; variables: object; authMode: AuthMode }> = []
  mutations: Array<{ query: string; variables: object }> = []
  subscriptions: Array<{ query: string; variables: object; handlers: SubscriptionHandlers<any>; active: boolean }> = []
  queryResult: unknown = {}
  // ページごとに違う結果を返したいとき（nextToken を追う経路の検証）に使う。
  // 空でなければ先頭から 1 件ずつ取り出し、尽きたら queryResult に戻る。
  queryResults: unknown[] = []
  mutateResult: unknown = {}
  mutateError: unknown = null

  async query<T>(query: string, variables: object, authMode: AuthMode) {
    this.queries.push({ query, variables, authMode })
    if (this.queryResults.length > 0) return this.queryResults.shift() as T
    return this.queryResult as T
  }
  async mutate<T>(query: string, variables: object) {
    this.mutations.push({ query, variables })
    if (this.mutateError) throw this.mutateError
    return this.mutateResult as T
  }
  subscribe<T>(query: string, variables: object, handlers: SubscriptionHandlers<T>) {
    const entry = { query, variables, handlers, active: true }
    this.subscriptions.push(entry)
    return () => { entry.active = false }
  }
}
