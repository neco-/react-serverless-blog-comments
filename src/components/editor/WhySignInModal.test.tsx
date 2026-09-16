import React from 'react'
import { render, screen } from '@testing-library/react'
import { WhySignInModal } from './WhySignInModal'

// 自前のスタイルは #blogcomments 配下に限定してある。モーダルが既定どおり body 直下へ
// 描画されると、そのスタイルが当たらず、.modal というクラス名を埋め込み先に晒すことになる。
describe('WhySignInModal', () => {
  afterEach(() => {
    document.getElementById('blogcomments')?.remove()
  })

  it('#blogcomments があればその中に描画する', () => {
    const root = document.createElement('div')
    root.id = 'blogcomments'
    document.body.appendChild(root)

    render(<WhySignInModal isOpen onClose={() => {}} />)

    const dialog = screen.getByRole('dialog')
    expect(root.contains(dialog)).toBe(true)
    expect(root.querySelector('.modal-backdrop')).not.toBeNull()
  })

  it('#blogcomments が無ければ従来どおり描画する（読み込まれても壊れない）', () => {
    render(<WhySignInModal isOpen onClose={() => {}} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
