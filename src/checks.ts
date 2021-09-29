/*

Checks:
- PR Title vs @commitlint/conventional-commit
- Body vs regex "fixes #123" or "closes #123" or "resolves #123"
- Check originating branch
- Check whether certain files change

*/
import lint from '@commitlint/lint'
import * as conventionalOpts from '@commitlint/config-conventional'

function checkBody(body: string, regexString: string): Boolean {
  const regex = new RegExp(regexString, 'mi')
  return regex.test(body)
}

function checkBranch(branch: string, protectedBranch: string): Boolean {
  return branch !== protectedBranch
}
async function checkTitle(title: string): Promise<Boolean> {
  const {valid} = await lint(title, conventionalOpts.rules, conventionalOpts)
  return valid
}
export {checkBody, checkBranch, checkTitle}
