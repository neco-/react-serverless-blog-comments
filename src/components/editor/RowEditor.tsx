import React, { useState, useEffect } from "react"

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import MDEditor from "@uiw/react-md-editor"
import rehypeSanitize from "rehype-sanitize"

import { useStoreData } from "../../hooks/useStoreData"

export const RowEditor = ({
    inReplyTo = "",
    editingCommentId = "",
    editingComment = "",
  } : {
    inReplyTo ?: string,
    editingCommentId ?: string,
    editingComment ?: string,
  }) => {
  const [comment, setComment] = useState<string>(editingComment)
  const { editingComments, saveEditingComments } :{ editingComments: Map<string, string>, saveEditingComments: (inReplyTo: string, comment: string) => void } = useStoreData()
  const handleChangeComment = (value: string | undefined) => setComment(value ?? "")

  useEffect(() => {
    if (editingCommentId) {
      const key = "blogcomments_edit-" + editingCommentId
      saveEditingComments(key, editingComment)
    }
  // eslint-disable-next-line
  }, [])

  const handleStoreComment = () => {
    const key = editingCommentId ? "blogcomments_edit-" + editingCommentId : inReplyTo
    saveEditingComments(key, comment)
  }
  const handleLoadComment = () => {
    const key = editingCommentId ? "blogcomments_edit-" + editingCommentId : inReplyTo
    setComment(editingComments.get(key) ?? "")
  }

  // 初期値を設定/編集確定時に更新
  // react-md-editorの各種ボタンで編集したときにフォーカスが外れ、
  // その時点の内容がsaveEditingComments経由で伝搬し、
  // 再度setCommentされるため画面上ではすぐに戻され反映されないことになる
  // 編集保存はonChangeにした方がよいが、毎回LocalStorage保存するとラグがあるので、まずはローカルのsetCommentにしている
//  useEffect(() => {
//    setComment(editingComments.get(inReplyTo) ?? "")
//  }, [editingComments, inReplyTo])

  return (
    <Row>
    <Col className="p-0">
      <div data-color-mode="light">
      <MDEditor
        height={120}
        value={comment}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]]
        }}
        onBlur={handleStoreComment} // Save comments in editing when out of focus
        onFocus={handleLoadComment} // Restore an editing comments when got focus
        onChange={handleChangeComment} />
      </div>
    </Col>
    </Row>
  )
}
