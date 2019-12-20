module.exports = {
    extends: 'lighthouse:default',
    settings: {
        disableStorageReset: false,
        maxWaitForFcp: 15 * 1000,
        maxWaitForLoad: 35 * 1000,
        onlyCategories: ['performance'],
        outputPath: 'data',
    }
};
