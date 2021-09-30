# pr-compliance-action

This action is meant to help in managing inbound PRs that may need adjustment other than code.

## Functionality

It looks for the following:
- [x] PR Title formatted according to [@commitlint/conventional-commit](https://www.conventionalcommits.org/en/v1.0.0/).
- [x] PR Body refers to an issue, as detected by a regular expression
- [x] PR originates from a protected branch e.g. "main", (based on head ref)
- [x] PR includes modifications to specific files that should be reviewed carefully (e.g. package.json)

## Behavior

This action drives the following outcomes:

Check | Outcome on Failure
--- | ---
PR Title Lint | Action shows as failed check. Action leaves comment.
PR Refers to Issue | Action closes issue. Action leaves comment.
PR Originates from Protected Branch | Action closes issue. Action leaves comment.
PR Avoids Watched Files | Action leaves comment.

## Inputs

All inputs are required and all have default values. The only input absolutely require to be specified in a workflow file is the `repo-token` input.

Name | Default | Description
--- | --- | ---

## Outputs

Each check performed is also manifested in an output.

Name | Description
--- | ---