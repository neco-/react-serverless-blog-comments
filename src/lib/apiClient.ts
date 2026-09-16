// AppSync (GraphQL) 呼び出しで Amplify に依存する部分をこのモジュールに閉じ込める。

export type AuthMode = 'userPool' | 'iam'
export type SubscriptionHandlers<T> = { next: (value: T) => void; error: (error: unknown) => void }

export interface ApiClient {
  query<T>(query: string, variables: object, authMode: AuthMode): Promise<T>
  // mutation は常に userPool
  mutate<T>(query: string, variables: object): Promise<T>
  // 解除関数を返す。subscription は常に userPool
  subscribe<T>(query: string, variables: object, handlers: SubscriptionHandlers<T>): () => void
}

// ---- Amplify v6 実装 ----
import { generateClient } from 'aws-amplify/api'

export const createAmplifyApiClient = (): ApiClient => {
  const client = generateClient()
  return {
    async query(query, variables, authMode) {
      return (await client.graphql({ query, variables, authMode })) as any
    },
    async mutate(query, variables) {
      return (await client.graphql({ query, variables, authMode: 'userPool' })) as any
    },
    subscribe(query, variables, handlers) {
      const sub = (client.graphql({ query, variables, authMode: 'userPool' }) as any).subscribe({
        next: (value: any) => handlers.next(value),
        error: handlers.error,
      })
      return () => sub.unsubscribe()
    },
  }
}
