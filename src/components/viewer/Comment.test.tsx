import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Comment } from './Comment'
import { renderWithClients, waitForAuth } from '../../test/render'
import { FakeAuthClient } from '../../test/fakes'
import { deleteComment } from '../../graphql/mutations'

vi.mock('@uiw/react-markdown-preview', async () => ({ default: (await import('../../test/mockMarkdown')).MarkdownPreviewMock }))
vi.mock('@uiw/react-md-editor', async () => ({ default: (await import('../../test/mockMarkdown')).MDEditorMock }))

const base = {
  id: 'c1', slug: 'post-1', displayName: 'alice', userId: 'u1', content: 'body', commentVotesId: 'v1',
  votes: { id: 'v1', upvoters: [], downvoters: [], createdAt: '', updatedAt: '', owner: 'u1' },
  replies: { items: [] }, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', owner: 'u1',
} as any
const signedInAs = (username: string) => { const c = new FakeAuthClient(); c.user = { username, displayName: '' }; return c }

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('Comment', () => {
  it('本人のコメントには編集・削除ボタンが出る', async () => {
    renderWithClients(<Comment comment={base} depth={0} />, { authClient: signedInAs('u1') })
    await waitFor(() => expect(screen.getByLabelText('Menu edit')).toBeInTheDocument())
    expect(screen.getByLabelText('Menu delete')).toBeInTheDocument()
  })
  it('他人のコメントには編集・削除ボタンが出ない', async () => {
    const authClient = signedInAs('u2')
    renderWithClients(<Comment comment={base} depth={0} />, { authClient })
    await waitForAuth(true)
    expect(screen.getByText('reply')).toBeInTheDocument()
    expect(screen.queryByLabelText('Menu edit')).toBeNull()
  })
  it('深さ 2 では reply ボタンが出ない', () => {
    renderWithClients(<Comment comment={base} depth={2} />)
    expect(screen.queryByText('reply')).toBeNull()
  })
  it('updatedAt が createdAt と違えば (edited) を出す', () => {
    renderWithClients(<Comment comment={{ ...base, updatedAt: '2024-01-02T00:00:00Z' }} depth={0} />)
    expect(screen.getByText(/\(edited\)/)).toBeInTheDocument()
  })
  it('削除済みは (Deleted) と出し、編集ボタンは出ない', async () => {
    const authClient = signedInAs('u1')
    renderWithClients(<Comment comment={{ ...base, content: '', deletedAt: '2024-01-02T00:00:00Z' }} depth={0} />, { authClient })
    expect(screen.getByText('(Deleted)')).toBeInTheDocument()
    await waitForAuth(true)
    expect(screen.queryByLabelText('Menu edit')).toBeNull()
  })
  it('削除ボタンで deleteComment を id 付きで送る', async () => {
    const user = userEvent.setup()
    const { apiClient } = renderWithClients(<Comment comment={base} depth={0} />, { authClient: signedInAs('u1') })
    const group = await screen.findByLabelText('Menu delete')
    await user.click(group.querySelector('button')!)
    await waitFor(() => expect(apiClient.mutations).toEqual([{ query: deleteComment, variables: { input: { id: 'c1' } } }]))
  })
  it('siteurl に http が無ければ https:// を補う', () => {
    renderWithClients(<Comment comment={{ ...base, siteurl: 'a.com' }} depth={0} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://a.com')
  })
})
