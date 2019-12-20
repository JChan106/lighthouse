const merge = require('lodash.merge');
const base = require('./base');

module.exports = merge(base, {
    settings: {
        emulatedFormFactor: 'desktop',
        throttlingMethod: 'devtools',
        throttling: {
            rttMs: 150,
            throughputKbps: 5 * 1024,
            cpuSlowdownMultiplier: 0.7,
        }
    }
});
