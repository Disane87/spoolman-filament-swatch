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
                    transform: (commit, context) => {
                        // Email to GitHub username mapping for contributors with private emails
                        const emailToUsername = {
                            'mfranke87@icloud.com': 'Disane87',
                            'mfranke@thinkadesso.com': 'Disane87'
                        };
                        
                        // Shorten hash to 7 characters
                        const shortHash = commit.hash ? commit.hash.substring(0, 7) : commit.hash;
                        
                        let authorLogin = commit.author?.name || 'unknown';
                        
                        if (commit.author?.email) {
                            // First try: Extract from GitHub noreply email
                            const noreplyMatch = commit.author.email.match(/\+([^@]+)@users\.noreply\.github\.com/);
                            if (noreplyMatch) {
                                authorLogin = noreplyMatch[1];
                            } 
                            // Second try: Check email mapping for private emails
                            else if (emailToUsername[commit.author.email]) {
                                authorLogin = emailToUsername[commit.author.email];
                            }
                        }
                        
                        // Map commit types to sections with emojis
                        const typeToSection = {
                            'feat': '✨ Features',
                            'fix': '🐛 Bug Fixes',
                            'perf': '⚡ Performance',
                            'revert': '⏪ Reverts',
                            'docs': '📚 Documentation',
                            'style': '💄 Styling',
                            'refactor': '♻️ Code Refactoring',
                            'test': '✅ Tests',
                            'build': '📦 Build',
                            'ci': '👷 CI/CD'
                        };
                        
                        return {
                            ...commit,
                            shortHash,
                            authorLogin,
                            type: typeToSection[commit.type] || commit.type
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
