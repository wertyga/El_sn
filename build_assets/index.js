const path = require('path');

// const createJSON = require('./createJSON');
// const server = require('./babeable_server');
// const icons = require('./copyIcons');
const receiveMQ = require('./babelableRabbitMQReceiver');


console.log('[X] Building assets...');
Promise.all([
    // receiveMQ()
    // createJSON(),
    // server(path.join(__dirname, '../server')),
    // icons()
]);