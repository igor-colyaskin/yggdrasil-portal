// const cds = require('@sap/cds')
// const proxy = require('@cap-js-community/odata-v2-adapter')

// cds.on('bootstrap', (app) => {
//     app.use(proxy())
// })

// module.exports = cds.server

const cds = require('@sap/cds');
const cov2ap = require('@cap-js-community/odata-v2-adapter');

cds.on('bootstrap', (app) => {
    app.use(cov2ap());
});

module.exports = cds.server;