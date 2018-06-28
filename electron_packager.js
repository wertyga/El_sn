const packager = require('electron-packager');

const options = {
    dir: './public',
    appVersion: '1.0.0',
    arch: 'all',
    executableName: 'Crypto_Signer',
    icon: './public/icons/crypto_signer.png',
    out: './build',
    overwrite: true,
    platform: 'all',
    appBundleId: 'wc.cryptosigner.com'
};

console.log('[X] Packaging...')
packager(options)
    .then(appPath => console.log('[X] Done!'))