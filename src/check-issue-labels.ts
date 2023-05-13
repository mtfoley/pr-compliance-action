import {type Octokit} from '@octokit/core'
import * as core from '@actions/core'
import {checkLinkedIssueLabels} from './check-linked-issue-labels'

export interface QueryResult {
  data: {
    repository: {
      pullRequest: {
        closingIssuesReferences: {
          edges: {
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
          }[]
        }
      }
    }
  }
}

export async function checkIssueLabels(
  client: Octokit,
  pull: number,
  requiredLabels: string[]
) {
  if (!requiredLabels.length) {
    return []
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = (await client.graphql(
      `
    query ($pull: Int!) {
    repository(name: "template-typescript-node-package", owner: "JoshuaKGoldberg") {
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
            }
          }
          number
        }
      }
    }
  }`,
      {pull}
    )) as QueryResult
    core.debug(`Received from GraphQL: ${JSON.stringify(result)}`)
    return checkLinkedIssueLabels(result, requiredLabels)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    core.warning(`Failed to query linked issue labels: ${error}.`)
    return []
  }
}
