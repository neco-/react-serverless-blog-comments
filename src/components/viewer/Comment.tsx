import React, { memo, useState, useEffect } from 'react'

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import { useApiClient } from '../../lib/clients'
import { deleteComment } from '../../graphql/mutations'
import { errorMessage } from '../../lib/errorMessage'
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
import { useConfirmBand } from "../../hooks/useConfirmBand"
import { CommentProps } from './CommentProps'
import { getWidgetRoot } from '../../lib/widgetRoot'

// 削除に失敗したが、理由を読者に見せられないときの文言。
// Lambda が印を付けて返した理由があればそちらを出す（src/lib/errorMessage.ts）。
export const DELETE_ERROR_MESSAGE = "Failed to delete. Please try again."

// 削除と編集はアイコンだけなので、重ねたときに何のボタンかを文言で出す。
// Reply は文字が出ているので付けない。描画先とためは VoteHeart / RowFooter と揃える
const ActionTooltip = ({label, children}:{label: string, children: React.ReactElement}) => (
  <OverlayTrigger
    container={getWidgetRoot}
    placement="top"
    delay={{ show: 150, hide: 300 }}
    overlay={(props: any) => <Tooltip {...props}>{label}</Tooltip>}
  >
    {children}
  </OverlayTrigger>
)

export const Comment = memo(({comment, depth}:{comment: CommentProps, depth: number}) => {
  const { isAuthenticated, setIsOpenDialog, username } = useAuth()
  const colorScheme = useColorScheme()
  const apiClient = useApiClient()
  const [isOpenReplyEditor, setIsOpenReplyEditor] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("")
  // 削除の確認は、ゴミ箱の位置から右へ伸びる帯で行う。閉じるときは逆向きに縮む
  const { isOpen: isConfirmOpen, open: openConfirm, close: closeConfirm, startClosing, bandProps, coveredProps } = useConfirmBand()

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
    closeConfirm()
    setIsEditing(false)
    setDeleteErrorMessage("")
    const sendRequest = async () => {
      const deleteCommentInput: DeleteCommentMutationVariables = {
        input: {
          id
        }
      }
      try {
        await apiClient.mutate(deleteComment, deleteCommentInput)
      } catch (err) {
        // 成功すれば購読が消えた状態を運んでくるので、ここで出るのは失敗したときだけ。
        // 何も出さないと、押したのに消えない理由が読者に分からない
        setDeleteErrorMessage(errorMessage(err, DELETE_ERROR_MESSAGE))
      }
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
        {/* 操作の列と、その下に出る失敗の理由。縦に積むので右そろえは alignItems で行う */}
        <Col style={{display:"flex", flexDirection:"column", alignItems:"flex-end", alignSelf:"flex-start"}}>
        <div className="bc-actions">
          {/* 通常の操作。確認中は帯の下に残るが、inert で押せなくする */}
          <div className="bc-actions-row" aria-label="Menu actions" {...coveredProps}>
            {isEditable &&
              <ButtonGroup className="me-2" aria-label="Menu delete">
                <ActionTooltip label="Delete">
                  <Button variant="danger" size="sm" aria-label="Delete" onClick={openConfirm}><Trash /></Button>
                </ActionTooltip>
              </ButtonGroup>
            }
            {isEditable &&
              <ButtonGroup className="me-2" aria-label="Menu edit">
                <ActionTooltip label="Edit">
                  <Button variant="success" size="sm" aria-label="Edit" onClick={() => handleOpenEdit()}><PencilSquare /></Button>
                </ActionTooltip>
              </ButtonGroup>
            }
            {depth < 2 &&
              <ButtonGroup className="me-2" aria-label="Menu reply">
                <Button variant="success" size="sm" onClick={handleOpenReply}>Reply</Button>
              </ButtonGroup>
            }
            <ButtonGroup aria-label="Menu votes">
              <VoteHeart votes={comment.votes} />
            </ButtonGroup>
          </div>
          {/* 削除は復元できないので、ゴミ箱の 1 タップでは消さず、その場で確定を求める。
              帯はゴミ箱の左端から右へ伸びて他のボタンを覆い、Delete と Cancel を同じ幅で出す */}
          {isConfirmOpen &&
            <ButtonGroup {...bandProps('bc-confirm-delete')} aria-label="Menu confirm delete">
              <Button variant="danger" size="sm" aria-label="Confirm delete" onClick={() => handleDeleteComment(comment.id)}><Trash /> Delete</Button>
              <Button variant="secondary" size="sm" aria-label="Cancel delete" autoFocus onClick={startClosing}>Cancel</Button>
            </ButtonGroup>
          }
        </div>
        {deleteErrorMessage &&
          <div className="bc-delete-error">{deleteErrorMessage}</div>
        }
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
