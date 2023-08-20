import {describe, expect, it} from '@jest/globals'
import {checkLinkedIssueLabels} from '../src/check-linked-issue-labels'

function createFakeQueryResults(...issuesLabels: string[][]) {
  return issuesLabels.map((issueLabels, i) => ({
    node: {
      labels: {
        edges: issueLabels.map(label => ({node: {name: label}}))
      },
      number: i + 1
    }
  }))
}

describe('checkLinkedIssueLabels', () => {
  it('fails when one of one required label is missing', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResults(['unrelated']),
      ['accepting prs']
    )

    expect(check).toEqual([
      '- Missing required label on issue #1: `accepting prs`'
    ])
  })

  it('fails when one of two required labels are missing', () => {
    const check = checkLinkedIssueLabels(createFakeQueryResults(['first']), [
      'first',
      'second'
    ])

    expect(check).toEqual(['- Missing required label on issue #1: `second`'])
  })

  it('fails when two of two required labels are missing', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResults(['unrelated']),
      ['first', 'second']
    )

    expect(check).toEqual([
      '- Missing required labels on issue #1: `first`, `second`'
    ])
  })

  it('passes when one required label is present', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResults(['accepting prs']),
      ['accepting prs']
    )

    expect(check).toEqual([])
  })

  it('passes when two required labels are present on a single issue', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResults(['first', 'second']),
      ['first', 'second']
    )

    expect(check).toEqual([])
  })

  it('passes when two required labels are both present on two issues', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResults(['first', 'second'], ['first', 'second']),
      ['first', 'second']
    )

    expect(check).toEqual([])
  })

  it('fails when one of two required labels is missing on one of two issues', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResults(['first'], ['first', 'second']),
      ['first', 'second']
    )

    expect(check).toEqual(['- Missing required label on issue #1: `second`'])
  })

  it('fails when one of two required labels is missing on two of two issues', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResults(['first'], ['first']),
      ['first', 'second']
    )

    expect(check).toEqual([
      '- Missing required label on issue #1: `second`',
      '- Missing required label on issue #2: `second`'
    ])
  })
})
