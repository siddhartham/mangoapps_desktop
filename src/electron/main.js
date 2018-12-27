const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const Menu = electron.Menu

const path = require('path')
const url = require('url')
const Positioner = require('electron-positioner')
const windowStateKeeper = require('electron-window-state');
const electronLocalshortcut = require('electron-localshortcut');

let mode = 'prod'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let appIcon

let windowWidth = 1024;
let windowHeight = 758;

let isQuitting = false;

const isAlreadyRunning = app.makeSingleInstance(function () {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

if (isAlreadyRunning) {
	return app.quit();
}

function isWindowsOrmacOS() {
	return process.platform === 'darwin' || process.platform === 'win32';
}

const APP_ICON = path.join(__dirname, 'assets', 'icon');

const iconPath = function () {
	return APP_ICON + (process.platform === 'win32' ? '.ico' : '.png');
};

var MAIN_PAGE = url.format({
	pathname: path.join(__dirname, 'index.html'),
	protocol: 'file:',
	slashes: true
});

if(mode=='dev'){
	MAIN_PAGE = 'http://localhost:4200'
}

function createWindow () {
  const mainWindowState = windowStateKeeper({
		defaultWidth: windowWidth,
		defaultHeight: windowHeight
  });
  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
		y: mainWindowState.y,
		width: windowWidth,
    height: windowHeight,
    minHeight: windowHeight,
    minWidth: windowWidth,
    resizable: false,
    maximizable: false,
    alwaysOnTop: false,
    fullscreenable: false,
    icon: iconPath(),
    backgroundColor: '#190d0b',
    webPreferences: {
			allowDisplayingInsecureContent: true,
			nodeIntegration: true
    },
		show: false
  })

  appIcon = new Tray(iconPath())
  appIcon.window = mainWindow

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('focus', function () {
  		mainWindow.webContents.send('focus');
  });

  mainWindow.once('ready-to-show', function () {
  		mainWindow.show();
  });


  // Keep the app running in background on close event
	mainWindow.on('close', e => {
		if (!isQuitting) {
			e.preventDefault();

			if (process.platform === 'darwin') {
				app.hide();
			} else {
				mainWindow.hide();
			}
		}
		electronLocalshortcut.unregisterAll(mainWindow);
  });

  mainWindow.setTitle('MangoApps');
  appIcon.setToolTip('MangoApps')

  //appIcon.window.on('blur', function(){
  //  if (!appIcon.window) { return }
  //  appIcon.window.hide()
  //})
  appIcon.window.setVisibleOnAllWorkspaces(true)
  appIcon.window.webContents.on('devtools-opened', (event, deviceList, callback) => {
    appIcon.window.setSize(windowWidth+400, windowHeight)
    appIcon.window.setResizable(true)
  })

  appIcon.window.webContents.on('devtools-closed', (event, deviceList, callback) => {
    appIcon.window.setSize(windowWidth, windowHeight)
    appIcon.window.setResizable(false)
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_PAGE)

  // Open the DevTools.
	if(mode=='dev')
  	mainWindow.webContents.openDevTools()

  mainWindowState.manage(mainWindow)

  return mainWindow
}

function registerLocalShortcuts(page) {
	// Somehow, reload action cannot be overwritten by the menu item
	electronLocalshortcut.register(mainWindow, 'CommandOrControl+R', function () {
		mainWindow.loadURL(MAIN_PAGE)
	});
}

function registerMenuItems() {
	// Create the Application's main menu
	var template = [{
			label: "Application",
			submenu: [
					{ label: "About Application", selector: "orderFrontStandardAboutPanel:" },
					{ type: "separator" },
					{ label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
			]}, {
			label: "Edit",
			submenu: [
					{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
					{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
					{ type: "separator" },
					{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
					{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
					{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
					{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
			]}
	];

	let menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu);
	appIcon.setContextMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  mainWindow = createWindow()

  const page = mainWindow.webContents;

	registerLocalShortcuts(page);

	registerMenuItems();

  page.on('dom-ready', function () {
		mainWindow.show();
  });
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
	electronLocalshortcut.unregisterAll(mainWindow);
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('will-quit', function () {
	// Unregister all the shortcuts so that they don't interfare with other apps
	electronLocalshortcut.unregisterAll(mainWindow);
});

app.on('before-quit', function () {
	isQuitting = true;
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
