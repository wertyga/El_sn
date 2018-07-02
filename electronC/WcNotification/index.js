import EventEmitter from 'events';
import { format as formatUrl } from 'url';
import path from 'path';

import filterObject from '../../client/common/functions/filterObject';
import { BrowserWindow, screen, ipcMain, BrowserView } from 'electron';
import {mainWindow} from "../electron";

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
//         title: image of window title
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
//     appearTransitionSpeed: // Speed of window moving(default: 8ms)
//     leaveTransitionSpeed: // Speed of window moving(default: 6ms)
//     useContentSize: // Is use content size

let count = 0;

let _winIDs = [];
let _queue = [];
let _max = 3;
let isMaxHeight = 0;

const looseBetweenNotifications = 5;

class WcNotify extends EventEmitter {
    constructor(opt) {
        super();
        if(opt.maxWindows) _max = opt.maxWindows;
        this.opt = opt;
        this.notifyWidth = opt.width || 400;
        this.notifyHeight = opt.height || 200;
        this.horizPos = opt.horizPos || 20;
        this.vertPos = opt.vertPos || 20;
        this.appearTransitionSpeed = opt.appearTransitionSpeed || 8;
        this.leaveTransitionSpeed = opt.leaveTransitionSpeed || 6;

        const { width, height } = screen.getPrimaryDisplay().workAreaSize;

        // Make window
        this._notifyWindow = new BrowserWindow({
            maxWidth: width,
            maxHeight: height,
            parent: 'top',
            modal: true,
            frame: false,
            useContentSize: false,
            width: this.notifyWidth,
            height: this.notifyHeight,
            hasShadow: false,
            resizable: false,
            alwaysOnTop: true,
            show: false,
            movable: false,
            icon: opt.icon.image
        });

        // Load content
        const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView(opt));
        this._notifyWindow.loadURL(file);
        this._setEventHandleres(this._notifyWindow);

        // this._notifyWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(require('./index.html')));
        // this._setEventHandleres(this._notifyWindow);
    };

    show() {

        count += 1;

        //Check count of windows
        const checkHeights = isMaxHeight +
            this._notifyWindow.getSize()[1] +
            looseBetweenNotifications * 2 >= screen.getPrimaryDisplay().workAreaSize.height;

        if((_winIDs.length < _max) && !checkHeights) {
            this._notifyWindow.show();
            this._notifyWindow.focus();
            isMaxHeight += this._notifyWindow.getSize()[1];

        } else {
            _queue.push(this._notifyWindow);
        };
    };

    _initialPositionRightBottom() {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const { horizPos, vertPos } = this._getWindowPositionRight(this._notifyWindow);
        this._notifyWindow.setPosition(width, vertPos);
    };

    _appearFromRightToLeft() {
        let timer = setInterval(() => {
            const { horizPos, vertPos } = this._getWindowPositionRight(this._notifyWindow);
            const [winX, winY] = this._notifyWindow.getPosition();

            if(winX <= horizPos) {
                clearInterval(timer);
                timer = null;
            } else {
                this._notifyWindow.setPosition(Math.max(winX - 30, horizPos),vertPos)
            };
        }, this.appearTransitionSpeed);
    };

    _animateCloseToRightFromRightBottom() {
        return new Promise((resolve, reject) => {
            let timer = setInterval(() => {
                const { horizPos, vertPos } = this._getWindowPositionRight(this._notifyWindow);
                const { width, height } = screen.getPrimaryDisplay().workAreaSize;
                const winX = this._notifyWindow.getPosition()[0];

                if(winX >= width) {
                    clearInterval(timer);
                    timer = null;
                    resolve('Done!')
                } else {
                    this._notifyWindow.setPosition(Math.min(winX + 30, width), vertPos);
                };
            }, this.leaveTransitionSpeed);
        })
    };

    close = () => {
        if(this._notifyWindow) {
            this._animateCloseToRightFromRightBottom()
                .then(() => {
                    _winIDs.splice(_winIDs.indexOf(this._notifyWindow.id), 1);
                    isMaxHeight -= this._notifyWindow.getSize()[1];
                    this._notifyWindow.close();
                })
                .catch(err => console.error(err))
        }
    };

    bodyClick = () => {
        this.emit('click');
    };

    _getWindowPositionRight(win) {
        // Get screen sizes
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const [winWidth, winHeight] = win.getSize();

        // Set position
        const horizPos = width - winWidth - this.horizPos;
        const vertPos = height - winHeight - this.vertPos - (winHeight + looseBetweenNotifications) * (_winIDs.indexOf(win.id));
        return {
            horizPos,
            vertPos
        }
    };

    _getWindowPositionTop(win) {
        // Get sizes
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const [winWidth, winHeight] = win.getSize();

        // Set position
        const horizPos = width - winWidth - this.horizPos;
        const vertPos = this.vertPos + (winHeight + looseBetweenNotifications) * (_winIDs.indexOf(win.id));
        return {
            horizPos,
            vertPos
        }
    };

    _setEventHandleres = (win) => {
        win.on('show', () => {
            this.emit('show');
            _winIDs.push(win.id);
            this._initialPositionRightBottom();
            this._appearFromRightToLeft();

            // win.webContents.openDevTools();

            ipcMain.on(`windowID-${win.id}`, this.close);
            ipcMain.on(`body_click-${win.id}`, this.bodyClick);
        });

        win.on('close', () => {
            this.emit('close');

            ipcMain.removeListener(`windowID-${win.id}`, this.close);
            ipcMain.removeListener(`body_click-${win.id}`, this.bodyClick);
        });
        win.on('closed', () => {
            if(_winIDs.length > 0) {
                this._launchMoveDownInRightBottom();
            };
            if(_queue.length > 0) {
                _queue[0].show();
                _queue.shift();
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
                window.setPosition(winX, Math.min(winY + 30, vertPos));
            }
        }, 2);
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
                window.setPosition(winX, Math.max(winY - 30, vertPos));
            }
        }, 2);
    };

    _launchMoveDownInRightBottom() {
        for(let i = 0; i < _winIDs.length; i++) {
            this._moveWindowFromRight(_winIDs[i])
        };
    };

    _launchMoveTopInRightTop() {
        for(let i = _winIDs.length - 1; i >= 0; i--) {
            this._moveWindowFromTop(_winIDs[i])
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
    
    <div class="close" style="text-align: right; padding-top: 10px; padding-right: 13px;"><span style="padding: 10px; cursor: pointer;">&times</span></div>
        <div id="root" style="${rootStyleString}">
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
            var ipc = require('electron').ipcRenderer;
            function closeWindow() {
                ipc.send('windowID-' + windowID, windowID);
            };
            
            window.onload = function() {
                document.getElementById('root').onclick = function(e) {
                    ipc.send('body_click-' + windowID, windowID);
                };

                // setTimeout(close, ${opt.closeTimeout || 6000});
                
                const closeButton = document.querySelector('.close span');
                closeButton.onclick = closeWindow;
            };
                  
           
       
        </script>
    </body>
    </html>
  `)
}

module.exports = WcNotify;