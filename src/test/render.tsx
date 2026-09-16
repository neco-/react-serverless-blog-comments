import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ClientsProvider } from '../lib/clients'
import { AuthContextProvider } from '../hooks/useAuth'
import { StoreDataContextProvider } from '../hooks/useStoreData'
import { VotesContextProvider } from '../hooks/useVotes'
import { VoteSummary } from '../graphql/votes'
import { FakeAuthClient, FakeApiClient } from './fakes'
import { useAuth } from '../hooks/useAuth'

// 認証状態の反映を待つためのプローブ（data-testid="auth-probe" に true/false を出す）
export const AuthProbe = () => <div data-testid="auth-probe">{String(useAuth().isAuthenticated)}</div>

// 本番と同じ Provider 構成（BlogComment 相当）でフェイクを注入して描画する
export const waitForAuth = (expected: boolean) =>
  waitFor(() => expect(screen.getByTestId('auth-probe')).toHaveTextContent(String(expected)))

export const renderWithClients = (
  ui: React.ReactElement,
  clients: { authClient?: FakeAuthClient; apiClient?: FakeApiClient; votes?: VoteSummary[] } = {},
) => {
  const authClient = clients.authClient ?? new FakeAuthClient()
  const apiClient = clients.apiClient ?? new FakeApiClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ClientsProvider authClient={authClient} apiClient={apiClient}>
      <AuthContextProvider>
        <StoreDataContextProvider>
          <VotesContextProvider initial={clients.votes}>
            {children}
            <AuthProbe />
          </VotesContextProvider>
        </StoreDataContextProvider>
      </AuthContextProvider>
    </ClientsProvider>
  )
  return { ...render(ui, { wrapper }), authClient, apiClient }
}
