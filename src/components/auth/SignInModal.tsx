import React, { useState, useEffect } from 'react'

import Modal from "react-bootstrap/Modal"
import InputGroup from "react-bootstrap/InputGroup"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"

import {
  EyeFill,
  EyeSlashFill
} from "react-bootstrap-icons"

import { useAuth } from '../../hooks/useAuth'

export const SignInModal = () => {
  const { isAuthenticated, signIn, isOpenDialog, setIsOpenDialog } = useAuth()
  const [username, setName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)
  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)
  const handleSignIn = () => {
    signIn(username, password)
    setPassword("")
  }

  useEffect(() => {
    // close immediately
    if (isAuthenticated) {
      setIsOpenDialog(false)
    }
  }, [isAuthenticated, setIsOpenDialog])

  return (
    <Modal
      size="sm"
      show={isOpenDialog}
      onHide={() => setIsOpenDialog(false)}
      aria-labelledby="blogcomment-modal-authdialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Sign in
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <InputGroup size="sm">
        <InputGroup.Text id="blogcomment-auth-igt-username">Username:</InputGroup.Text>
        <Form.Control
          id="blogcomment-auth-fc-username"
          placeholder="Username"
          aria-label="Username"
          aria-describedby="Enter your username for blog account."
          onChange={handleChangeUsername}
        />
      </InputGroup>
      <InputGroup size="sm">
        <InputGroup.Text id="blogcomment-auth-igt-password">Password:</InputGroup.Text>
        <Form.Control
          id="blogcomment-auth-fc-password"
          type={isVisible ? "text" : "Password"}
          placeholder="Password"
          aria-label="Password"
          aria-describedby="Enter password for your account."
          onChange={handleChangePassword}
        />
        <Button onClick={() => {setIsVisible((prev) => !prev)}}>{isVisible ? <EyeSlashFill /> : <EyeFill />}</Button>
      </InputGroup>
      <Button className="mt-1" onClick={() => {handleSignIn()}}>Sign in</Button>
      </Modal.Body>
    </Modal>
  )
}
