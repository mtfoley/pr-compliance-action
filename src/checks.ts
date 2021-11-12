import conventionalConfig from 'conventional-changelog-conventionalcommits'
import * as conventionalTypes from 'conventional-commit-types'
import {sync} from 'conventional-commits-parser'

type LintRuleOutcome = {
  message: String
  valid: Boolean
}

function checkBody(body: string, regexString: string): Boolean {
  const regex = new RegExp(regexString, 'mi')
  const bodyNoComments = body.replace(/<!--(.*?)-->/gms, '')
  return regex.test(bodyNoComments)
}

function checkBranch(branch: string, protectedBranch: string): Boolean {
  return branch !== protectedBranch
}

async function checkTitle(
  title: string
): Promise<{valid: Boolean; errors: LintRuleOutcome[]}> {
  const {parserOpts} = await conventionalConfig()
  const defaultTypes = Object.keys(conventionalTypes.types)
  try {
    const result = sync(title, parserOpts)
    let errors: LintRuleOutcome[] = []
    if (!defaultTypes.includes(result.type))
      errors.push({
        valid: false,
        message: `Found type "${
          result.type
        }", must be one of "${defaultTypes.join('","')}"`
      })
    if (!result.subject)
      errors.push({valid: false, message: 'No subject found'})
    return {valid: errors.length == 0, errors}
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          valid: false,
          message: error instanceof Error ? error.message : 'Unknown Error'
        }
      ]
    }
  }
}

export {checkBody, checkBranch, checkTitle}
