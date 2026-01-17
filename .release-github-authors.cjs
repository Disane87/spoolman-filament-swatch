const { Octokit } = require('@octokit/rest');

module.exports = {
    async analyzeCommits(pluginConfig, context) {
        const { commits, logger, env } = context;
        const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

        logger.log('Fetching GitHub usernames for commits...');

        for (const commit of commits) {
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

                if (data.author) {
                    commit.author = {
                        ...commit.author,
                        login: data.author.login
                    };
                }

                if (data.committer) {
                    commit.committer = {
                        ...commit.committer,
                        login: data.committer.login
                    };
                }
            } catch (error) {
                logger.error(`Failed to fetch author for commit ${commit.hash}: ${error.message}`);
            }
        }

        logger.log('GitHub usernames fetched successfully');
    }
};
