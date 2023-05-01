import React, { useState, useEffect } from "react"
import styled from 'styled-components'

import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Image from "react-bootstrap/Image"
import Button from "react-bootstrap/Button"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import {
  SendFill,
  BoxArrowUpRight,
  Google,
  Facebook,
  QuestionCircle,
} from "react-bootstrap-icons"
import "./footer.css"

import { WhySignInModal } from "./WhySignInModal"
import { CheckStoreData } from "./CheckStoreData"

import { API } from 'aws-amplify'
import { createComment, updateComment } from '../../graphql/mutations'
import { CreateCommentMutationVariables, UpdateCommentMutationVariables } from '../../API'

import { useAuth } from "../../hooks/useAuth"
import { useStoreData } from "../../hooks/useStoreData"
import { useSlug } from "../../hooks/useSlug"
import { useSignInGoogleModal } from "../../hooks/useSignInGoogleModal"

import {
  ENABLED_OAUTH_ORIGINAL,
  ENABLED_OAUTH_GOOGLE,
  ENABLED_OAUTH_FACEBOOK,
  ENABLED_OAUTH_LINE
} from "../../config"

import lineSignIn from '../../images/line_login.png'
import lineSignInHover from '../../images/line_login_hover.png'
import lineSignInPress from '../../images/line_login_press.png'

const StyledPrimaryButton = styled(Button).attrs({
  className: "btn m-1"
})``

const OnLineImage = ({onClick}: {onClick: () => void}) => {
  const [hover, setHover] = useState(false)
  const [press, setPress] = useState(false)
  return (
    <div
      className="m-1"
      style={{display: "flex", justifyContent: "center", cursor: "pointer", width: "40px", height: "40px"}}
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
  const { isAuthenticated, setIsOpenDialog, signInWithFacebook, signInWithLine, displayName, signOut } = useAuth()
  const { username, siteURL, editingComments, isStored, saveStoreData, removeStoreData, setUsername, clearEditingComments } = useStoreData()
  const { slug } = useSlug()
  const { SignInGoogleModal, openSignInGoogleModal } = useSignInGoogleModal()

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
        await API.graphql({
          query: createComment,
          variables: createCommentInput,
          authMode: 'AMAZON_COGNITO_USER_POOLS'
        })
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
        await API.graphql({
          query: updateComment,
          variables: updateCommentInput,
          authMode: 'AMAZON_COGNITO_USER_POOLS'
        })
        clearEditingComments(key)
        closeEditor()
      }
      updateRequest()
    }
  }

  const signOutTooltip = (props: any) => (
    <Tooltip {...props}>
      Sign out
    </Tooltip>
  )
  const SignOutButton = () => (
    <OverlayTrigger
      placement="top"
      delay={{ show: 150, hide: 300 }}
      overlay={signOutTooltip}
    >
      <Button className="ms-3" variant="secondary" aria-label="SignOut" onClick={signOut}><BoxArrowUpRight style={{display:"flex", alignItems:"end"}} /></Button>
    </OverlayTrigger>
  )
  if (isAuthenticated) {
    return (
      <Row className="footer">
        <div className="mb-1" style={{display:"flex", alignItems:"end"}}>
          <CheckStoreData />
          <div className="mt-1" style={{display:"flex", justifyContent:"right", width:"inherit"}}>
            {validationErrorMessage &&
              <div className="mb-1" style={{color:"red", display:"flex", alignItems:"end"}}>
                {validationErrorMessage}
              </div>
            }
            {(inReplyTo || isEditing)
              ? <Button className="ms-3" variant="secondary" onClick={handleCancel}>Cancel</Button>
              : <SignOutButton />}
            <Button className="ms-1" onClick={handleSend}><SendFill /> Send</Button>
          </div>
        </div>
      </Row>
    )
  } else {
    return (
      <Row className="footer">
      <Col md={4} style={{display:"flex", justifyContent:"left"}}>
        <div className="mb-1" style={{display:"flex", alignItems:"end"}}>
          <CheckStoreData />
        </div>
      </Col>
      <Col md={8} style={{display:"flex", justifyContent:"right"}}>
        <WhySignInModal isOpen={isOpenWhyModal} onClose={handleCloseWhySignInModal}/>
        <SignInGoogleModal />
        <div className="mb-1" style={{display:"flex", alignItems:"end", fontWeight:500}}>comment with <QuestionCircle className="mb-1" style={{cursor:"pointer"}} onClick={handleOpenWhySingInModal} />:</div>
        {ENABLED_OAUTH_ORIGINAL ? <StyledPrimaryButton onClick={handleOpenSignInModal}><Image roundedCircle src="/favicon-32x32.png" /></StyledPrimaryButton >: null}
        {ENABLED_OAUTH_FACEBOOK ? <Button className="m-1" variant="primary" aria-label="Facebook SignIn" onClick={() => signInWithFacebook()}><Facebook /></Button> : null}
        {ENABLED_OAUTH_GOOGLE ? <Button className="m-1" variant="primary" aria-label="Google SignIn" onClick={() => openSignInGoogleModal()}><Google /></Button> : null}
        {ENABLED_OAUTH_LINE ? <OnLineImage onClick={() => signInWithLine()} /> : null}
      </Col>
      </Row>
    )
  }
}
