import * as core from '@actions/core'
import * as github from '@actions/github'
import {checkBody, checkTitle, checkBranch} from './checks'

const repoToken = core.getInput('repo-token', {required: true})
const bodyRegexInput = core.getInput('body-regex')
const protectedBranch = core.getInput('protected-branch')
const client = github.getOctokit(repoToken)
async function run(): Promise<void> {
  try {
    const ctx = github.context
    const pr = ctx.issue
    const body = ctx.payload.pull_request?.body ?? ''
    const title = ctx.payload.pull_request?.title ?? ''
    const branch = ctx.payload.pull_request?.head?.ref ?? ''
    const bodyCheck = checkBody(body, bodyRegexInput)
    const titleCheck = await checkTitle(title)
    const branchCheck = checkBranch(branch, protectedBranch)
    const prCompliant = bodyCheck && titleCheck && branchCheck
    if (!prCompliant) {
      if (!bodyCheck)
        core.warning(`This PR description does not refer to an issue`)
      if (!branchCheck)
        core.error(`This PR has ${protectedBranch} as its head branch`)
      if (!titleCheck)
        core.error(
          `This PR's title should conform to conventional commit messages`
        )
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
