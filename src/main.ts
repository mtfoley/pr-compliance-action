import * as core from '@actions/core'
import * as github from '@actions/github'
import {context} from '@actions/github/lib/utils'
import {checkBody, checkTitle, checkBranch} from './checks'

const repoToken = core.getInput('repo-token', {required: true})
const ignoreAuthors = core.getMultilineInput('ignore-authors')
const baseComment = core.getInput('base-comment')
const bodyRegexInput = core.getInput('body-regex')
const bodyAutoClose = core.getBooleanInput('body-auto-close')
const bodyComment = core.getInput('body-comment')
const protectedBranch = core.getInput('protected-branch')
const protectedBranchAutoClose = core.getBooleanInput(
  'protected-branch-auto-close'
)
const protectedBranchComment = core.getInput('protected-branch-comment')
const titleComment = core.getInput('title-comment')
const titleCheckEnable = core.getBooleanInput('title-check-enable')
const filesToWatch = core.getMultilineInput('watch-files')
const watchedFilesComment = core.getInput('watch-files-comment')
const client = github.getOctokit(repoToken)
async function run(): Promise<void> {
  try {
    const ctx = github.context
    const pr = ctx.issue
    const isDraft = (ctx.payload.pull_request?.draft ?? false) === true
    const repoOrg = context.repo.owner
    const isClosed =
      (ctx.payload.pull_request?.state ?? 'open').toLowerCase() === 'closed'
    if (isClosed) {
      escapeChecks(
        false,
        'PR is closed, skipping checks, setting all outputs to false.'
      )
      return
    }
    if (isDraft) {
      escapeChecks(
        false,
        'PR is a draft, skipping checks, setting all outputs to false.'
      )
      return
    }
    const author = ctx.payload.pull_request?.user?.login ?? ''
    const isTeamMember = await userIsTeamMember(author, repoOrg)
    if (ignoreAuthors.includes(author) || isTeamMember) {
      escapeChecks(
        true,
        'PR is by ignored author, skipping checks, setting all outputs to true.'
      )
      return
    }
    const body = ctx.payload.pull_request?.body ?? ''
    const title = ctx.payload.pull_request?.title ?? ''
    const branch = ctx.payload.pull_request?.head?.ref ?? ''
    const filesModified = await listFiles({...pr, pull_number: pr.number})
    // bodyCheck passes if the author is to be ignored or if the check function passes
    const bodyCheck = checkBody(body, bodyRegexInput)
    const {valid: titleCheck, errors: titleErrors} = !titleCheckEnable
      ? {valid: true, errors: []}
      : await checkTitle(title)
    const branchCheck = checkBranch(branch, protectedBranch)
    const filesFlagged = filesModified
      .map(file => file.filename)
      .filter(filename => filesToWatch.includes(filename))
    const prCompliant =
      bodyCheck && titleCheck && branchCheck && filesFlagged.length == 0
    const shouldClosePr =
      (bodyCheck === false && bodyAutoClose === true) ||
      (branchCheck === false && protectedBranchAutoClose === true)
    // Set Output values
    core.setOutput('body-check', bodyCheck)
    core.setOutput('branch-check', branchCheck)
    core.setOutput('title-check', titleCheck)
    core.setOutput('watched-files-check', filesFlagged.length == 0)
    let commentsToLeave = []
    if (!prCompliant) {
      // Handle failed body check
      if (!bodyCheck) {
        core.warning('PR Body did not match required format')
        if (bodyComment !== '') commentsToLeave.push(bodyComment)
      }
      if (!branchCheck) {
        core.warning(
          `PR has ${protectedBranch} as its head branch, which is discouraged`
        )
        const branchCommentRegex = new RegExp('%branch%', 'gi')
        if (protectedBranchComment !== '')
          commentsToLeave.push(
            protectedBranchComment.replace(branchCommentRegex, protectedBranch)
          )
      }
      if (!titleCheck) {
        core.error(
          `This PR's title should conform to @commitlint/conventional-commit`
        )
        const errorsComment =
          '\n\nLinting Errors\n' +
          titleErrors.map(error => `\n- ${error.message}`).join('')
        if (titleComment !== '')
          commentsToLeave.push(titleComment + errorsComment)
      }
      if (filesFlagged.length > 0) {
        core.warning(
          `This PR modifies the following files: ${filesFlagged.join(', ')}`
        )
        if (watchedFilesComment !== '') {
          const filesList =
            '\n\nFiles Matched\n' +
            filesFlagged.map(file => `\n- ${file}`).join('')
          commentsToLeave.push(watchedFilesComment + filesList)
        }
      }
      // Finally close PR if warranted
      if (commentsToLeave.length > 0)
        await createComment(
          pr.number,
          [baseComment, ...commentsToLeave].join('\n\n')
        )
      // Finally close PR if warranted
      if (shouldClosePr) await closePullRequest(pr.number)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
async function createComment(number: number, comment: string) {
  if (comment.trim() !== '')
    await client.rest.issues.createComment({
      ...context.repo,
      issue_number: number,
      body: comment
    })
}
async function closePullRequest(number: number) {
  await client.rest.pulls.update({
    ...context.repo,
    pull_number: number,
    state: 'closed'
  })
}
async function escapeChecks(checkResult: boolean, message: string) {
  core.info(message)
  core.setOutput('body-check', checkResult)
  core.setOutput('branch-check', checkResult)
  core.setOutput('title-check', checkResult)
  core.setOutput('watched-files-check', checkResult)
}
async function listFiles(pullRequest: {
  owner: string
  repo: string
  pull_number: number
}) {
  const {data: files} = await client.rest.pulls.listFiles(pullRequest)
  return files
}
async function userIsTeamMember(login: string, org: string) {
  const {data: userOrgs} = await client.request('GET /users/{user}/orgs', {
    user: login
  })
  console.log(userOrgs)
  core.info(JSON.stringify(userOrgs))
  return userOrgs.some((userOrg: {login: string}) => {
    return userOrg.login === org
  })
}
run()
