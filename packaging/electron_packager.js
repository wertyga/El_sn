const packager = require('electron-packager');

const options = {
    dir: '../public',
    appVersion: '1.0.0',
    arch: ['x64', 'ia32'],
    executableName: 'Crypto_Signer',
    icon: '../public/icons/crypto_signer.ico',
    out: '../BUILD',
    overwrite: true,
    ignore: 'server',
    platform: ['win32', 'linux', 'darwin'],
    appBundleId: 'wc.cryptosigner.com'
};

console.log('[X] Packaging...');
packager(options)
    .then(appPath => console.log('[X] Done!'));

module.exports = options;