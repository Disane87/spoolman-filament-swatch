const { Octokit } = require('@octokit/rest');

// Cache for GitHub usernames to avoid multiple API calls
const usernameCache = new Map();
let octokit = null;

async function getGitHubUsername(commit, context) {
    // Initialize Octokit if not already done
    if (!octokit && context.env.GITHUB_TOKEN) {
        octokit = new Octokit({ auth: context.env.GITHUB_TOKEN });
    }
    
    if (!octokit) {
        // Fallback to commit author name if no token
        return commit.author?.name || 'unknown';
    }
    
    // Check cache first
    if (usernameCache.has(commit.hash)) {
        return usernameCache.get(commit.hash);
    }
    
    try {
        const [owner, repo] = context.options.repositoryUrl
            .replace(/^.*github\.com[:/]/, '')
            .replace(/\.git$/, '')
            .split('/');
        
        const { data } = await octokit.repos.getCommit({
            owner,
            repo,
            ref: commit.hash
        });
        
        const username = data.author?.login || commit.author?.name || 'unknown';
        usernameCache.set(commit.hash, username);
        return username;
    } catch (error) {
        console.error(`Failed to fetch author for commit ${commit.hash}:`, error.message);
        return commit.author?.name || 'unknown';
    }
}

module.exports = {
    transform: async (commit, context) => {
        // Shorten hash to 7 characters
        const shortHash = commit.hash ? commit.hash.substring(0, 7) : commit.hash;

        // Fetch GitHub username
        const authorLogin = await getGitHubUsername(commit, context);

        return {
            ...commit,
            shortHash,
            authorLogin
        };
    },
    commitPartial: `* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} ([{{shortHash}}]({{@root.host}}/{{@root.owner}}/{{@root.repository}}/commit/{{hash}})){{#if authorLogin}} by [@{{authorLogin}}]({{@root.host}}/{{authorLogin}}){{/if}}
`
};
