const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

let win;

function createWindow() {
	// Create window
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: { nodeIntegration: true }
	});

	win.loadURL(
		url.format({
			pathname: path.join(__dirname, "../public/index.html"),
			protocol: "file:",
			slashes: true
		})
	);

	// Open devtools
	win.webContents.openDevTools();

	win.on("close", () => {
		win = null;
	});
}

// run createWindow() when the app is ready
app.on("ready", createWindow);

// quit when all windows are closed
app.on("window-all-closed", () => {
	app.quit();
});
