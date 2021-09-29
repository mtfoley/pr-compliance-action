import * as core from '@actions/core';
import * as github from '@actions/github';
import { checkBody, checkTitle, checkBranch } from './checks';

const repoToken = core.getInput("repo-token",{required:true});
const bodyRegexInput = core.getInput("body-regex")
const client = github.getOctokit(repoToken);
async function run(): Promise<void> {
  try {
    const ctx = github.context;
    const pr = ctx.issue;
    const body = ctx.payload.pull_request?.body ?? "";
    const title = ctx.payload.pull_request?.title ?? "";
    const bodyCheck = checkBody(body,bodyRegexInput);
  } catch (error) {
    if(error instanceof Error) core.setFailed(error.message)
  }
}

run()
