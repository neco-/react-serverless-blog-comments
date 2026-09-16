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
  it('操作の並びは 削除 → 編集 → reply → 投票（削除が左端）', async () => {
    renderWithClients(<Comment comment={base} depth={0} />, { authClient: signedInAs('u1') })
    const row = await screen.findByLabelText('Menu actions')
    const groups = Array.from(row.querySelectorAll('[aria-label^="Menu "]')).map((g) => g.getAttribute('aria-label'))
    expect(groups).toEqual(['Menu delete', 'Menu edit', 'Menu reply', 'Menu votes'])
  })
  // 削除は復元できないので、ゴミ箱の 1 タップでは消さず、その場で確定を求める。
  // 確認の帯はゴミ箱の位置から右へ伸びて他のボタンを覆う。下のボタン列は残るが操作できない
  it('ゴミ箱を押しただけでは送らず、Delete と Cancel が出て、下の操作は inert になる', async () => {
    const user = userEvent.setup()
    const { apiClient } = renderWithClients(<Comment comment={base} depth={0} />, { authClient: signedInAs('u1') })
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(apiClient.mutations).toEqual([])
    expect(screen.getByRole('button', { name: 'Confirm delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel delete' })).toBeInTheDocument()
    expect(screen.getByLabelText('Menu actions')).toHaveAttribute('inert')
  })
  it('確定を押すと deleteComment を id 付きで送る', async () => {
    const user = userEvent.setup()
    const { apiClient } = renderWithClients(<Comment comment={base} depth={0} />, { authClient: signedInAs('u1') })
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    await waitFor(() => expect(apiClient.mutations).toEqual([{ query: deleteComment, variables: { input: { id: 'c1' } } }]))
  })
  it('Cancel を押すと何も送らず、縮む動きのあとに元の操作へ戻る', async () => {
    const user = userEvent.setup()
    const { apiClient } = renderWithClients(<Comment comment={base} depth={0} />, { authClient: signedInAs('u1') })
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Cancel delete' }))
    expect(apiClient.mutations).toEqual([])
    // 縮むアニメーションの間は帯が残る（jsdom は animationend を出さないので時間切れで閉じる）
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Confirm delete' })).toBeNull())
    expect(screen.getByLabelText('Menu actions')).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })
  it('Escape でも Cancel と同じように戻る', async () => {
    const user = userEvent.setup()
    const { apiClient } = renderWithClients(<Comment comment={base} depth={0} />, { authClient: signedInAs('u1') })
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Confirm delete' })).toBeNull())
    expect(apiClient.mutations).toEqual([])
  })
  it('日時は分までで、秒は出さない', () => {
    renderWithClients(<Comment comment={{ ...base, updatedAt: '2024-01-02T03:04:05Z' }} depth={0} />)
    // ロケール依存の書式には依らず、「:mm:ss」の形が無いことだけを見る
    expect(document.body.textContent).not.toMatch(/\d{1,2}:\d{2}:\d{2}/)
    expect(document.body.textContent).toMatch(/2024/)
  })
  it('siteurl に http が無ければ https:// を補う', () => {
    renderWithClients(<Comment comment={{ ...base, siteurl: 'a.com' }} depth={0} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://a.com')
  })
})
