import type {ClosingIssueReferenceEdge} from './check-issue-labels'

export function checkLinkedIssueLabels(
  edges: ClosingIssueReferenceEdge[],
  requiredLabels: string[]
) {
  const errors: string[] = []

  for (const issueEdge of edges) {
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
    '- Missing required label',
    labels.length > 1 ? 's' : '',
    ` on issue #${issue}: `,
    labels.map(wrapWithTick).join(', ')
  ].join('')
}

function wrapWithTick(text: string) {
  return `\`${text}\``
}
