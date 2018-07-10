const path = require('path');

// const createJSON = require('./createJSON');
const server = require('./babeable_server');
// const icons = require('./copyIcons');


console.log('[X] Building assets...');
Promise.all([
    // createJSON(),
    server(path.join(__dirname, '../server')),
    // icons()
]);