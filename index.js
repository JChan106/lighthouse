const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

(async () => {
    const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
    const options = {
        logLevel: 'info',
        output: 'json',
        onlyAudits: ['first-meaningful-paint'],
        port: chrome.port,
        emulatedFormFactor: 'desktop',
        throttlingMethod: 'provided',
        disableStorageReset: false,
        maxWaitForFcp: 15 * 1000,
        maxWaitForLoad: 35 * 1000,
    }

    const results = [];
    const x = 100;
    
    for (let i = 0; i < x; i++) {
        const runnerResult = await lighthouse('https://app.jackiechan.inside-box.net/s/faqzaw9svtl3vk70cylxe7kbkmtrl4r7', options);

        const result = JSON.parse(runnerResult.report);
        const meaningfulPaint = result.audits['first-meaningful-paint'].numericValue;
        results.push(meaningfulPaint);
        console.log('run #' + i + ': ' + meaningfulPaint);
    }
    results.sort((a, b) => a - b);
    const half = Math.floor(results.length / 2);
    const median = results.length % 2 ? results[half] : (results[half - 1] + results[half]) / 2.0

    var len =  results.length;
    var per50 =  Math.floor(len*.5) - 1;
    var per90 =  Math.floor(len*.9) - 1;

    console.log('Median paint: ' + median);
    console.log('P50: ' + results[per50]);
    console.log('P90: ' + results[per90]);
    console.log(results);

    await chrome.kill();
})();

