#!/usr/bin/env node

/**
 * Test-Script für lokale Semantic Release Analyse
 * Zeigt welche Version erstellt würde und welche Commits einbezogen werden
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamischer Import für ESM
const semanticRelease = await import('semantic-release');
const { default: conventionalCommitsParser } = await import('conventional-commits-parser');
const { execa } = await import('execa');

console.log('🔍 Analyzing commits for semantic release...\n');

try {
    // Lade aktuelle package.json Version
    const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    const currentVersion = packageJson.version;
    console.log(`📦 Current version: ${currentVersion}\n`);

    // Hole die letzten Commits seit dem letzten Tag
    const { stdout: lastTag } = await execa('git', ['describe', '--tags', '--abbrev=0'], { reject: false });
    const range = lastTag ? `${lastTag.trim()}..HEAD` : '';
    
    const { stdout: commits } = await execa('git', ['log', range, '--format=%H|%s|%b|%an|%ae']);
    
    if (!commits) {
        console.log('ℹ️  No new commits since last release');
        process.exit(0);
    }

    const commitLines = commits.split('\n').filter(Boolean);
    
    console.log(`📊 Found ${commitLines.length} commits since ${lastTag || 'beginning'}:\n`);

    let releaseType = null;
    const analyzedCommits = [];

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

    const typeEmojis = {
        'feat': '✨',
        'fix': '🐛',
        'perf': '⚡',
        'revert': '⏪',
        'docs': '📚',
        'style': '💄',
        'refactor': '♻️',
        'test': '✅',
        'build': '📦',
        'ci': '👷',
        'chore': '🔧'
    };

    for (const line of commitLines) {
        const [hash, subject, body, author] = line.split('|');
        const shortHash = hash.substring(0, 7);
        
        // Parse conventional commit
        const parsed = conventionalCommitsParser.sync(subject, {
            headerPattern: /^(\w*)(?:\(([^)]*)\))?: (.*)$/,
            headerCorrespondence: ['type', 'scope', 'subject']
        });

        const type = parsed.type || 'other';
        const scope = parsed.scope;
        const breaking = subject.includes('!') || body.includes('BREAKING CHANGE');

        // Bestimme Release-Typ
        if (breaking && !releaseType) {
            releaseType = 'major';
        } else if (type === 'feat' && releaseType !== 'major') {
            releaseType = 'minor';
        } else if (['fix', 'perf', 'revert', 'docs', 'style', 'refactor', 'test', 'build', 'ci'].includes(type) && !releaseType) {
            releaseType = 'patch';
        }

        const typeEmoji = typeEmojis[type] || '❓';
        const scopeEmoji = scope && scopeEmojis[scope] ? scopeEmojis[scope] : '';
        const scopeText = scope ? ` ${scopeEmoji}(${scope})` : '';
        const breakingIcon = breaking ? ' ⚠️  BREAKING' : '';

        analyzedCommits.push({
            hash: shortHash,
            type,
            scope,
            subject: parsed.subject,
            breaking,
            author,
            display: `${typeEmoji} ${type}${scopeText}: ${parsed.subject}${breakingIcon}`
        });

        console.log(`  ${typeEmoji} ${type}${scopeText}: ${parsed.subject}${breakingIcon}`);
        console.log(`    ↳ ${shortHash} by ${author}`);
    }

    console.log('\n' + '='.repeat(60));
    
    if (releaseType) {
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        let newVersion;
        
        if (releaseType === 'major') {
            newVersion = `${major + 1}.0.0`;
        } else if (releaseType === 'minor') {
            newVersion = `${major}.${minor + 1}.0`;
        } else {
            newVersion = `${major}.${minor}.${patch + 1}`;
        }

        console.log(`\n🎉 New ${releaseType.toUpperCase()} release would be created!`);
        console.log(`   ${currentVersion} → ${newVersion}\n`);

        // Gruppiere Commits nach Typ
        const groupedCommits = {};
        for (const commit of analyzedCommits) {
            if (!groupedCommits[commit.type]) {
                groupedCommits[commit.type] = [];
            }
            groupedCommits[commit.type].push(commit);
        }

        console.log('📝 Release Notes Preview:\n');
        
        const sections = {
            'feat': '✨ Features',
            'fix': '🐛 Bug Fixes',
            'perf': '⚡ Performance Improvements',
            'docs': '📚 Documentation',
            'style': '💄 Styling',
            'refactor': '♻️ Code Refactoring',
            'test': '✅ Tests',
            'build': '📦 Build System',
            'ci': '👷 CI/CD',
            'chore': '🔧 Maintenance'
        };

        for (const [type, sectionTitle] of Object.entries(sections)) {
            if (groupedCommits[type]) {
                console.log(`### ${sectionTitle}\n`);
                for (const commit of groupedCommits[type]) {
                    const scopeEmoji = commit.scope && scopeEmojis[commit.scope] ? scopeEmojis[commit.scope] : '';
                    const scopeText = commit.scope ? ` ${scopeEmoji}**${commit.scope}**:` : '';
                    console.log(`* ${scopeText} ${commit.subject} (${commit.hash}) by ${commit.author}`);
                }
                console.log('');
            }
        }

    } else {
        console.log('\nℹ️  No release would be created (only chore commits or no relevant changes)');
    }

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
