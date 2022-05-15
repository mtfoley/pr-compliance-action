# pr-compliance-action

This action is meant to help in managing inbound PRs that may need adjustment other than code.

## Functionality

It looks for the following:
- [x] PR Title formatted according to [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
- [x] PR Body refers to an issue, as detected by a regular expression
- [x] PR originates from a branch other than the protected branch, e.g. "main", (based on head ref)
- [x] PR does not include modifications to specific files that should be reviewed carefully (e.g. package.json)

## Sample Workflow File

Below is a sample yaml file to place in `.github/workflows/`:

```yml
name: PR Compliance

on:
  pull_request_target:
    types: [opened, edited, reopened]

# Action should have write permission to make updates to PR
permissions:
  pull-requests: write

jobs:
  pr-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: mtfoley/pr-compliance-action@main
        with:
          # all inputs are optional
          watch-files: |
            package.json
            npm-shrinkwrap.json
```

## Behavior

This action drives the following outcomes with all inputs at default:

Check | Outcome on Flagging
--- | ---
PR Title Lint Fails | Action shows as failed check. Action leaves review comment.
PR Does Not Refer to Issue | Action closes issue. Action leaves review comment.
PR Originates from Protected Branch | Action closes issue. Action leaves review comment.
PR Modifies Watched Files | Action leaves review comment.

If a PR is initially deemed non-compliant by the action and a review comment is left, the action will update this same review comment each time it runs again (e.g. if the PR title or description changes). If the PR is found to be compliant after changes, the review comment will be updated to reflect this.

## Inputs

All inputs are optional and have default values.

Name | Default | Description
--- | --- | ---
repo-token | `secrets.GITHUB_TOKEN` | Access token for which this action will run. This action uses `@actions/core` library.
ignore-authors | dependabot<br/>dependabot[bot] | If the action detects that the PR author is one of these logins, it will skip checks and set all outputs to `true`.
base-comment | (see [action.yml](./action.yml)) | Preamble to any comment the action leaves on the PR.
ignore-team-members | true | Whether to ignore in the case that the PR author is a) the owner of repository, or b) has a public membership[^1] in the org that owns the repository.
body-regex | `(fix\|resolv\|clos)(e)*(s\|d)* #\d+` | Regular expression to identify whether the PR body refers to an issue[^2][^3].
body-fail | false | Whether to trigger a failing check when the body-regex is not matched in the PR body. Triggers a warning by default.
body-auto-close | true | Whether or not to auto-close on failed check of PR Body
body-comment | (see [action.yml](./action.yml)) | Comment to leave on PR on failed check of PR Body
protected-branch | (Blank) | Branch that check should ensure that PR does not use as it's head. If left blank, it falls back to default branch.
protected-branch-auto-close | true | Whether or not to auto-close on failed check of PR head branch
protected-branch-comment | (see [action.yml](./action.yml)) | Comment to leave on PR on failed check of PR head branch.
title-check-enable | true | Whether or not to lint PR title per [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
title-comment | (see [action.yml](./action.yml)) | Comment to leave on PR on failed check of PR title per [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
watch-files | (Blank) | Files to flag for modifications (e.g. package.json)
watch-files-comment | (see [action.yml](./action.yml)) | Comment to leave on PR when watched files have been changed.

[^1]: In a case where a contributor has a private membership to the org, the `ignore-authors` may be used to skip checks - however, this workflow file configuration could effectively make membership public.
[^2]: Default regular expression is based on [linking to an issue using a keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword). To keep PRs related to issues within the same same repo, we use the `KEYWORD #ISSUE-NUMBER` syntax. However, one could also use a regular expression like `(fix\|resolv\|clos)(e)*(s|d)* (my-org)\/([a-z0-9\-_]*)#\d+`
[^3]: The body check can be configured to always pass by using a sufficiently generic regex, e.g. `.*`, that will  match any PR description.

## Outputs

Each check performed is also manifested in an output.

Name | Description
--- | ---
body-check | Result of match for PR Body against configured regex.
branch-check | Result of check to ensure PR head is not protected branch.
title-check | Result of check to ensure PR title is formatted per [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
watch-files-check | Result of check for watched files having been modified. True if no modifications found to watched files.
