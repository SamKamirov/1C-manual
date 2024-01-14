const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1920, 
        height: 1080, 
        webPreferences: {preload: path.join(__dirname, 'preload.js')},
        minWidth: 500,
        minHeight: 500,
    })
    Menu.setApplicationMenu(null);
    win.loadFile('index.html');
};

app.whenReady().then(() => createWindow())
