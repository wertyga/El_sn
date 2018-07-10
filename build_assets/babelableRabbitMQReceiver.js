const babel = require('babel-core');
const path = require('path');
const fs = require('fs');

const receiverMQ = path.join(__dirname, '../server/rabbitMQ/receiveMQ.js');
const destinationFile = path.join(__dirname, '../public/server/receiveMQ.js');
const babelOptions = {
    presets: ['env', 'stage-0']
};

function receiveMQ() {
    return babel.transformFile(receiverMQ, babelOptions, (err, result) => {
        if(!err) {
            fs.writeFile(destinationFile, result.code, (err) => {
                if(err) console.error(err);
            });
        } else {
            console.error(err);
        };
    });
};

module.exports = receiveMQ;