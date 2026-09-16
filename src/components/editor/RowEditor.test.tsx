import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RowEditor } from './RowEditor'
import { RowFooter } from './RowFooter'
import { renderWithClients } from '../../test/render'
import { FakeAuthClient } from '../../test/fakes'

vi.mock('@uiw/react-md-editor', async () => ({ default: (await import('../../test/mockMarkdown')).MDEditorMock }))

const signedIn = () => { const c = new FakeAuthClient(); c.user = { username: 'u1', displayName: '' }; return c }
const stored = (username: string) =>
  localStorage.setItem('blogcomment-storedata', JSON.stringify({ username, siteURL: '', isStored: true }))
const draft = (key: string, text: string) =>
  localStorage.setItem('blogcomment-storedata-comments', JSON.stringify([[key, text]]))

const forceTheme = (theme: string) => {
  const root = document.createElement('div')
  root.id = 'blogcomments'
  root.setAttribute('data-bc-theme', theme)
  document.body.appendChild(root)
  return root
}

beforeEach(() => {
  document.getElementById('blogcomments')?.remove()
  localStorage.clear()
  window.history.pushState({}, '', '/posts/post-1')
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('RowEditor', () => {
  it('送信が成功したら本文が空になる', async () => {
    const user = userEvent.setup()
    stored('alice')
    draft('', 'hello **md**')
    const { apiClient } = renderWithClients(
      <><RowEditor /><RowFooter /></>,
      { authClient: signedIn() },
    )
    const editor = screen.getByLabelText('comment editor')
    await user.click(editor) // フォーカスで下書きを読み戻す
    expect(editor).toHaveValue('hello **md**')

    await user.click(await screen.findByText('Send'))
    await waitFor(() => expect(apiClient.mutations).toHaveLength(1))
    await waitFor(() => expect(editor).toHaveValue(''))
  })

  it('送信後に書き直した本文が、別のエディタの保存で巻き戻らない', async () => {
    const user = userEvent.setup()
    stored('alice')
    draft('', 'hello')
    const { apiClient } = renderWithClients(
      <><RowEditor /><RowEditor inReplyTo="c-1" /><RowFooter /></>,
      { authClient: signedIn() },
    )
    const [editor, replyEditor] = screen.getAllByLabelText('comment editor')
    await user.click(editor)
    await user.click(await screen.findByText('Send'))
    await waitFor(() => expect(apiClient.mutations).toHaveLength(1))
    await waitFor(() => expect(editor).toHaveValue(''))

    await user.click(editor)
    await user.type(editor, 'second draft')
    // 別のエディタが保存すると共有 state の Map は作り直される
    await user.click(replyEditor)
    await user.click(document.body)
    expect(editor).toHaveValue('second draft')
  })

  it('ホストが data-bc-theme="dark" を指定したらエディタの配色も dark になる', () => {
    forceTheme('dark')
    renderWithClients(<RowEditor />, { authClient: signedIn() })
    expect(document.querySelector('[data-color-mode]')).toHaveAttribute('data-color-mode', 'dark')
  })

  it('指定が無ければ light のまま', () => {
    renderWithClients(<RowEditor />, { authClient: signedIn() })
    expect(document.querySelector('[data-color-mode]')).toHaveAttribute('data-color-mode', 'light')
  })
})
