import { checkBody, checkTitle, checkBranch } from '../src/checks'
import {expect, test} from '@jest/globals'
const templatePr = {
    number: 1,
    state: 'open',
    user: {
        login: 'octocat',
    },
    title: '',
    body: '',
    head: {ref:'',label:''},
    base: {ref:'main',label:''}
}
const badTitle = 'foo: fix stuff'
const goodTitle = 'fix: correct lint errors'
const badBody = 'should work after this change'
const goodBody = '# Fix for lint error\n\nThis PR fixes #123\n\nNo post-deploy tasks.'
const makePr = (overrides:object)=>{
    return {...templatePr,...overrides}
}
test('checkBody false on empty', () => {
    const pr = makePr({body:''})
    const regexString = '(fixes|closes) #\d+'
    const check = checkBody(pr,regexString)
    expect(check).toBeFalsy()
})
test('checkBody false on invalid issue reference', () => {
    const pr = makePr({body:badBody})
    const regexString = '(fixes|closes) #\\d+'
    const check = checkBody(pr,regexString)
    expect(check).toBeFalsy()
})
test('checkBody true on valid message with multiline', () => {
    const pr = makePr({body:goodBody})
    const regexString = '(fixes|closes) #\\d+'
    const check = checkBody(pr,regexString)
    expect(check).toBeTruthy()
})
test('checkTitle false on empty', async () => {
    const pr = makePr({title:''})
    const check = await checkTitle(pr)
    expect(check).toBeTruthy()
})
test('checkTitle true on valid title', async () => {
    const pr = makePr({title:goodTitle})
    const check = await checkTitle(pr)
    expect(check).toBeTruthy()
})
test('checkTitle false on invalid title', async () => {
    const pr = makePr({title:badTitle})
    const check = await checkTitle(pr)
    expect(check).toBeFalsy()
})
test('checkBranch false on protected branch', () => {
    const pr = makePr({head:{ref:'main',label:'octokit:main'}})
    const check = checkBranch(pr,'main')
    expect(check).toBeFalsy()
})
test('checkBranch true on string other than protected branch', () => {
    const pr = makePr({head:{ref:'1234-fix-weird-bug',label:'octokit:123-fix-weird-bug'}})
    const check = checkBranch(pr,'main')
    expect(check).toBeTruthy()
})
