const fs = require('fs');
const dateFormat = require('dateformat');
const lighthouse = require('lighthouse');
const merge = require('lodash.merge');
const config = require('./config/desktop_fast');

function generateCSV(table) {
    return table.map(row => row.join(',')).join('\r\n')
}

const AUDITS = [
    { id: 'time-to-first-byte', heading: 'TTFB' },
    { id: 'first-contentful-paint', heading: 'FCP' },
    { id: 'first-meaningful-paint', heading: 'FMP' },
    { id: 'speed-index', heading: 'SPI' },
    { id: 'interactive', heading: 'TTI' }, // Time to Interactive (TTI)
    { id: 'max-potential-fid', heading: 'FID' }, // First Input Delay (FID)
    { id: 'total-blocking-time', heading: 'TBT' },
];

const EMBED_URL = 'https://cloud.app.box.com/preview/expiring_embed/gvoct6FE!tmp5aSALCgl7T-fNKantlRQCdGv9noeyJ9jArjQClFUlHyDRuU5u6N6LouyacTCTBEQkISkKhuUeQhsq3dt5Ew2I-MbPFL3JlhMqyWyMgGRIwPh3ubZLiF4hPnGCorq5mplgMZ5MMpraJCU6VMWJUBgtTH9K7H9C7BHQ1sXcyWPgBQIxHSK-HN_gvwPyjH2Neql18kqfazX9hvnOapxpknkp38LtNZ2RBxjTDp8nEON_uNz31fHq74MyQn17cMJOeMYkt_N30l6WCUfX5khcH1y8PQA44TGTVsCaP0XpzQ_euNs8hN8fXvHRoIdldK0rGQET7psBw_Lmnqb2n9_E7n3tOxW1z7Qc-RJsThrFHVcJPMlI3Ih7Dxh2EFqu7Kbm3aJln8tJexv_yte84eoV9-4XOdUL2fyzma2nXB8LNovgxREcLtAJNLmicpS321SkunEck4JWvma0oTYO0X5u5hNH51XxpQG5SpqlrJkgu-gorffCUHha4PbIC6KTtwSZdXaDE9JHGFx4K4Tv179UgKKwhNCYcNxArXXsQCd9l4_pgzKkFoRqP0i7mB-QQ993YeHbQdHnjoGGHAgKCaY4rg2nDhjlrzzS8pBL4exmA_Fqv0usJyjiWb2_Dz4PIMmx9G3oxDX5THc--qOzw8WerSsAX8UXoLMMKDYmXLxuHf76l-zhVFn4HIuTEzZfHaXbCx_0zP8nicoIAMbaqJHVQ3XIB5QJq_PezldOuQW_7PuqSvQsvO4db8I-8eBuYb9VCcprs1nP2KpXec_0IRXmtgUZI8uuNycqO-XwBSC7RGUqdEwJfaRlBkwziJCdn-Mkq_E_Nour5bRcklaZVtHMsVi_8HRkPfnHhgfef8VVnpTm9ytnlIfS1NePWWkT3rTFuMIHzn2XT-jJuK9xyZIvGRZBsQtb1RoRe2d8KIriNIBgZhYsBQiec_FZ3hoDV6Im0eCmpTv77b2nWxrYk8Zj7vCVlcRQY7MKjYgVlb3W-gkhvkn4XjlIgyitXbqSE8wDLB7eIEbHmOvXs2YN97l79aGE6dPYubXHPiKOkLh8u3VFUY6mPLQ8ubh5o8pkfhhmkJyOUL7Q8voCaXOY4Ql2wrFBb2bUMKuAsWSx2nc-Ctw3_QNTr0t4CrBvLXw_72rhWHutIvp8aYBAD5oqZWxMz7AbH5afsE0UjDDCLDK4n3bF5JozHWzKBdYgtVSILLZIp-0JDqYHxjPBS4lNnHf3KoBRlxcymJw_LBQPoJt31rnspYD6pRuDvGRenM4ty0666Kc7J1fNehLZUtCVp-K9IuDJryPwp6arIPc47b-y42gdHvIuwTEAHTczm2xKtCYL_s1eIRgLlHhfWhk3IiI2KDD6kYB2ASmw';

const options = merge(config.settings, {
    onlyAudits: AUDITS.map(audit => audit.id),
    port: 49400,
});

const sources = [
    { name: 'Shared Folder (Collab)', resin: 'files|internalshared', url: 'https://cloud.app.box.com/file/579965194571' },
    { name: 'Expiring Embed', resin: 'fileembedviatoken', url: `${EMBED_URL}?showThumbnails=true` },
    { name: 'Shared Folder', resin: 'sharedfolderpage', url: 'https://app.box.com/s/64gfj8nkswau74mrq9j4jq0tpz7imqkf/file/579931830217', },
    { name: 'Shared Link (Private Folder)', resin: 'sharedfile', url: 'https://app.box.com/s/v157nawip1j54pmo6m9okq5adavh9wxu' },
    { name: 'Shared Link (Collab Folder)', resin: 'files|externalshared', url: 'https://cloud.app.box.com/file/579899852513' },
    { name: 'Direct Link (Collab Folder)', resin: 'files|ownshared', url: 'https://cloud.app.box.com/file/579966956421' },
    { name: 'Direct Link (Private Folder)', resin: 'files|ownedprivate', url: 'https://cloud.app.box.com/file/579971682549' }
];

const table = [
    ['Name', 'Resin', 'Score'].concat(AUDITS.map(audit => audit.heading)) // Header
];

sources
    .reduce((previousPromise, source) => {
        return previousPromise.then(() => {
            return lighthouse(source.url, options)
                .then(results => results.lhr)
                .then(results => {
                    const score = results.categories.performance.score;
                    const values = AUDITS.map(AUDIT => {
                        const audit = results.audits[AUDIT.id];
                        return audit.numericValue ? audit.numericValue.toFixed(2) : -1;
                    });

                    table.push([source.name, source.resin, score, ...values]);
                });
        });
    }, Promise.resolve())
    .then(() => {
        const generated = generateCSV(table);
        const timestamp = dateFormat(new Date(), "yyyy-mm-dd HH-MM");

        fs.writeFileSync(`${__dirname}/data/Report - ${timestamp}.csv`, generated);
    });
