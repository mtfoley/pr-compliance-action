import {type Octokit} from '@octokit/core'
import * as core from '@actions/core'
import {checkLinkedIssueLabels} from './check-linked-issue-labels'

export interface ClosingIssueReferenceEdge {
  node: {
    labels: {
      edges: {
        node: {
          name: string
        }
      }[]
    }
    number: number
  }
}

export interface QueryResult {
  repository: {
    pullRequest: {
      closingIssuesReferences: {
        edges: ClosingIssueReferenceEdge[]
      }
    }
  }
}

export interface PullLocator {
  owner: string
  pull: number
  repo: string
}

export async function checkIssueLabels(
  client: Octokit,
  locator: PullLocator,
  requiredLabels: string[]
) {
  if (!requiredLabels.length) {
    return []
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = (await client.graphql(
      `
        query ($owner: String!, $pull: Int!, $repo: String!) {
          repository(name: $repo, owner: $owner) {
            pullRequest(number: $pull) {
              closingIssuesReferences(first: 100) {
                edges {
                  node {
                    labels(first: 100) {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                    number
                  }
                }
              }
            }
          }
        }
      `,
      {owner: locator.owner, pull: locator.pull, repo: locator.repo}
    )) as QueryResult
    core.debug(`Received from GraphQL: ${JSON.stringify(result)}`)
    return checkLinkedIssueLabels(
      result.repository.pullRequest.closingIssuesReferences.edges,
      requiredLabels
    )
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    core.warning(`Failed to query linked issue labels: ${error}.`)
    return []
  }
}
