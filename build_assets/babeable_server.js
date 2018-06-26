const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const shell = require('shelljs');

const serverPath = path.join(__dirname, '..', 'server');
let fileList = [];
const options = {
    presets: ['env', 'react', 'stage-0']
}

function babeable() { // Babel the server folder and copy it to public
    const serverFiles = fs.readdirSync(serverPath);
    console.time('a');
    getFilesList(serverPath);
    console.timeEnd('a')
};

function checkExistPublicFolder(folder) {
    fs.stat(folder, (err, stat) => {
        if(err && err.code === 'ENOENT') {
            fs.mkdir(folder, (err) => { if(err) { console.error(err) } });
        };
    });
};

function getFilesList(file) { // Get files list from server folder
    if(fs.statSync(file).isDirectory()) {
        try {
            fs.statSync(file.replace('server', 'public/server'));
        } catch(e) {
            if(e.code === 'ENOENT') {
                fs.mkdirSync(file.replace('server', 'public/server'));
            } else {
                console.error(e);
                return;
            }
        };

        fs.readdirSync(file)
            .map(item => path.join(file, item))
            .forEach(async item => {
                getFilesList(item);
            });
        // fs.stat(file.replace('server', 'public/server'), (err) => {
        //     if(err && err.code === 'ENOENT') {
        //         fs.mkdir(file.replace('server', 'public/server'), (err) => {
        //             if(err) {
        //                 console.error(err);
        //             } else {
        //                 fs.readdirSync(file)
        //                     .map(item => path.join(file, item))
        //                     .forEach(async item => {
        //                         getFilesList(item);
        //                     })
        //             }
        //         });
        //     } else {
        //         fs.readdirSync(file)
        //             .map(item => path.join(file, item))
        //             .forEach(async item => {
        //                 getFilesList(item);
        //             })
        //     }
        // })
    } else {
        fileList.push(file);
    };
    // filesArr.forEach(async file => {
    //     if(fs.statSync(file).isDirectory()) {
    //         fs.mkdir(file.replace('server', 'public/server'), (err) => { if(err) { console.error(err) }});
    //         return getFilesList(fs.readdirSync(file).map(item => path.join(file, item)))
    //     } else {
    //         fileList.push(file);
    //     };
    // })
};
// node build_assets/babeable_server
babeable();
