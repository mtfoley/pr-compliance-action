import {describe, expect, it} from '@jest/globals'
import {checkLinkedIssueLabels} from '../src/check-linked-issue-labels'

function createFakeQueryResult(labels: string[] = []) {
  return [
    {
      node: {
        labels: {
          edges: labels.map(label => ({node: {name: label}}))
        },
        number: 1
      }
    }
  ]
}

describe('checkLinkedIssueLabels', () => {
  it('fails when one of one required label is missing', () => {
    const check = checkLinkedIssueLabels(createFakeQueryResult(), [
      'accepting prs'
    ])

    expect(check).toEqual([
      '- Missing required label on issue #1: `accepting prs`'
    ])
  })

  it('fails when one of two required labels are missing', () => {
    const check = checkLinkedIssueLabels(createFakeQueryResult(['first']), [
      'first',
      'second'
    ])

    expect(check).toEqual(['- Missing required label on issue #1: `second`'])
  })

  it('fails when two of two required labels are missing', () => {
    const check = checkLinkedIssueLabels(createFakeQueryResult(), [
      'first',
      'second'
    ])

    expect(check).toEqual([
      '- Missing required labels on issue #1: `first`, `second`'
    ])
  })

  it('passes when one required label is present', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResult(['accepting prs']),
      ['accepting prs']
    )

    expect(check).toEqual([])
  })

  it('passes when two required labels are present', () => {
    const check = checkLinkedIssueLabels(
      createFakeQueryResult(['first', 'second']),
      ['first', 'second']
    )

    expect(check).toEqual([])
  })
})
