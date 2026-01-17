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
        './.release-github-authors.cjs',
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'conventionalcommits',
                writerOpts: require('./.release-transform.cjs'),
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
