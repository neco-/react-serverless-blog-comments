import React from 'react'
import { Comment } from './Comment'
import { renderWithClients } from '../../test/render'

// このファイルだけは MarkdownPreview をモックしない。
// Comment.test.tsx は src/test/mockMarkdown.tsx で本文を素の <div> に差し替えているため、
// サニタイズが外れても気づけない。ここでは本物を描画して、生 HTML が落ちることを確かめる。
// エディタ側 (RowEditor 経由) だけはモックする。閲覧の検証に不要で重いため。
vi.mock('@uiw/react-md-editor', async () => ({ default: (await import('../../test/mockMarkdown')).MDEditorMock }))

const base = {
  id: 'c1', slug: 'post-1', displayName: 'alice', userId: 'u1', content: 'body', commentVotesId: 'v1',
  votes: { id: 'v1', upvoters: [], downvoters: [], createdAt: '', updatedAt: '', owner: 'u1' },
  replies: { items: [] }, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', owner: 'u1',
} as any

const renderContent = (content: string) => {
  const { container } = renderWithClients(<Comment comment={{ ...base, content }} depth={0} />)
  return container.querySelector('.wmde-markdown') as HTMLElement
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('Comment の本文はサニタイズされる', () => {
  // 落とせないと何が起きるかを名前に書いておく
  it.each([
    ['iframe', '<iframe src="https://evil.example/"></iframe>', 'iframe'],
    ['object', '<object data="https://evil.example/x.html"></object>', 'object'],
    ['base (埋め込み先の相対リンクを乗っ取る)', '<base href="https://evil.example/">', 'base'],
    ['form (ページ内フィッシング)', '<form action="https://evil.example/"><input type="password" name="p"></form>', 'form'],
    ['style (全面オーバーレイ)', '<style>body::before{position:fixed;inset:0;z-index:99999}</style>', 'style'],
  ])('%s を描画しない', (_name, content, selector) => {
    expect(renderContent(content).querySelector(selector)).toBeNull()
  })

  it('on* 属性を残さない', () => {
    const img = renderContent('<img src="x" onerror="alert(1)">').querySelector('img')
    expect(img?.getAttribute('onerror')).toBeNull()
  })

  it('javascript: のリンクを踏ませない', () => {
    const href = renderContent('<a href="javascript:alert(1)">click</a>').querySelector('a')?.getAttribute('href')
    expect(href ?? '').not.toContain('alert')
  })

  it('通常のマークダウンは今までどおり描画する', () => {
    const el = renderContent('# 見出し\n\n**太字** と [リンク](https://example.com/)')
    expect(el.querySelector('h1')?.textContent).toContain('見出し')
    expect(el.querySelector('strong')?.textContent).toBe('太字')
    // 見出しには rehype-autolink-headings が自分へのアンカーを足すので、本文のリンクを文字で選ぶ
    const link = [...el.querySelectorAll('a')].find((a) => a.textContent === 'リンク')
    expect(link?.getAttribute('href')).toBe('https://example.com/')
  })
})
