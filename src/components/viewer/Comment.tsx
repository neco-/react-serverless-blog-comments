import React, { memo, useState, useEffect, useRef } from 'react'

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

import { useApiClient } from '../../lib/clients'
import { deleteComment } from '../../graphql/mutations'
import { DeleteCommentMutationVariables } from '../../API'

import { PencilSquare, Link45deg, Trash } from 'react-bootstrap-icons'
import { Editor } from '../editor/Editor'
import { Avatar } from './Avatar'
import { VoteHeart } from './VoteHeart'

import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-markdown-preview/markdown.css';
import rehypeSanitize from "rehype-sanitize"

import { useAuth } from "../../hooks/useAuth"
import { useColorScheme } from "../../hooks/useColorScheme"
import { CommentProps } from './CommentProps'

// 確認の帯が伸び縮みする時間。CSS の bc-confirm-grow / bc-confirm-shrink と揃える
export const CONFIRM_ANIMATION_MS = 150

export const Comment = memo(({comment, depth}:{comment: CommentProps, depth: number}) => {
  const { isAuthenticated, setIsOpenDialog, username } = useAuth()
  const colorScheme = useColorScheme()
  const apiClient = useApiClient()
  const [isOpenReplyEditor, setIsOpenReplyEditor] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  // 削除の確認は、ゴミ箱の位置から右へ伸びる帯で行う。閉じるときは逆向きに縮む
  const [confirmPhase, setConfirmPhase] = useState<'closed' | 'open' | 'closing'>('closed')
  const closeTimer = useRef<number | undefined>(undefined)
  const finishClosing = () => {
    window.clearTimeout(closeTimer.current)
    setConfirmPhase('closed')
  }
  const startClosing = () => {
    setConfirmPhase('closing')
    // animationend が来ない環境（動きを減らす設定、テスト）でも必ず閉じる
    closeTimer.current = window.setTimeout(finishClosing, CONFIRM_ANIMATION_MS + 50)
  }
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  useEffect(() => {
    setIsOpenReplyEditor(false)
    setIsEditing(false)
  }, [isAuthenticated])

  const handleOpenEdit = () => {
    if (isAuthenticated) {
      setIsOpenReplyEditor(false)
      setIsEditing(prev => !prev)
    }
  }

  const handleOpenReply = () => {
    if (isAuthenticated) {
      setIsOpenReplyEditor(prev => !prev)
      setIsEditing(false)
    } else {
      // 未ログインならログインダイアログを開く
      setIsOpenReplyEditor(false)
      setIsOpenDialog(true)
    }
  }

  const handleDeleteComment = (id: string) => {
    finishClosing()
    setIsEditing(false)
    const sendRequest = async () => {
      const deleteCommentInput: DeleteCommentMutationVariables = {
        input: {
          id
        }
      }
      await apiClient.mutate(deleteComment, deleteCommentInput)
    }
    sendRequest()
  }

  const edited = !comment.deletedAt && comment.updatedAt !== comment.createdAt ? "(edited)" : ""
  // 秒まで出すとスマホ幅で日時が 2 行に折れる。分で十分
  const timestamp = new Date(comment.updatedAt).toLocaleString(undefined, {
    year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const content = (comment.content && comment.content !== "") ? comment.content : "(Deleted)"
  const isEditable = isAuthenticated && !comment.deletedAt && (comment.userId === username)
  const SiteURL = () => {
    let siteurl = comment.siteurl
    if (siteurl) {
      if (!siteurl.startsWith("http")) siteurl = "https://" + siteurl 
      return <a href={siteurl} target="_blank" rel="noreferrer"><Link45deg /></a>
    }
    return null
  }

  return (
    <>
      <Row>
        <Col xs={2} sm={2} md="auto">
          <Avatar name={comment.displayName} />
        </Col>
        <Col style={{display:"center", alignItems:"end"}}>
          <Row>
            <div style={{fontWeight:700}}>{comment.displayName} <SiteURL /></div>
          </Row>
          <Row>
            <div className="bc-timestamp" style={{fontWeight:300}}>{timestamp} {edited}</div>
          </Row>
        </Col>
        <Col style={{display:"flex", justifyContent:"right", alignSelf:"flex-start"}}>
        <div className="bc-actions">
          {/* 通常の操作。確認中は帯の下に残るが、inert で押せなくする */}
          <div className="bc-actions-row" aria-label="Menu actions" inert={confirmPhase !== 'closed' || undefined}>
            {isEditable &&
              <ButtonGroup className="me-2" aria-label="Menu delete">
                <Button variant="danger" size="sm" aria-label="Delete" onClick={() => setConfirmPhase('open')}><Trash /></Button>
              </ButtonGroup>
            }
            {isEditable &&
              <ButtonGroup className="me-2" aria-label="Menu edit">
                <Button variant="success" size="sm" onClick={() => handleOpenEdit()}><PencilSquare /></Button>
              </ButtonGroup>
            }
            {depth < 2 &&
              <ButtonGroup className="me-2" aria-label="Menu reply">
                <Button variant="success" size="sm" onClick={handleOpenReply}>reply</Button>
              </ButtonGroup>
            }
            <ButtonGroup aria-label="Menu votes">
              <VoteHeart votes={comment.votes} />
            </ButtonGroup>
          </div>
          {/* 削除は復元できないので、ゴミ箱の 1 タップでは消さず、その場で確定を求める。
              帯はゴミ箱の左端から右へ伸びて他のボタンを覆い、Delete と Cancel を同じ幅で出す */}
          {confirmPhase !== 'closed' &&
            <ButtonGroup
              className={"bc-confirm-delete" + (confirmPhase === 'closing' ? " bc-closing" : "")}
              aria-label="Menu confirm delete"
              onAnimationEnd={() => { if (confirmPhase === 'closing') finishClosing() }}
              onKeyDown={(e) => { if (e.key === 'Escape') startClosing() }}
            >
              <Button variant="danger" size="sm" aria-label="Confirm delete" disabled={confirmPhase === 'closing'} onClick={() => handleDeleteComment(comment.id)}><Trash /> Delete</Button>
              <Button variant="secondary" size="sm" aria-label="Cancel delete" autoFocus disabled={confirmPhase === 'closing'} onClick={startClosing}>Cancel</Button>
            </ButtonGroup>
          }
        </div>
        </Col>
      </Row>
      <Row>
        <Col>
          {isEditable && isEditing && !isOpenReplyEditor 
          ? <Editor editingCommentId={comment.id} editingComment={content} closeEditor={() => setIsEditing(false)} />
          : <MarkdownPreview
              source={content}
              // 他人が書いた本文をそのまま描画する場所なので必須。
              // react-markdown-preview は既定で rehype-raw を通し、生 HTML を描画する。
              // React が on* 属性と javascript: URL を落とすのでスクリプトは動かないが、
              // iframe / form / style / base / object は素通りし、フィッシングや
              // クリックジャッキング、埋め込み先の相対リンク乗っ取りに使える。
              // 編集中のプレビュー (RowEditor.tsx) にも同じ指定がある。
              rehypePlugins={[[rehypeSanitize]]}
              wrapperElement={{
                "data-color-mode": colorScheme
              }}
              components={{
                code({node, className, children, ...props}) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            />
          }
          {isOpenReplyEditor ? <Editor inReplyTo={comment.id} closeEditor={() => setIsOpenReplyEditor(false)} /> : null}
        </Col>
      </Row>
    </>
  )
})
