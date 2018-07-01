const path = require('path');

const packagerOptions = require('./electron_packager');

const electronInstaller = require('electron-winstaller');

const resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: '../El_sn/BUILD/crypto_signer-win32-x64',
    outputDirectory: '../El_sn/BUILD/installers64',
    authors: 'WC technologies',
    exe: 'Crypto_signer.exe',
    setupIcon: '../El_sn/public/icons/crypto_signer.ico',
    setupExe: 'Crypto_signer.exe',
    owners: 'WC technologies',
    noMsi: true
});

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));