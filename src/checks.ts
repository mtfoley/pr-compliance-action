/*

Checks:
- PR Title vs @commitlint/conventional-commit
- Body vs regex "fixes #123" or "closes #123" or "resolves #123"
- Check originating branch
- Check whether certain files change

*/
import lint from '@commitlint/lint';
//import * as core from "@actions/core";
//import * as github from "@actions/github";
import * as conventionalOpts from '@commitlint/config-conventional';

type Branch = {
    ref: string;
    label: string;
}
type PullRequest = {
    number: Number;
    state: string;
    user: {
        login: string;
    };
    title: string;
    body: string;
    head: Branch;
    base: Branch;
};
type LintResultError = {
    message: string;
};
type LintResult = {
    valid: Boolean,
    errors: LintResultError[];
};
function checkBody(body:string, regexString: string): Boolean {
    const regex = new RegExp(regexString,"mi");
    return regex.test(body);
}

function checkBranch(pullRequest: PullRequest, protectedBranch: string): Boolean {
    return pullRequest.head.ref !== protectedBranch;
}
async function checkTitle(pullRequest: PullRequest): Promise<Boolean> {
    const {valid} = await lint(pullRequest.title,conventionalOpts.rules,conventionalOpts);
    return valid;
}
export { checkBody, checkBranch, checkTitle };