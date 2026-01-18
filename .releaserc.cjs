module.exports = {
    branches: ['main'],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'conventionalcommits',
                releaseRules: [
                    // Breaking changes
                    { breaking: true, release: 'major' },
                    
                    // Features
                    { type: 'feat', release: 'minor' },
                    
                    // Bug fixes and improvements
                    { type: 'fix', release: 'patch' },
                    { type: 'perf', release: 'patch' },
                    { type: 'revert', release: 'patch' },
                    
                    // Documentation and styling
                    { type: 'docs', release: 'patch' },
                    { type: 'style', release: 'patch' },
                    
                    // Code quality
                    { type: 'refactor', release: 'patch' },
                    { type: 'test', release: 'patch' },
                    
                    // Build and infrastructure
                    { type: 'build', release: 'patch' },
                    { type: 'ci', release: 'patch' },
                    
                    // Scoped releases (specific to this project)
                    { type: 'feat', scope: 'ui', release: 'minor' },
                    { type: 'feat', scope: 'api', release: 'minor' },
                    { type: 'feat', scope: 'filters', release: 'minor' },
                    { type: 'feat', scope: 'i18n', release: 'minor' },
                    { type: 'feat', scope: 'logo', release: 'minor' },
                    { type: 'feat', scope: 'theme', release: 'minor' },
                    { type: 'feat', scope: 'seo', release: 'patch' },
                    
                    // No release
                    { type: 'chore', release: false },
                    { scope: 'no-release', release: false }
                ]
            }
        ],
        './.release-github-authors.cjs',
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'conventionalcommits',
                presetConfig: {
                    types: [
                        { type: 'feat', section: '✨ Features' },
                        { type: 'fix', section: '🐛 Bug Fixes' },
                        { type: 'perf', section: '⚡ Performance Improvements' },
                        { type: 'revert', section: '⏪ Reverts' },
                        { type: 'docs', section: '📚 Documentation' },
                        { type: 'style', section: '💄 Styling' },
                        { type: 'refactor', section: '♻️ Code Refactoring' },
                        { type: 'test', section: '✅ Tests' },
                        { type: 'build', section: '📦 Build System' },
                        { type: 'ci', section: '👷 CI/CD' },
                        { type: 'chore', section: '🔧 Maintenance' }
                    ]
                },
                writerOpts: {
                    transform: (commit) => {
                        // Shorten hash to 7 characters
                        const shortHash = commit.hash ? commit.hash.substring(0, 7) : commit.hash;

                        // Prefer GitHub login injected by the ./.release-github-authors.cjs plugin
                        let authorLogin = commit.author?.login || commit.committer?.login || commit.author?.name || 'unknown';

                        // Fallback: extract from GitHub noreply email if present
                        if (authorLogin === 'unknown' && commit.author?.email) {
                            const noreplyMatch = commit.author.email.match(/\+([^@]+)@users\.noreply\.github\.com/);
                            if (noreplyMatch) authorLogin = noreplyMatch[1];
                        }

                        // Map commit types to sections with emojis
                        const typeToSection = {
                            'feat': '✨ Features',
                            'fix': '🐛 Bug Fixes',
                            'perf': '⚡ Performance Improvements',
                            'revert': '⏪ Reverts',
                            'docs': '📚 Documentation',
                            'style': '💄 Styling',
                            'refactor': '♻️ Code Refactoring',
                            'test': '✅ Tests',
                            'build': '📦 Build System',
                            'ci': '👷 CI/CD',
                            'chore': '🔧 Maintenance'
                        };
                        
                        // Map scopes to emojis for better readability
                        const scopeEmojis = {
                            'ui': '🎨',
                            'api': '🔌',
                            'filters': '🔍',
                            'i18n': '🌐',
                            'logo': '🖼️',
                            'theme': '🎨',
                            'seo': '📈',
                            'pwa': '📱',
                            'a11y': '♿',
                            'security': '🔒',
                            'deps': '📦',
                            'config': '⚙️'
                        };

                        // Add emoji to scope if available
                        let scopeText = commit.scope;
                        if (scopeText && scopeEmojis[scopeText]) {
                            scopeText = `${scopeEmojis[scopeText]} ${scopeText}`;
                        }

                        return {
                            ...commit,
                            shortHash,
                            authorLogin,
                            scope: scopeText,
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
