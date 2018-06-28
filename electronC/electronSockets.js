import { ipcMain, Notification, nativeImage } from 'electron';

import { mainWindow, loginScreen } from './electron';

// Functions
const resizeMainScreen = (win) => {
    win.maximize();
    win.setResizable(true);
    win.setMaximizable(true);
    win.center();
};
const resizeToLoginScreen = (win) => {
    win.setSize(loginScreen.width, loginScreen.height);
    win.setResizable(loginScreen.resizable);
    win.center();
};

// Socket data
ipcMain.on('login_user', (e, msg) => { // Resize main window
    resizeMainScreen(mainWindow);
});
ipcMain.on('logout_user', (e, msg) => { // Resize main window
    resizeToLoginScreen(mainWindow)
});
ipcMain.on('reached_sign_price', (e, msg) => {
    const notification = new Notification({
        title: msg.symbol,
        body: `${msg.symbol} has been reached sign price - ${msg.signPrice.toFixed(8)} \n Time: ${msg.time.split('.')[0]}`,
        icon: nativeImage.createFromPath(__dirname + '/../icons/crypto_signer.png')
    });
    notification.show();
});
ipcMain.on('get_new_powers', (e, data) => { // Emit if get a percent high Or low
    if(Notification.isSupported()) {
        data.forEach(item => {
            const negative = `Crush down for ${item.percent}% \n From: ${item.high.toFixed(8)} To: ${item.close.toFixed(8)}`,
                positive = `Just jump up for +${item.percent}%`,
                title = item.symbol === 'BTCUSDT' ? 'BTC / USDT' : item.symbol.split('BTC').join(' / BTC'),
                body = item.percent > 0 ? positive : negative;
            const notification = new Notification({
                title,
                body,
                icon: nativeImage.createFromPath(__dirname + '/../icons/crypto_signer.png')
            });

            notification.show();

            ipcMain.on('delete_power', id => {
                if(item._id === id) {
                    notification.close();
                };
            })

            notification.on('close', () => {
                setSeenWithCloseNotification(e, item);
                notification.close();
            });
            notification.on('click', () => {
                mainWindow.focus();
                mainWindow.maximize();
                e.sender.send('go_to_power_page', item._id);
                notification.close();
            });
        });
    };
});

ipcMain.on('Error_in_set_seen_power', (e, msg) => {
    const errorNotification = new Notification({
        title: ('Error in power symbol').toUpperCase(),
        body: msg
    });

    errorNotification.show();
});

function setSeenWithCloseNotification(e, item) {
    e.sender.send('set_seen_power', item._id);
};

// function showNotification(messages) {
//     const [ notifyWidth, notifyHeight] = [400, 200]
//     const notifyWindow = new BrowserWindow({
//         show: false,
//         parent: 'top',
//         modal: true,
//         // frame: false,
//         width: notifyWidth,
//         height: notifyHeight,
//         hasShadow: false,
//         // resizable: false
//     });
//     const { width, height } = screen.getPrimaryDisplay().workAreaSize;
//     notifyWindow.setPosition(width - notifyWidth, height - notifyHeight);
//
//
//     isChildOpen = true;
//     notifyWindow.loadURL(formatUrl({
//         pathname: __dirname + '/notification.html',
//         protocol: 'file',
//         slashes: true
//     }));
//     notifyWindow.show();
//     setTimeout(() => notifyWindow.close(), 1000)
// };