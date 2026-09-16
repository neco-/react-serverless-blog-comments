/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const commentsBySlugAndUpdatedAt = /* GraphQL */ `
  query CommentsBySlugAndUpdatedAt(
    $slug: String!
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    commentsBySlugAndUpdatedAt(
      slug: $slug
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        slug
        displayName
        userId
        content
        siteurl
        commentVotesId
        votes {
          id
          createdAt
          updatedAt
        }
        replyTo
        replies(sortDirection: DESC) {
          items {
            id
            slug
            displayName
            userId
            content
            siteurl
            commentVotesId
            votes {
              id
              createdAt
              updatedAt
            }
            replyTo
            replies(sortDirection: DESC) {
              items {
                id
                slug
                displayName
                userId
                content
                siteurl
                commentVotesId
                votes {
                  id
                  createdAt
                  updatedAt
                }
                replyTo
                replies(sortDirection: DESC) {
                  items {
                    id
                    slug
                    displayName
                    userId
                    content
                    siteurl
                    commentVotesId
                    replyTo
                    createdAt
                    updatedAt
                    deletedAt
                    owner
                  }
                  nextToken
                }
                createdAt
                updatedAt
                deletedAt
                owner
              }
              nextToken
            }
            createdAt
            updatedAt
            deletedAt
            owner
          }
          nextToken
        }
        createdAt
        updatedAt
        deletedAt
        owner
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.CommentsBySlugAndUpdatedAtQueryVariables,
  APITypes.CommentsBySlugAndUpdatedAtQuery
>;
export const commentsByReplyToAndUpdatedAt = /* GraphQL */ `
  query CommentsByReplyToAndUpdatedAt(
    $replyTo: ID!
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    commentsByReplyToAndUpdatedAt(
      replyTo: $replyTo
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        slug
        displayName
        userId
        content
        siteurl
        commentVotesId
        votes {
          id
          createdAt
          updatedAt
        }
        replyTo
        replies(sortDirection: DESC) {
          items {
            id
            slug
            displayName
            userId
            content
            siteurl
            commentVotesId
            votes {
              id
              createdAt
              updatedAt
            }
            replyTo
            replies(sortDirection: DESC) {
              items {
                id
                slug
                displayName
                userId
                content
                siteurl
                commentVotesId
                votes {
                  id
                  createdAt
                  updatedAt
                }
                replyTo
                replies(sortDirection: DESC) {
                  items {
                    id
                    slug
                    displayName
                    userId
                    content
                    siteurl
                    commentVotesId
                    replyTo
                    createdAt
                    updatedAt
                    deletedAt
                    owner
                  }
                  nextToken
                }
                createdAt
                updatedAt
                deletedAt
                owner
              }
              nextToken
            }
            createdAt
            updatedAt
            deletedAt
            owner
          }
          nextToken
        }
        createdAt
        updatedAt
        deletedAt
        owner
      }
      nextToken
    }
  }
` as GeneratedQuery<
  APITypes.CommentsByReplyToAndUpdatedAtQueryVariables,
  APITypes.CommentsByReplyToAndUpdatedAtQuery
>;
