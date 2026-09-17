import React, { useState, useEffect } from "react"
import styled from 'styled-components'

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Image from "react-bootstrap/Image"
import Button from "react-bootstrap/Button"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import {
  SendFill,
  BoxArrowRight,
  Google,
  Github,
  QuestionCircle,
} from "react-bootstrap-icons"

import { WhySignInModal } from "./WhySignInModal"
import { CheckStoreData } from "./CheckStoreData"

import { useApiClient } from '../../lib/clients'
import { createComment, updateComment } from '../../graphql/mutations'
import { CreateCommentMutationVariables, UpdateCommentMutationVariables } from '../../API'

import {
  ENABLED_OAUTH_ORIGINAL,
  ENABLED_OAUTH_GOOGLE,
  ENABLED_OAUTH_LINE,
  ENABLED_OAUTH_GITHUB,
} from "../../config"
import { useAuth } from "../../hooks/useAuth"
import { useStoreData } from "../../hooks/useStoreData"
import { useSlug } from "../../hooks/useSlug"
import { useSignInGoogleModal } from "../../hooks/useSignInGoogleModal"
import { useConfirmBand } from "../../hooks/useConfirmBand"

import lineSignIn from '../../images/line_login.png'
import lineSignInHover from '../../images/line_login_hover.png'
import lineSignInPress from '../../images/line_login_press.png'
import { getWidgetRoot } from '../../lib/widgetRoot'

const StyledPrimaryButton = styled(Button).attrs({
  className: "btn m-1 bc-oauth-button"
})``

const OnLineImage = ({onClick}: {onClick: () => void}) => {
  const [hover, setHover] = useState(false)
  const [press, setPress] = useState(false)
  return (
    <div
      className="m-1 bc-oauth-button bc-oauth-line"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setPress(false)
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onClick={() => onClick()}
    >
      <img alt="Sign in with LINE" src={press ? lineSignInPress : hover ? lineSignInHover : lineSignIn} />
    </div>
  )
}

export const RowFooter = ({
    inReplyTo = "",
    editingCommentId = "",
    closeEditor = () => {},
  } : {
    inReplyTo?:string,
    editingCommentId?:string,
    closeEditor?:()=>void,
  }) => {
  const { isAuthenticated, setIsOpenDialog, signInWithLine, displayName, signOut, signInErrorMessage } = useAuth()
  const { username, siteURL, editingComments, isStored, saveStoreData, removeStoreData, setUsername, clearEditingComments } = useStoreData()
  const { slug } = useSlug()
  const { SignInGoogleModal, openSignInGoogleModal } = useSignInGoogleModal()
  const apiClient = useApiClient()

  // ログアウトの確認は、アイコンの位置から右へ伸びる帯で行う（削除と同じ仕掛け）
  const { isOpen: isConfirmOpen, open: openConfirm, startClosing, bandProps, coveredProps } = useConfirmBand()

  const [isOpenWhyModal, setIsOpenWhyModal] = useState<boolean>(false)
  const handleCloseWhySignInModal = () => setIsOpenWhyModal(false)
  const handleOpenWhySingInModal = () => setIsOpenWhyModal(true)

  const handleOpenSignInModal = () => setIsOpenDialog(true)

  const [validationErrorMessage, setValidationErrorMessage] = useState<string>("")

  const isEditing = !!editingCommentId

  useEffect(() => {
    if (isAuthenticated && username === "" && displayName !== "") {
      setUsername(displayName)
    }
  }, [username, setUsername, isAuthenticated, displayName])

  const handleCancel = () => {closeEditor()}
  const handleSend = () => {
    // input username is empty
    if (!username) {
      setValidationErrorMessage("Name is empty.")
      return
    }

    const key = isEditing ? "blogcomments_edit-" + editingCommentId : inReplyTo
    const val: string = editingComments.get(key) ?? ""
    if (!val) {
      setValidationErrorMessage("comment is empty.")
      return
    }
    setValidationErrorMessage("")

    // TODO: validate input

    if (isStored) {
      saveStoreData()
    } else {
      removeStoreData()
    }

    if (!isEditing) {
      const createRequest = async () => {
        const createCommentInput: CreateCommentMutationVariables = {
          input: {
            content: val,
            displayName: username,
            slug: slug
          }
        }
        if (inReplyTo) {
          createCommentInput['input']['replyTo'] = inReplyTo
        }
        if (siteURL) {
          createCommentInput['input']['siteurl'] = siteURL
        }
        await apiClient.mutate(createComment, createCommentInput)
        clearEditingComments(key)
        closeEditor()
      }
      createRequest()
    } else {
      const updateRequest = async () => {
        const updateCommentInput: UpdateCommentMutationVariables = {
          input: {
            id: editingCommentId,
            content: val,
            displayName: username,
          }
        }
        if (siteURL) {
          updateCommentInput['input']['siteurl'] = siteURL
        }
        await apiClient.mutate(updateComment, updateCommentInput)
        clearEditingComments(key)
        closeEditor()
      }
      updateRequest()
    }
  }

  const yetTooltip = (props: any) => (
    <Tooltip {...props}>
      Not yet implemented.
    </Tooltip>
  )
  const signOutTooltip = (props: any) => (
    <Tooltip {...props}>
      Sign out
    </Tooltip>
  )
  const SignOutButton = () => (
    <OverlayTrigger
      container={getWidgetRoot}
      placement="top"
      delay={{ show: 150, hide: 300 }}
      overlay={signOutTooltip}
    >
      <Button variant="secondary" aria-label="SignOut" onClick={openConfirm}><BoxArrowRight style={{display:"flex", alignItems:"end"}} /></Button>
    </OverlayTrigger>
  )
  if (isAuthenticated) {
    return (
      <Row className="footer">
        <div className="mb-1" style={{display:"flex", alignItems:"end"}}>
          <CheckStoreData />
          <div className="mt-1" style={{display:"flex", justifyContent:"right", width:"inherit"}}>
            {validationErrorMessage &&
              <div className="mb-1" style={{color:"var(--bc-danger)", display:"flex", alignItems:"end"}}>
                {validationErrorMessage}
              </div>
            }
            {/* ms-3 は帯の起点になる側に置く。先頭のボタンに付けると、その分だけ
                帯が左へはみ出して何も無いところから伸びて見える */}
            <div className="bc-actions ms-3">
              {/* 通常の操作。確認中は帯の下に残るが、inert で押せなくする */}
              <div className="bc-actions-row" aria-label="Footer actions" {...coveredProps}>
                {(inReplyTo || isEditing)
                  ? <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                  : <SignOutButton />}
                <Button className="ms-3" onClick={handleSend}><SendFill /> Send</Button>
              </div>
              {/* ログアウトも押し直しが効かないので、アイコンの 1 タップでは実行せず
                  その場で確定を求める。帯はアイコンの位置から右へ伸びて Send を覆う */}
              {isConfirmOpen &&
                <ButtonGroup {...bandProps('bc-confirm-signout')} aria-label="Menu confirm signout">
                  <Button variant="danger" className="bc-confirm-to-danger" aria-label="Confirm sign out" onClick={signOut}><BoxArrowRight /> Sign out</Button>
                  <Button variant="secondary" aria-label="Cancel sign out" autoFocus onClick={startClosing}>Cancel</Button>
                </ButtonGroup>
              }
            </div>
          </div>
        </div>
      </Row>
    )
  } else {
    return (
      <Row className="footer">
      {/* 幅いっぱいの行にしてボタンの上に出す。ボタンと同じ行に入れると狭い画面で 1 文字ずつ折り返す */}
      {signInErrorMessage &&
        <div className="mb-1" role="alert" style={{color:"var(--bc-danger)", textAlign:"right"}}>
          {signInErrorMessage}
        </div>
      }
      <Col md={4} style={{display:"flex", justifyContent:"left"}}>
        <div className="mb-1" style={{display:"flex", alignItems:"end"}}>
          <CheckStoreData />
        </div>
      </Col>
      <Col md={8} style={{display:"flex", justifyContent:"right"}}>
        <WhySignInModal isOpen={isOpenWhyModal} onClose={handleCloseWhySignInModal}/>
        <SignInGoogleModal />
        {/* 16px のアイコンだけを狙わせない。文言全体を当たり判定にする（見た目は文字のまま） */}
        <button type="button" className="bc-why-signin" aria-label="Why sign in?" onClick={handleOpenWhySingInModal}>comment with <QuestionCircle />:</button>
        {ENABLED_OAUTH_ORIGINAL ? <StyledPrimaryButton onClick={handleOpenSignInModal}><Image roundedCircle src="/favicon-32x32.png" /></StyledPrimaryButton > : null}
        {ENABLED_OAUTH_GOOGLE ? <Button className="m-1 bc-oauth-button" variant="primary" aria-label="Google SignIn" onClick={() => openSignInGoogleModal()}><Google /></Button> : null}
        {ENABLED_OAUTH_LINE ? <OnLineImage onClick={() => signInWithLine()} /> : null}

        {ENABLED_OAUTH_GITHUB ?
        <OverlayTrigger
          container={getWidgetRoot}
          placement="top"
          delay={{ show: 150, hide: 300 }}
          overlay={yetTooltip}
        >
          <div className="d-inline-block" style={{display:"flex"}}>
            <Button className="m-1 bc-oauth-button" style={{ pointerEvents: 'none' }} aria-label="Github SignIn" variant="primary" onClick={() => {}} disabled><Github /></Button>
          </div>
        </OverlayTrigger>
        : null}
      </Col>
      </Row>
    )
  }
}
