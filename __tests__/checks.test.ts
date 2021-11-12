import {checkBody, checkTitle, checkBranch} from '../src/checks'
import {expect, test} from '@jest/globals'
const badTitle = 'foo: fix stuff'
const goodTitle = 'fix: correct lint errors'
const badBody = 'should work after this change'
const commentedBadBody = `
## Related Tickets & Documents
<!-- 
Please use this format link issue numbers: Fixes #123
https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword 
-->

No issue, just passing thru.
`
const goodBody =
  '# Fix for lint error\n\nThis PR fixes #123\n\nNo post-deploy tasks.'
test('checkBody false on empty', () => {
  const regexString = '(fixes|closes) #d+'
  const check = checkBody('', regexString)
  expect(check).toBeFalsy()
})
test('checkBody false on invalid issue reference', () => {
  const regexString = '(fixes|closes) #\\d+'
  const check = checkBody(badBody, regexString)
  expect(check).toBeFalsy()
})
test('checkBody false when valid issue reference is inside comment', () => {
  const regexString = '(fixes|closes) #\\d+'
  const check = checkBody(commentedBadBody, regexString)
  expect(check).toBeFalsy()
})
test('checkBody true on valid message with multiline', () => {
  const regexString = '(fixes|closes) #\\d+'
  const check = checkBody(goodBody, regexString)
  expect(check).toBeTruthy()
})
test('checkTitle false on empty', async () => {
  const {valid, errors} = await checkTitle('')
  expect(valid).toBeFalsy()
  expect(errors.length).toBeGreaterThan(0)
  expect(errors[0]).toHaveProperty('message')
  expect(errors[0]).toHaveProperty('valid')
})
test('checkTitle true on valid title', async () => {
  const {valid, errors} = await checkTitle(goodTitle)
  expect(valid).toBeTruthy()
  expect(errors).toHaveLength(0)
})
test('checkTitle false on invalid title', async () => {
  const {valid, errors} = await checkTitle(badTitle)
  expect(valid).toBeFalsy()
  expect(errors.length).toBeGreaterThan(0)
  expect(errors[0]).toHaveProperty('message')
  expect(errors[0]).toHaveProperty('valid')
})
test('checkBranch false on protected branch', () => {
  const check = checkBranch('main', 'main')
  expect(check).toBeFalsy()
})
test('checkBranch true on string other than protected branch', () => {
  const check = checkBranch('1234-fix-weird-bug', 'main')
  expect(check).toBeTruthy()
})
