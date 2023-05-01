import React from "react"

import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import { AuthContextProvider } from '../hooks/useAuth'
import { StoreDataContextProvider } from '../hooks/useStoreData'
import { Editor } from './editor/Editor'
import { Comments } from './viewer/Comments'

import { SignInModal } from "./auth/SignInModal"

export const BlogComment = () => {
  return (
    <AuthContextProvider>
      <StoreDataContextProvider>
        <Container>
        <Row className="justify-content-center mt-5">
        <Col md={10}>
          <Editor />
        </Col>
        </Row>
        <Row className="justify-content-center mt-1 ps-0 pe-0">
        <Col md={10} className="ps-0 pe-0">
          <Comments />
        </Col>
        </Row>
        <SignInModal />
        </Container>
      </StoreDataContextProvider>
    </AuthContextProvider>
  )
}
