const merge = require('lodash.merge');
const base = require('./base');

module.exports = merge(base, {
    settings: {
        emulatedFormFactor: 'desktop',
        throttlingMethod: 'provided',
    }
});
