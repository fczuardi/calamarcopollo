const calamars = require('calamars');
const WitDriver = calamars.WitDriver;

const options = {
    id: process.env.WIT_APP_ID,
    serverToken: process.env.WIT_SERVER_TOKEN
};

const wit = new WitDriver(options);

module.exports = wit;
