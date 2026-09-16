import React from 'react'
import { render, screen } from '@testing-library/react'
import { RowHeader } from './RowHeader'

// クレジット表記は config 次第で出し分ける。既定（空文字）ではどこにも出さない。
// config は環境変数（VITE_POWERED_BY_*）を読むので、ビルド環境の値に左右されないよう毎回モックする。
describe('RowHeader のクレジット表記', () => {
  afterEach(() => {
    vi.resetModules()
    vi.doUnmock('../../config')
  })

  it('既定の config（両方とも空）ではクレジットを出さない', async () => {
    vi.resetModules()
    vi.doMock('../../config', async () => ({
      ...(await vi.importActual<typeof import('../../config')>('../../config')),
      POWERED_BY_LABEL: '',
      POWERED_BY_URL: '',
    }))
    const { RowHeader: Mocked } = await import('./RowHeader')

    render(<Mocked isReply={false} />)
    expect(screen.getByText('Comments')).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('POWERED_BY_LABEL と POWERED_BY_URL があれば別タブで開くリンクを出す', async () => {
    vi.resetModules()
    vi.doMock('../../config', async () => ({
      ...(await vi.importActual<typeof import('../../config')>('../../config')),
      POWERED_BY_LABEL: 'Powered by example',
      POWERED_BY_URL: 'https://example.com',
    }))
    const { RowHeader: Mocked } = await import('./RowHeader')

    render(<Mocked isReply={false} />)
    const link = screen.getByRole('link', { name: 'Powered by example' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('ラベルだけ、URL だけの片方指定では出さない', async () => {
    vi.resetModules()
    vi.doMock('../../config', async () => ({
      ...(await vi.importActual<typeof import('../../config')>('../../config')),
      POWERED_BY_LABEL: 'Powered by example',
      POWERED_BY_URL: '',
    }))
    const { RowHeader: Mocked } = await import('./RowHeader')

    render(<Mocked isReply={false} />)
    expect(screen.queryByRole('link')).toBeNull()
  })
})

describe('RowHeader の見出し', () => {
  it('返信なら Reply、編集なら Edit、どちらでもなければ Comments', () => {
    const { rerender } = render(<RowHeader isReply={true} />)
    expect(screen.getByText('Reply')).toBeInTheDocument()

    rerender(<RowHeader isReply={false} isEditing={true} />)
    expect(screen.getByText('Edit')).toBeInTheDocument()

    rerender(<RowHeader isReply={false} />)
    expect(screen.getByText('Comments')).toBeInTheDocument()
  })
})
