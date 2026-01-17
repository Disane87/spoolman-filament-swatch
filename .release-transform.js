module.exports = {
    transform: (commit, context) => {
        // Shorten hash to 7 characters
        if (commit.hash) {
            commit.shortHash = commit.hash.substring(0, 7);
        }

        return commit;
    },
    commitPartial: `* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} ([{{shortHash}}]({{@root.host}}/{{@root.owner}}/{{@root.repository}}/commit/{{hash}})){{#if committerName}} by @{{committerName}}{{/if}}
`
};
