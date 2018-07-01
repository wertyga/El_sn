import EventEmitter from 'events';

import filterObject from '../../client/common/functions/filterObject';
import { BrowserWindow, screen, ipcMain } from 'electron';

// Properties
//     title: {
//         text: 'Tile text'
//             // styles of title
//     },
//     text: {
//         text: 'Tile text'
//         // styles of text
//     },
//     width: width || 400,
//     height: height || 200,
//     icon: {
//         image: icon image,
//          // Styles of image wrapper
//     },
//     rootStyles: {
//       // Root styles
//      },
//     closeTimeout: Close time || 6000,
//     maxWindows: // Windows count
//     mainContent: // mainContent styles,
//     horizPos: // Horizontal position
//     vertPos: // Vertical position,
//     useContentSize: // ContentSize of BrowserWindow
//     transitionSpeed: // Speed of window moving

let count = 0;

class WcNotify extends EventEmitter {
    constructor(opt) {
        super();
        this._queue = [];
        this._max = opt.maxWindows || 3;
        this._winIDs = [];
        this.opt = opt;
        this.notifyWidth = opt.width || 400;
        this.notifyHeight = opt.height || 200;
        this.horizPos = opt.horizPos || 20;
        this.vertPos = opt.vertPos || 20;
        this.transitionSpeed = opt.transitionSpeed || 5;
    };

    show() {
        // Make window
        let _notifyWindow = new BrowserWindow({
            parent: 'top',
            modal: true,
            frame: false,
            useContentSize: this.opt.useContentSize || false,
            width: this.notifyWidth,
            height: this.notifyHeight,
            hasShadow: false,
            resizable: false,
            alwaysOnTop: true,
            show: false,
            movable: false,
        });
        count += 1;
        // Load content
        const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView(this.opt));
        _notifyWindow.loadURL(file);

        this._setEventHandleres(_notifyWindow);

        //Check count of windows
        if(this._winIDs.length < this._max) {
            const { width, height } = screen.getPrimaryDisplay().workAreaSize;
            _notifyWindow.show();
            _notifyWindow.focus();

            // _notifyWindow.webContents.openDevTools();
        } else {
            this._queue.push(_notifyWindow);
        };
    };

    _close(e, id) {
        const win = BrowserWindow.fromId(id)
        if(win) {
            win.close();
        }
    };

    _getWindowPositionRight(win) {
        // Get sizes
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;

        // Set position
        const horizPos = width - this.notifyWidth - this.horizPos;
        const vertPos = height - this.notifyHeight - this.vertPos - (this.notifyHeight + 5) * (this._winIDs.indexOf(win.id));
        return {
            horizPos,
            vertPos
        }
    };

    _getWindowPositionTop(win) {
        // Get sizes
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;

        // Set position
        const horizPos = width - this.notifyWidth - this.horizPos;
        const vertPos = this.vertPos + (this.notifyHeight + 5) * (this._winIDs.indexOf(win.id));
        return {
            horizPos,
            vertPos
        }
    };

    _setEventHandleres = (win) => {
        win.on('show', () => {
            this.emit('show');
            this._winIDs.push(win.id);
            const { horizPos, vertPos } = this._getWindowPositionRight(win);
            win.setPosition(horizPos, vertPos);
            // win.webContents.openDevTools();

            ipcMain.on(`windowID-${win.id}`, this._close);
            ipcMain.on(`body_click-${win.id}`, this._close);
        });

        win.on('close', () => {
            this.emit('close');
            this._winIDs.splice(this._winIDs.indexOf(win.id), 1);
            ipcMain.removeListener(`windowID-${win.id}`, this._close);
            ipcMain.removeListener(`body_click-${win.id}`, this._close);
        });
        win.on('closed', () => {
            if(this._winIDs.length > 0) {
                this._launchMoveRight();
            };
            if(this._queue.length > 0) {
                this._queue[0].show();
                this._queue.shift();
            };
        });
    };

    _moveWindowFromRight(windowID) {
        const window = BrowserWindow.fromId(windowID);
        if(!window) return;
        const { horizPos, vertPos } = this._getWindowPositionRight(window);
        let timer = setInterval(() => {
            const [winX, winY] = window.getPosition();
            if(winY >= vertPos) {
               clearInterval(timer);
               timer = null;
            } else {
                window.setPosition(winX, Math.min(winY + 10, vertPos));
            }
        }, this.transitionSpeed);
    };

    _moveWindowFromTop(windowID) {
        const window = BrowserWindow.fromId(windowID);
        if(!window) return;
        const { horizPos, vertPos } = this._getWindowPositionTop(window);
        let timer = setInterval(() => {
            const [winX, winY] = window.getPosition();
            if(winY <= vertPos) {
                clearInterval(timer);
                timer = null;
            } else {
                window.setPosition(winX, Math.max(winY - 10, vertPos));
            }
        }, this.transitionSpeed);
    };

   _launchMoveRight() {
        for(let i = 0; i < this._winIDs.length; i++) {
            this._moveWindowFromRight(this._winIDs[i])
        };
    };

    _launchMoveTop() {
        for(let i = this._winIDs.length - 1; i >= 0; i--) {
            this._moveWindowFromTop(this._winIDs[i])
        };
    };
};

const loadView = (opt) => {
    // Styles
    const iconStyles = {
        'margin-right': 10,
        width: '20%',
        ...filterObject(opt.icon, 'image')
    };
    const titleStyles = {
        'margin-bottom': 3,
        'font-weight': 'bold',
        ...filterObject(opt.title, 'text')
    };
    const textStyles = {
        'font-size': 13,
        ...filterObject(opt.text, 'text')
    };
    const rootStyles = {
        'user-select': 'none',
        width: '100vw',
        height: '100vh',
        cursor: 'pointer',
        ...opt.rootStyles
    };
    const mainContent = {
        display: 'inline-flex',
        'padding-left': 10,
        'padding-right': 30,
        'padding-bottom': 10,
        ...opt.mainContent
    };
    const mainContentStylesString = Object.keys(mainContent)
        .map(item => {
            return item + ': ' + (typeof mainContent[item] === 'number' ? mainContent[item] + 'px' : mainContent[item])
        }).join('; ');
    const iconStyleString = Object.keys(iconStyles)
        .map(item => {
            return item + ': ' + (typeof iconStyles[item] === 'number' ? iconStyles[item] + 'px' : iconStyles[item])
        }).join('; ');
    const titleStyleString = Object.keys(titleStyles)
        .map(item => {
            return item + ': ' + (typeof titleStyles[item] === 'number' ? titleStyles[item] + 'px' : titleStyles[item])
        }).join('; ');
    const textStyleString = Object.keys(textStyles)
        .map(item => {
            return item + ': ' + (typeof textStyles[item] === 'number' ? textStyles[item] + 'px' : textStyles[item])
        }).join('; ');
    const rootStyleString = Object.keys(rootStyles)
        .map(item => {
            return item + ': ' + (typeof rootStyles[item] === 'number' ? rootStyles[item] + 'px' : rootStyles[item])
        }).join('; ');

    return (`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${opt.title.text}</title>
     
    </head>
    <body style="margin: 0; overflow: hidden;">
    
        <div id="root" style="${rootStyleString}">
            <div class="close" style="text-align: right; padding-top: 10px; padding-right: 13px;"><span style="padding: 10px; cursor: pointer;">&times</span></div>
            <div class="up"></div>
            <div class="main" style="${mainContentStylesString}">
                <div class="image" style="${iconStyleString}">
                    <img style="width: 100%;" src=${(opt.icon && opt.icon.image) ? opt.icon.image : ''} alt="">
                </div>
                <div class="description" style="display: flex; flex-direction: column; flex: 1;">
                    <div class="title" style="${titleStyleString}">${opt.title.text}<strong>${count}</strong></div>
                    <div class="text" style="${textStyleString}">${opt.text.text}</div>
                </div>
            </div>
            <div class="footer"></div>
        </div>
    
        <script>
            let windowID = require('electron').remote.getCurrentWindow().id;
            function closeWindow() {
                require('electron').ipcRenderer.send('windowID-' + windowID, windowID);
            };
            
            window.onload = function() {
                document.body.onclick = function(e) {
                    ipcRenderer.send('body_click-' + windowID, windowID);
                };

                // setTimeout(close, ${opt.closeTimeout || 6000});
                
                const closeButton = document.querySelector('.close span');
                closeButton.onclick = closeWindow;
            };
            //   
            
            // const closeWrapper = document.querySelector('.close');
            // const title = document.querySelector('.title');
            // const text = document.querySelector('.text');
            //
            // closeButton.onclick = close;
        
           
       
        </script>
    </body>
    </html>
  `)
}

module.exports = WcNotify;