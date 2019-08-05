/* --------------------------------------------------------------------------
 * Franck Hertz Experiment
 * Visualisation of the Franck Hertz Experiment in an Electron app.
 *
 * Copyright (C) 2019 Niklas Mohrin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *-------------------------------------------------------------------------*/

const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

let win;

function createWindow() {
	// Create window
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: { nodeIntegration: false }
	});

	win.loadURL(
		url.format({
			pathname: path.join(__dirname, "../public/index.html"),
			protocol: "file:",
			slashes: true
		})
	);

	// Open devtools
	// win.webContents.openDevTools();

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
