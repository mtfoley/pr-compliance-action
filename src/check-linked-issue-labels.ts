import {QueryResult} from './check-issue-labels'

export function checkLinkedIssueLabels(
  result: QueryResult,
  requiredLabels: string[]
) {
  const errors: string[] = []

  for (const issueEdge of result.data.repository.pullRequest
    .closingIssuesReferences.edges) {
    const issueLabels = new Set(
      issueEdge.node.labels.edges.map(labelEdge => labelEdge.node.name)
    )
    const issueMissingLabels = requiredLabels.filter(
      requiredLabel => !issueLabels.has(requiredLabel)
    )
    if (issueMissingLabels.length) {
      errors.push(formatError(issueEdge.node.number, issueMissingLabels))
    }
  }

  return errors
}

function formatError(issue: number, labels: string[]) {
  return [
    'Missing required label',
    labels.length > 1 ? 's' : '',
    ` on issue ${issue}: `,
    labels.join(', ')
  ].join('')
}
