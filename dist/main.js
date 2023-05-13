"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const utils_1 = require("@actions/github/lib/utils");
const checks_1 = require("./checks");
const check_issue_labels_1 = require("./check-issue-labels");
const repoToken = core.getInput('repo-token');
const ignoreAuthors = core.getMultilineInput('ignore-authors');
const ignoreTeamMembers = core.getBooleanInput('ignore-team-members');
const baseComment = core.getInput('base-comment');
const bodyFail = core.getBooleanInput('body-fail');
const bodyRegexInput = core.getInput('body-regex');
const bodyAutoClose = core.getBooleanInput('body-auto-close');
const bodyComment = core.getInput('body-comment');
const issueLabels = core.getMultilineInput('issue-labels');
const issueLabelsAutoClose = core.getBooleanInput('issue-labels-auto-close');
const issueLabelsComment = core.getInput('issue-labels-comment');
let protectedBranch = core.getInput('protected-branch');
const protectedBranchAutoClose = core.getBooleanInput('protected-branch-auto-close');
const protectedBranchComment = core.getInput('protected-branch-comment');
const titleComment = core.getInput('title-comment');
const titleCheckEnable = core.getBooleanInput('title-check-enable');
const filesToWatch = core.getMultilineInput('watch-files');
const watchedFilesComment = core.getInput('watch-files-comment');
const client = github.getOctokit(repoToken);
function run() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ctx = github.context;
            const pr = ctx.issue;
            const isDraft = ((_b = (_a = ctx.payload.pull_request) === null || _a === void 0 ? void 0 : _a.draft) !== null && _b !== void 0 ? _b : false) === true;
            const repoOwner = utils_1.context.repo.owner;
            if (protectedBranch === '')
                protectedBranch = (_d = (_c = ctx.payload.repository) === null || _c === void 0 ? void 0 : _c.default_branch) !== null && _d !== void 0 ? _d : '';
            const isClosed = ((_f = (_e = ctx.payload.pull_request) === null || _e === void 0 ? void 0 : _e.state) !== null && _f !== void 0 ? _f : 'open').toLowerCase() === 'closed';
            if (isClosed) {
                escapeChecks(false, 'PR is closed, skipping checks, setting all outputs to false.');
                return;
            }
            if (isDraft) {
                escapeChecks(false, 'PR is a draft, skipping checks, setting all outputs to false.');
                return;
            }
            const author = (_j = (_h = (_g = ctx.payload.pull_request) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.login) !== null && _j !== void 0 ? _j : '';
            if (ignoreAuthors.includes(author)) {
                escapeChecks(true, 'PR is by ignored author, skipping checks, setting all outputs to true.');
                return;
            }
            const isTeamMember = yield userIsTeamMember(author, repoOwner);
            if (ignoreTeamMembers && isTeamMember) {
                escapeChecks(true, 'PR is by team member, skipping checks, setting all outputs to true.');
                return;
            }
            const body = (_l = (_k = ctx.payload.pull_request) === null || _k === void 0 ? void 0 : _k.body) !== null && _l !== void 0 ? _l : '';
            const title = (_o = (_m = ctx.payload.pull_request) === null || _m === void 0 ? void 0 : _m.title) !== null && _o !== void 0 ? _o : '';
            const branch = (_r = (_q = (_p = ctx.payload.pull_request) === null || _p === void 0 ? void 0 : _p.head) === null || _q === void 0 ? void 0 : _q.ref) !== null && _r !== void 0 ? _r : '';
            const filesModified = yield listFiles(Object.assign(Object.assign({}, pr), { pull_number: pr.number }));
            // bodyCheck passes if the author is to be ignored or if the check function passes
            const bodyCheck = (0, checks_1.checkBody)(body, bodyRegexInput);
            core.debug(`Checking issue labels: ${issueLabels.join(',')}`);
            const issueLabelErrors = yield (0, check_issue_labels_1.checkIssueLabels)(client, pr.number, issueLabels);
            core.debug(`Received issue label errors: ${issueLabelErrors.join(',')}`);
            const { valid: titleCheck, errors: titleErrors } = !titleCheckEnable
                ? { valid: true, errors: [] }
                : yield (0, checks_1.checkTitle)(title);
            const branchCheck = (0, checks_1.checkBranch)(branch, protectedBranch);
            const filesFlagged = filesModified
                .map(file => file.filename)
                .filter(filename => filesToWatch.includes(filename));
            const prCompliant = bodyCheck &&
                !issueLabelErrors.length &&
                titleCheck &&
                branchCheck &&
                filesFlagged.length === 0;
            const shouldClosePr = (bodyCheck === false && bodyAutoClose === true) ||
                (branchCheck === false && protectedBranchAutoClose === true) ||
                (!!issueLabelErrors.length && issueLabelsAutoClose === true);
            // Set Output values
            core.setOutput('body-check', bodyCheck);
            core.setOutput('branch-check', branchCheck);
            core.setOutput('issue-check', !!issueLabelErrors.length);
            core.setOutput('title-check', titleCheck);
            core.setOutput('watched-files-check', filesFlagged.length === 0);
            const commentsToLeave = [];
            if (!prCompliant) {
                // Handle failed body check
                if (!bodyCheck) {
                    const bodyCheckMessage = 'PR Body did not match required format';
                    if (bodyFail) {
                        core.setFailed(bodyCheckMessage);
                    }
                    else {
                        core.warning(bodyCheckMessage);
                    }
                    if (bodyComment !== '')
                        commentsToLeave.push(bodyComment);
                }
                if (!branchCheck) {
                    core.warning(`PR has ${protectedBranch} as its head branch, which is discouraged`);
                    const branchCommentRegex = new RegExp('%branch%', 'gi');
                    if (protectedBranchComment !== '')
                        commentsToLeave.push(protectedBranchComment.replace(branchCommentRegex, protectedBranch));
                }
                if (issueLabelErrors.length) {
                    core.setFailed(`This PR's linked issues are missing required labels.`);
                    commentsToLeave.push([issueLabelsComment, ...issueLabelErrors].join('\n'));
                }
                if (!titleCheck) {
                    core.setFailed(`This PR's title should conform to specification at https://conventionalcommits.org`);
                    const errorsComment = `\n\nLinting Errors\n${titleErrors
                        .map(error => `\n- ${error.message}`)
                        .join('')}`;
                    if (titleComment !== '')
                        commentsToLeave.push(titleComment + errorsComment);
                }
                if (filesFlagged.length > 0) {
                    core.warning(`This PR modifies the following files: ${filesFlagged.join(', ')}`);
                    if (watchedFilesComment !== '') {
                        const filesList = `\n\nFiles Matched\n${filesFlagged
                            .map(file => `\n- ${file}`)
                            .join('')}`;
                        commentsToLeave.push(watchedFilesComment + filesList);
                    }
                }
                // Update Review as needed
                let reviewBody = '';
                if (commentsToLeave.length > 0)
                    reviewBody = [baseComment, ...commentsToLeave].join('\n\n');
                yield updateReview({ owner: pr.owner, repo: pr.repo, pull_number: pr.number }, reviewBody);
                // Finally close PR if warranted
                if (shouldClosePr)
                    yield closePullRequest(pr.number);
            }
            else {
                yield updateReview({ owner: pr.owner, repo: pr.repo, pull_number: pr.number }, '');
            }
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
function closePullRequest(number) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.rest.pulls.update(Object.assign(Object.assign({}, utils_1.context.repo), { pull_number: number, state: 'closed' }));
    });
}
function escapeChecks(checkResult, message) {
    core.info(message);
    core.setOutput('body-check', checkResult);
    core.setOutput('branch-check', checkResult);
    core.setOutput('title-check', checkResult);
    core.setOutput('watched-files-check', checkResult);
}
function listFiles(pullRequest) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data: files } = yield client.rest.pulls.listFiles(pullRequest);
        return files;
    });
}
function findExistingReview(pullRequest) {
    return __awaiter(this, void 0, void 0, function* () {
        let review;
        const { data: reviews } = yield client.rest.pulls.listReviews(pullRequest);
        review = reviews.find(innerReview => {
            var _a, _b;
            return ((_b = (_a = innerReview === null || innerReview === void 0 ? void 0 : innerReview.user) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : '') === 'github-actions[bot]';
        });
        if (review === undefined)
            review = null;
        return review;
    });
}
function updateReview(pullRequest, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const review = yield findExistingReview(pullRequest);
        // if blank body and no existing review, exit
        if (body === '' && review === null)
            return;
        // if review body same as new body, exit
        if (body === (review === null || review === void 0 ? void 0 : review.body))
            return;
        // if no existing review, body non blank, create a review
        if (review === null && body !== '') {
            yield client.rest.pulls.createReview(Object.assign(Object.assign({}, pullRequest), { body, event: 'COMMENT' }));
            return;
        }
        // if body blank and review exists, update it to show passed
        if (review !== null && body === '') {
            yield client.rest.pulls.updateReview(Object.assign(Object.assign({}, pullRequest), { review_id: review.id, body: 'PR Compliance Checks Passed!' }));
            return;
        }
        // if body non-blank and review exists, update it
        if (review !== null && body !== (review === null || review === void 0 ? void 0 : review.body)) {
            yield client.rest.pulls.updateReview(Object.assign(Object.assign({}, pullRequest), { review_id: review.id, body }));
            return;
        }
    });
}
function userIsTeamMember(login, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        if (login === owner)
            return true;
        const { data: userOrgs } = yield client.request('GET /users/{user}/orgs', {
            user: login
        });
        return userOrgs.some((userOrg) => {
            return userOrg.login === owner;
        });
    });
}
run();
