import React, { memo } from 'react'

import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import ListGroup from 'react-bootstrap/ListGroup'
import ListGroupItem from 'react-bootstrap/ListGroupItem'

import { CommentProps } from './CommentProps'
import { Comment } from './Comment'

export const CommentThread = memo(({comments, depth = 0}: {comments: CommentProps[] , depth: number}) => {
  // Max depth is 3(0 to 2).
  if (depth > 2) return null

  return (
    <ListGroup variant="flush">
      {comments.map((comment: CommentProps) => {
        return (
          <ListGroupItem key={"commentthread-comment-" + comment.id} className={"ps-0 pe-0 ms-" + depth}>
          <Container className="pe-0">
          <Comment comment={comment} depth={depth} />
          <Row>
            <Col>
              {comment.replies.items.length > 0 && (
                <Row>
                  <Col>
                    <CommentThread comments={comment.replies.items} depth={depth + 1} />
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
          </Container>
          </ListGroupItem>
        )
      })}
    </ListGroup>
  )
})
