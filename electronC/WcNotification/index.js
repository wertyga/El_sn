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
//     vertPos: // Vertical position



class WcNotify {
    constructor(opt) {
        this._queue = [];
        this._max = opt.maxWindows || 3;
        this._count = 0;
        this.opt = opt;
        this.maxItems = opt.maxItems || 3;
        this.notifyWidth = opt.width || 400;
        this.notifyHeight = opt.height || 200;
        this.horizPos = opt.horizPos || 100;
        this.vertPos = opt.vertPos || 10;


    };

    show() {
        // Make window
        let _notifyWindow = new BrowserWindow({
            parent: 'top',
            // modal: true,
            frame: false,
            // useContentSize: true,
            width: this.notifyWidth,
            height: this.notifyHeight,
            hasShadow: false,
            resizable: false,
            alwaysOnTop: true,
            show: false
        });

        // Load content
        const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView(this.opt));
        _notifyWindow.loadURL(file);

        this._count += 1;

        this._setEventHandleres(_notifyWindow);

        //Check count of windows
        if(this._count <= this._max) {
            const { width, height } = screen.getPrimaryDisplay().workAreaSize;
            // _notifyWindow.setPosition(width, height);
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

    _setWindowPosition(win) {
        // Get sizes
        const [notifyWidth, notifyHeight] = win.getSize();
        const  [notifyPositionX, notifyPositionY] = win.getPosition();
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;

        // Set position
        // console.log(notifyPositionX, notifyPositionY)
        // console.log(screen.getPrimaryDisplay().workAreaSize)
        const horizPos = width - (this.horizPos);
        const vertPos = height;
        console.log(screen.getPrimaryDisplay().workAreaSize)
        win.setPosition(horizPos, vertPos);
    };

    _setEventHandleres(win) {
        win.on('show', () => {
            setTimeout(() => this._setWindowPosition(win), 0)


            ipcMain.on('left', () => {
                win.setPosition(win.getPosition()[0] - 1, win.getPosition()[1]);
                console.log(win.getPosition())
            });
            ipcMain.on('right', () => {
                win.setPosition(win.getPosition()[0] + 1, win.getPosition()[1]);
                console.log(win.getPosition())
            });

            ipcMain.on(`windowID-${win.id}`, this._close);
            win.on('close', () => {
                ipcMain.removeListener(`windowID-${win.id}`, this._close);
            });

            win.on('closed', () => {
                this._count -= 1;
                win = null;
                if(this._queue.length > 0) {
                    this._queue[0].show();
                    this._queue.shift();
                };
            });
        });
    };
};

const loadView = (opt, close) => {
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
        width: '100vw',
        height: '100vh',
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
    <body style="margin: 0; overflow-x: hidden;">
    
        <div id="root" style="${rootStyleString}">
            <div class="close" style="text-align: right; padding-top: 10px; padding-right: 13px;"><span style="padding: 10px; cursor: pointer;">&times</span></div>
            <div class="up"></div>
            <div class="main" style="${mainContentStylesString}">
                <div class="image" style="${iconStyleString}">
                    <img style="width: 100%;" src=${(opt.icon && opt.icon.image) ? opt.icon.image : ''} alt="">
                </div>
                <div class="description" style="display: flex; flex-direction: column; flex: 1;">
                    <div class="title" style="${titleStyleString}">${opt.title.text}</div>
                    <div class="text" style="${textStyleString}">${opt.text.text}</div>
                </div>
            </div>
            <div class="footer"></div>
        </div>
    
        <script>
            function closeWindow() {
                var windowID = require('electron').remote.getCurrentWindow().id;
                require('electron').ipcRenderer.send('windowID-' + windowID, windowID);
            };
            
            window.onload = function() {
                // window.addEventListener('keyup', function(e) {
                //    if(e.keyCode === 27) {
                //        closeWindow()
                //    };
                // });

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