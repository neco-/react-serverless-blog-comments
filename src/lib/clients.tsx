import React, { createContext, useContext } from 'react'
import { AuthClient } from './authClient'
import { ApiClient } from './apiClient'

type Clients = { authClient: AuthClient; apiClient: ApiClient }
const ClientsContext = createContext<Clients | null>(null)

export const ClientsProvider = ({ authClient, apiClient, children }: Clients & { children: React.ReactNode }) => (
  <ClientsContext.Provider value={{ authClient, apiClient }}>{children}</ClientsContext.Provider>
)

const useClients = (): Clients => {
  const clients = useContext(ClientsContext)
  if (!clients) throw new Error('ClientsProvider is missing')
  return clients
}
export const useAuthClient = () => useClients().authClient
export const useApiClient = () => useClients().apiClient
