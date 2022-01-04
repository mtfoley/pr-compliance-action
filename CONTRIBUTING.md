# Contributing Guide

I would love to see issues and pull requests!

## Use of Typescript and `ncc`
This repo was generated from the template `actions/typescript-action` and as such, the JS code that actually runs is that in the `dist/` folder, which is compiled using `ncc`.
Generally speaking, I'd encourage running `npm run all` prior to committing/pushing so you can test your changes accurately. This will run multiple steps such as compilation, code formatting, and unit test running.

## Best Practices in Testing
If you would like to test this action on a repo that you own, I would suggest setting the `ignore-team-members` property to `false` so that when you create PR for it to work with, it does not skip its checks.

## Issue Templates, PR Templates
This repo uses Issue Templates and PR Templates.  I personally may omit sections of these when creating issues or PRs, but I do ask that you include the applicable parts.
