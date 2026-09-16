import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoteHeart } from './VoteHeart'
import { renderWithClients, waitForAuth } from '../../test/render'
import { FakeAuthClient, FakeApiClient } from '../../test/fakes'
import { updateVotes, deleteVotes } from '../../graphql/mutations'
import { useAuth } from '../../hooks/useAuth'

const votes = () => ({ id: 'v1', createdAt: '', updatedAt: '' } as any)
// 票数と自分の投票状態は votesByIds の結果（useVotes）から引く
const summary = (upvoteCount: number, votedByMe: boolean) => [
  { id: 'v1', upvoteCount, downvoteCount: 0, votedByMe },
]
const signedIn = () => { const c = new FakeAuthClient(); c.user = { username: 'u1', displayName: '' }; return c }
// useAuth の isOpenDialog を観測する小さなプローブ
const DialogProbe = () => <div data-testid="dialog">{useAuth().isOpenDialog ? 'open' : 'closed'}</div>

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('VoteHeart', () => {
  it('投票数を表示する', () => {
    renderWithClients(<VoteHeart votes={votes()} />, { votes: summary(2, false) })
    expect(screen.getByText('2')).toBeInTheDocument()
  })
  it('未投票で押すと updateVotes に自分を upvoter として送る', async () => {
    const user = userEvent.setup()
    const authClient = signedIn()
    const { apiClient } = renderWithClients(<VoteHeart votes={votes()} />, { authClient, votes: summary(0, false) })
    await waitForAuth(true)
    await user.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(apiClient.mutations).toHaveLength(1))
    expect(apiClient.mutations[0]).toEqual({ query: updateVotes, variables: { input: { id: 'v1', upvoter: 'u1' } } })
  })
  it('投票済みで押すと deleteVotes を送る', async () => {
    const user = userEvent.setup()
    const { apiClient } = renderWithClients(<VoteHeart votes={votes()} />, { authClient: signedIn(), votes: summary(1, true) })
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked())
    await user.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(apiClient.mutations).toHaveLength(1))
    expect(apiClient.mutations[0]).toEqual({ query: deleteVotes, variables: { input: { id: 'v1' } } })
  })
  it('未ログインで押すとサインインダイアログを開き mutation は送らない', async () => {
    const user = userEvent.setup()
    const { apiClient } = renderWithClients(<><VoteHeart votes={votes()} /><DialogProbe /></>)
    await user.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(screen.getByTestId('dialog')).toHaveTextContent('open'))
    expect(apiClient.mutations).toHaveLength(0)
  })
  it('"voted" を含むエラーは info ログにして握りつぶす', async () => {
    const user = userEvent.setup()
    const apiClient = new FakeApiClient()
    apiClient.mutateError = { errors: [{ message: 'Already voted.' }] }
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const authClient = signedIn()
    renderWithClients(<VoteHeart votes={votes()} />, { authClient, apiClient, votes: summary(0, false) })
    await waitForAuth(true)
    await user.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(info).toHaveBeenCalledWith('You already voted.'))
  })
})

describe('VoteHeart の票数更新', () => {
  it('投票すると再取得を待たずに数字が増える', async () => {
    const user = userEvent.setup()
    renderWithClients(<VoteHeart votes={votes()} />, { authClient: signedIn(), votes: summary(2, false) })
    await waitForAuth(true)
    expect(screen.getByText('2')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('取り消すと数字が減る', async () => {
    const user = userEvent.setup()
    renderWithClients(<VoteHeart votes={votes()} />, { authClient: signedIn(), votes: summary(2, true) })
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked())
    await user.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('票数が取れていなければ 0 を出す（未ログインの初期表示など）', () => {
    renderWithClients(<VoteHeart votes={votes()} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('mutation が失敗したら数字を動かさない', async () => {
    const user = userEvent.setup()
    const apiClient = new FakeApiClient()
    apiClient.mutateError = { errors: [{ message: 'boom' }] }
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderWithClients(<VoteHeart votes={votes()} />, { authClient: signedIn(), apiClient, votes: summary(2, false) })
    await waitForAuth(true)
    await user.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(apiClient.mutations).toHaveLength(1))
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
