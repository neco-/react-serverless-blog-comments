import React from "react"

import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import { AuthContextProvider } from '../hooks/useAuth'
import { StoreDataContextProvider } from '../hooks/useStoreData'
import { VotesContextProvider } from '../hooks/useVotes'
import { Editor } from './editor/Editor'
import { Comments } from './viewer/Comments'

import { SignInModal } from "./auth/SignInModal"

// ウィジェット自身のスタイル。埋め込み先に Bootstrap の読み込みを要求しないため、
// react-bootstrap が出力するクラスの見た目をここで賄う（#blogcomments 配下に限定）。
import "../styles/blogcomments.css"

export const BlogComment = () => {
  return (
    <AuthContextProvider>
      <StoreDataContextProvider>
      <VotesContextProvider>
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
      </VotesContextProvider>
      </StoreDataContextProvider>
    </AuthContextProvider>
  )
}
