module.exports = {
    transform: (commit, context) => {
        // Shorten hash to 7 characters and return a new object
        return {
            ...commit,
            shortHash: commit.hash ? commit.hash.substring(0, 7) : commit.hash
        };
        `
};
