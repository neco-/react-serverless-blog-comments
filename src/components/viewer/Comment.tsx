import React, { memo, useState, useEffect } from 'react'

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

export const Comment = memo(({comment, depth}:{comment: CommentProps, depth: number}) => {
  const { isAuthenticated, setIsOpenDialog, username } = useAuth()
  const colorScheme = useColorScheme()
  const apiClient = useApiClient()
  const [isOpenReplyEditor, setIsOpenReplyEditor] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)

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
      // sign in with scrum-cjgg
      setIsOpenReplyEditor(false)
      setIsOpenDialog(true)
    }
  }

  const handleDeleteComment = (id: string) => {
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
  const timestamp = new Date(comment.updatedAt).toLocaleString()
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
            <div style={{fontWeight:300}}>{timestamp} {edited}</div>
          </Row>
        </Col>
        <Col style={{display:"flex", justifyContent:"right", alignSelf:"flex-start"}}>
        {isEditable &&
          <ButtonGroup className="me-2" aria-label="Menu edit">
            <Button variant="success" size="sm" onClick={() => handleOpenEdit()}><PencilSquare /></Button>
          </ButtonGroup>
        }
        {isEditable &&
          <ButtonGroup className="me-2" aria-label="Menu delete">
            <Button variant="danger" size="sm" onClick={() => handleDeleteComment(comment.id)}><Trash /></Button>
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
