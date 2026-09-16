/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment($slug: String!) {
    onCreateComment(slug: $slug) {
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
      replies {
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
          replies {
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
              replies {
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
                  replies {
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
      createdAt
      updatedAt
      deletedAt
      owner
    }
  }
` as GeneratedSubscription<
  APITypes.OnCreateCommentSubscriptionVariables,
  APITypes.OnCreateCommentSubscription
>;
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment($slug: String!) {
    onUpdateComment(slug: $slug) {
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
      replies {
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
          replies {
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
              replies {
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
                  replies {
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
      createdAt
      updatedAt
      deletedAt
      owner
    }
  }
` as GeneratedSubscription<
  APITypes.OnUpdateCommentSubscriptionVariables,
  APITypes.OnUpdateCommentSubscription
>;
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment($slug: String!) {
    onDeleteComment(slug: $slug) {
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
      replies {
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
          replies {
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
              replies {
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
                  replies {
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
      createdAt
      updatedAt
      deletedAt
      owner
    }
  }
` as GeneratedSubscription<
  APITypes.OnDeleteCommentSubscriptionVariables,
  APITypes.OnDeleteCommentSubscription
>;
