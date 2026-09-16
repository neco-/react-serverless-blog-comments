import React, { useEffect } from 'react'
import { screen } from '@testing-library/react'
import { renderWithClients } from '../../test/render'
import { useAuth } from '../../hooks/useAuth'
import { SignInModal } from './SignInModal'

// サイト名とアカウント作成 URL は config（ビルド時の環境変数）で差し込む。
// 既定（空）ではサイト固有の文言もリンクも出さない。
const cfg = vi.hoisted(() => ({ SITE_NAME: '', SIGNUP_URL: '' }))
vi.mock('../../config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../config')>()),
  get SITE_NAME() { return cfg.SITE_NAME },
  get SIGNUP_URL() { return cfg.SIGNUP_URL },
}))

// マウント時にダイアログを開く
const Opener = () => {
  const { setIsOpenDialog } = useAuth()
  useEffect(() => { setIsOpenDialog(true) }, [setIsOpenDialog])
  return null
}

beforeEach(() => {
  cfg.SITE_NAME = ''
  cfg.SIGNUP_URL = ''
})

describe('SignInModal のサイト固有の表示', () => {
  it('既定では "Sign in" だけで、アカウント作成のリンクは出さない', async () => {
    renderWithClients(<><SignInModal /><Opener /></>)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Sign in', { selector: '.modal-title' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('SITE_NAME と SIGNUP_URL があれば見出しに名前を入れ、別タブで開くリンクを出す', async () => {
    cfg.SITE_NAME = 'example'
    cfg.SIGNUP_URL = 'https://example.com/signup'
    renderWithClients(<><SignInModal /><Opener /></>)
    expect(await screen.findByText('Sign in example')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'You can create example account.' })
    expect(link).toHaveAttribute('href', 'https://example.com/signup')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('SIGNUP_URL だけなら一般的な文言でリンクを出す', async () => {
    cfg.SIGNUP_URL = 'https://example.com/signup'
    renderWithClients(<><SignInModal /><Opener /></>)
    expect(await screen.findByRole('link', { name: 'You can create an account.' })).toBeInTheDocument()
  })
})
