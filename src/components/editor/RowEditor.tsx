import React, { useState, useEffect, useRef } from "react"

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import MDEditor from "@uiw/react-md-editor"
import "@uiw/react-md-editor/markdown-editor.css"
import rehypeSanitize from "rehype-sanitize"

import { useStoreData } from "../../hooks/useStoreData"
import { useColorScheme } from "../../hooks/useColorScheme"

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
  const colorScheme = useColorScheme()

  const key = editingCommentId ? "blogcomments_edit-" + editingCommentId : inReplyTo

  useEffect(() => {
    if (editingCommentId) {
      saveEditingComments(key, editingComment)
    }
  // eslint-disable-next-line
  }, [])

  // 送信が成功すると RowFooter が共有 state を空にクリアするので、ローカルの本文も空にする。
  // 値そのものではなく「空へ変わったこと」だけを見るため、他のエディタの保存で
  // Map が作り直されても入力中の本文は巻き戻らない
  const storedComment = editingComments.get(key)
  const previousStoredComment = useRef<string | undefined>(storedComment)
  useEffect(() => {
    if (previousStoredComment.current !== "" && storedComment === "") {
      setComment("")
    }
    previousStoredComment.current = storedComment
  }, [storedComment])

  const handleStoreComment = () => saveEditingComments(key, comment)
  const handleLoadComment = () => setComment(editingComments.get(key) ?? "")

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
      <div data-color-mode={colorScheme}>
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
