const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'server');
let fileList = [];

function babeable() {
    const serverFiles = fs.readdirSync(serverPath);

    serverFiles.forEach(async file => {
        getFilesList(path.join(serverPath, file))
    });

};

function getFilesList(filesArr) {
    if(fs.statSync(filePath).isDirectory()) {
        return getFilesList(fs.readdirSync(filePath));
    } else {
        fileList.push(filePath);
    };
};
// node build_assets/babeable_server
getFilesList(fs.readdirSync(serverPath));