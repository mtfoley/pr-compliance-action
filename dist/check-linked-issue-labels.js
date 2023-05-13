"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLinkedIssueLabels = void 0;
function checkLinkedIssueLabels(edges, requiredLabels) {
    const errors = [];
    for (const issueEdge of edges) {
        const issueLabels = new Set(issueEdge.node.labels.edges.map(labelEdge => labelEdge.node.name));
        const issueMissingLabels = requiredLabels.filter(requiredLabel => !issueLabels.has(requiredLabel));
        if (issueMissingLabels.length) {
            errors.push(formatError(issueEdge.node.number, issueMissingLabels));
        }
    }
    return errors;
}
exports.checkLinkedIssueLabels = checkLinkedIssueLabels;
function formatError(issue, labels) {
    return [
        '- Missing required label',
        labels.length > 1 ? 's' : '',
        ` on issue #${issue}: `,
        labels.map(wrapWithTick).join(', ')
    ].join('');
}
function wrapWithTick(text) {
    return `\`${text}\``;
}
