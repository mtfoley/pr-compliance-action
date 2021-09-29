import { checkBody, checkTitle, checkBranch } from '../src/checks'
import {expect, test} from '@jest/globals'
const badTitle = 'foo: fix stuff'
const goodTitle = 'fix: correct lint errors'
const badBody = 'should work after this change'
const goodBody = '# Fix for lint error\n\nThis PR fixes #123\n\nNo post-deploy tasks.'
test('checkBody false on empty', () => {
    const regexString = '(fixes|closes) #\d+'
    const check = checkBody('',regexString)
    expect(check).toBeFalsy()
})
test('checkBody false on invalid issue reference', () => {
    const regexString = '(fixes|closes) #\\d+'
    const check = checkBody(badBody,regexString)
    expect(check).toBeFalsy()
})
test('checkBody true on valid message with multiline', () => {
    const regexString = '(fixes|closes) #\\d+'
    const check = checkBody(goodBody,regexString)
    expect(check).toBeTruthy()
})
test('checkTitle false on empty', async () => {
    const check = await checkTitle('')
    expect(check).toBeTruthy()
})
test('checkTitle true on valid title', async () => {
    const check = await checkTitle(goodTitle)
    expect(check).toBeTruthy()
})
test('checkTitle false on invalid title', async () => {
    const check = await checkTitle(badTitle)
    expect(check).toBeFalsy()
})
test('checkBranch false on protected branch', () => {
    const check = checkBranch('main','main')
    expect(check).toBeFalsy()
})
test('checkBranch true on string other than protected branch', () => {
    const check = checkBranch('1234-fix-weird-bug','main')
    expect(check).toBeTruthy()
})
