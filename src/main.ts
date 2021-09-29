import * as core from '@actions/core';
import * as github from '@actions/github';
import { checkBody, checkTitle, checkBranch } from './checks';

const repoToken = core.getInput("repo-token",{required:true});
const bodyRegexInput = core.getInput("body-regex");
const protectedBranch = core.getInput("protected-branch");
const client = github.getOctokit(repoToken);
async function run(): Promise<void> {
  try {
    const ctx = github.context;
    const pr = ctx.issue;
    const body = ctx.payload.pull_request?.body ?? "";
    const title = ctx.payload.pull_request?.title ?? "";
    const branch = ctx.payload.pull_request?.head?.ref ?? "";
    const bodyCheck = checkBody(body,bodyRegexInput);
    const titleCheck = checkTitle(title);
    const branchCheck = checkBranch(branch,protectedBranch);
    const prCompliant = bodyCheck && titleCheck && branchCheck;
    if(!prCompliant){
      const failMessage = `${bodyCheck ? '' : "PR must refer to an issue."}
        ${titleCheck ? '' : 'PR Title must conform to @commitlint/conventional-commit'}
        ${branchCheck ? '' : 'PR must not have "'+protectedBranch+'" as it\'s head branch'}`;
      core.setFailed(failMessage);
    }
  } catch (error) {
    if(error instanceof Error) core.setFailed(error.message)
  }
}

run()
