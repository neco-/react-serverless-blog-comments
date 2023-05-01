import { useState, useEffect, useCallback } from 'react'

import { API, GraphQLQuery, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import { CommentsBySlugAndUpdatedAtQuery } from '../API'
import { commentsBySlugAndUpdatedAt } from '../graphql/queries'

import { useAuth } from "./useAuth"
import { useSlug } from "./useSlug"

export const useComments = () => {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState([])
  const { slug } = useSlug()

  const getComments = useCallback(async () => {
    console.log("useComment Hook")
    if (!slug) return
    try {
      const result = await API.graphql<GraphQLQuery<CommentsBySlugAndUpdatedAtQuery>>({
        query: commentsBySlugAndUpdatedAt,
        variables: {
          slug: slug,
          filter: {
            replyTo: {
              attributeExists: false
            }
          },
          sortDirection: "DESC"
        },
        authMode: isAuthenticated ? GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS : GRAPHQL_AUTH_MODE.AWS_IAM
      })
      const items: any = result?.data?.commentsBySlugAndUpdatedAt?.items
      setComments(items)
    } catch (error) {
      console.error(error)
    }
  }, [isAuthenticated, slug])

  useEffect(() => {
    getComments()
  }, [getComments])

  return {
    comments,
    getComments,
  }
}
