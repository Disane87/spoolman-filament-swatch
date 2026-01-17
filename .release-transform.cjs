module.exports = {
    transform: (commit, context) => {
        // Shorten hash to 7 characters
        const shortHash = commit.hash ? commit.hash.substring(0, 7) : commit.hash;

        // Use author name from commit
        const authorName = commit.author?.name || commit.committer?.name || 'unknown';

        return {
            ...commit,
            shortHash,
            authorName
        };
    },
    commitPartial: `* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} ([{{shortHash}}]({{@root.host}}/{{@root.owner}}/{{@root.repository}}/commit/{{hash}})){{#if authorName}} by @{{authorName}}{{/if}}
`
};
