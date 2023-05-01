/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createComment = /* GraphQL */ `
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        upvoters
        downvoters
        owner
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
            upvoters
            downvoters
            owner
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
                upvoters
                downvoters
                owner
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
                    upvoters
                    downvoters
                    owner
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
`;
export const updateComment = /* GraphQL */ `
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        upvoters
        downvoters
        owner
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
            upvoters
            downvoters
            owner
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
                upvoters
                downvoters
                owner
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
                    upvoters
                    downvoters
                    owner
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
`;
export const deleteComment = /* GraphQL */ `
  mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        upvoters
        downvoters
        owner
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
            upvoters
            downvoters
            owner
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
                upvoters
                downvoters
                owner
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
                    upvoters
                    downvoters
                    owner
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
`;
export const updateVotes = /* GraphQL */ `
  mutation UpdateVotes($input: UpdateVotesInput!) {
    updateVotes(input: $input) {
      id
      upvoters
      downvoters
      owner
      createdAt
      updatedAt
    }
  }
`;
export const deleteVotes = /* GraphQL */ `
  mutation DeleteVotes($input: DeleteVotesInput!) {
    deleteVotes(input: $input) {
      id
      upvoters
      downvoters
      owner
      createdAt
      updatedAt
    }
  }
`;
