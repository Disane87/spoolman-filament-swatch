module.exports = {
    branches: ['main'],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'conventionalcommits',
                releaseRules: [
                    { type: 'feat', release: 'minor' },
                    { type: 'fix', release: 'patch' },
                    { type: 'perf', release: 'patch' },
                    { type: 'revert', release: 'patch' },
                    { type: 'docs', release: 'patch' },
                    { type: 'style', release: 'patch' },
                    { type: 'refactor', release: 'patch' },
                    { type: 'test', release: 'patch' },
                    { type: 'build', release: 'patch' },
                    { type: 'ci', release: 'patch' },
                    { type: 'chore', release: false }
                ]
            }
        ],
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'conventionalcommits',
                presetConfig: {
                    types: [
                        { type: 'feat', section: '✨ Features' },
                        { type: 'fix', section: '🐛 Bug Fixes' },
                        { type: 'perf', section: '⚡ Performance' },
                        { type: 'revert', section: '⏪ Reverts' },
                        { type: 'docs', section: '📚 Documentation' },
                        { type: 'style', section: '💄 Styling' },
                        { type: 'refactor', section: '♻️ Code Refactoring' },
                        { type: 'test', section: '✅ Tests' },
                        { type: 'build', section: '📦 Build' },
                        { type: 'ci', section: '👷 CI/CD' }
                    ]
                },
                writerOpts: {
                    transform: (commit) => {
                        // Shorten hash to 7 characters
                        const shortHash = commit.hash ? commit.hash.substring(0, 7) : commit.hash;
                        
                        // Use git email to extract GitHub username
                        // Git email format: "123456+username@users.noreply.github.com"
                        let authorLogin = commit.author?.name || 'unknown';
                        
                        if (commit.author?.email) {
                            const emailMatch = commit.author.email.match(/\+([^@]+)@users\.noreply\.github\.com/);
                            if (emailMatch) {
                                authorLogin = emailMatch[1];
                            }
                        }
                        
                        return {
                            ...commit,
                            shortHash,
                            authorLogin
                        };
                    },
                    commitPartial: `* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} ([{{shortHash}}]({{@root.host}}/{{@root.owner}}/{{@root.repository}}/commit/{{hash}})){{#if authorLogin}} by [@{{authorLogin}}]({{@root.host}}/{{authorLogin}}){{/if}}
`
                }
            }
        ],
        '@semantic-release/changelog',
        [
            '@semantic-release/npm',
            {
                npmPublish: false
            }
        ],
        [
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'package.json'],
                message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
            }
        ],
        '@semantic-release/github'
    ]
};
