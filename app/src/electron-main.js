"use strict";
exports.__esModule = true;
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.onWindowAllClosed = function () {
        if (process.platform !== "darwin") {
            Main.application.quit();
        }
    };
    Main.onClose = function () {
        // Dereference the window object.
        Main.mainWindow = null;
    };
    Main.onReady = function () {
        Main.mainWindow = new Main.BrowserWindow({ width: 800, height: 600 });
        Main.mainWindow.loadURL("file://" + __dirname + "/../public/index.html");
        Main.mainWindow.on("closed", Main.onClose);
        Main.mainWindow.webContents.openDevTools();
    };
    Main.main = function (app, browserWindow) {
        // we pass the Electron.App object and the
        // Electron.BrowserWindow into this function
        // so this class has no dependencies. This
        // makes the code easier to write tests for
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on("window-all-closed", Main.onWindowAllClosed);
        Main.application.on("ready", Main.onReady);
    };
    return Main;
}());
exports["default"] = Main;
