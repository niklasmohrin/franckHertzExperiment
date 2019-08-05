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

// tubeSketch.js
// p5.js sketch file for the tube

// destruct color into rgb values for later use
const { r: cr, g: cg, b: cb } = hexToRgb(CATHODE_GLOW_COLOR);

const tubeSketch = function(p) {
	// Drawing methods ////////////////////////////////////////////////////////////////////////////
	p.drawElectrons = () => {
		p.stroke(ELECTRON_COLOR);
		p.strokeWeight(ELECTRON_RADIUS);
		p.fill(ELECTRON_COLOR);
		for (let e of electrons) {
			if (
				e.x < eRightBound &&
				e.x > eLeftBound &&
				e.y < eBottomBound &&
				e.y > eTopBound
			) {
				p.point(e.x, e.y);
			}
		}
	};

	p.drawGlows = () => {
		p.noStroke();
		const c = p.color(GLOW_COLOR[curMaterial]);
		for (let i = p.glows.length - 1; i > -1; i--) {
			p.glows[i].a -= GLOW_FADE;
			const glow = p.glows[i];
			if (glow.a > 0) {
				c.setAlpha(glow.a);
				p.fill(c);
				p.ellipse(glow.x, glow.y, GLOW_RADIUS, GLOW_RADIUS);
			} else p.glows.splice(i, 1);
		}
	};
	///////////////////////////////////////////////////////////////////////////////////////////////

	// Cathode Drawing ////////////////////////////////////////////////////////////////////////////
	p.cathodeCnvReset = () => {
		// recalculate dimensions of the cathode canvas
		p.cathodeCnvRect = {
			min: {
				x: Math.floor(eSpawnStartX - CATHODE_GLOW_PADDING * eSpawnWidth),
				y: Math.floor(eSpawnStartY - CATHODE_GLOW_PADDING * eSpawnHeight)
			},
			max: {
				x: Math.floor(eSpawnEndX + CATHODE_GLOW_PADDING * eSpawnWidth),
				y: Math.floor(eSpawnEndY + CATHODE_GLOW_PADDING * eSpawnHeight)
			}
		};

		// recreate cathode canvas
		delete p.cathodeCnv;
		document.body.removeChild(document.body.lastChild);
		const w = p.cathodeCnvRect.max.x - p.cathodeCnvRect.min.x;
		const h = p.cathodeCnvRect.max.y - p.cathodeCnvRect.min.y;
		p.cathodeCnv = p.createGraphics(w, h);

		// setup for drawing
		p.cathodeCnv.loadPixels();
		p.cathodeCnv.pixelDensity(1);

		// draw the canvas
		p.redrawCathodeGlow();
	};

	p.redrawCathodeGlow = () => {
		const cnv = p.cathodeCnv;
		const cathodeCenter = {
			min: {
				x: cnv.width / 2 - eSpawnWidth * CATHODE_CENTER_WIDTH,
				y: cnv.height / 2 - eSpawnHeight * CATHODE_CENTER_HEIGHT
			},
			max: {
				x: cnv.width / 2 + eSpawnWidth * CATHODE_CENTER_WIDTH,
				y: cnv.height / 2 + eSpawnHeight * CATHODE_CENTER_HEIGHT
			}
		};
		cnv.clear();
		// iterate over all pixels
		for (let x = 0; x < cnv.width; x++) {
			for (let y = 0; y < cnv.height; y++) {
				// location in the pixel array
				const loc = 4 * (x + y * cnv.width);
				// distance to the cathode center rect
				const d = distanceToRect({ x, y }, cathodeCenter);
				// alpha mapping
				const alpha = map(
					d,
					0,
					cathodeGlowRadius,
					map(uFilament, 0, FILAMENT_MAX, 0, 310),
					0
				);
				// don't bother setting any colors when alpha is 0 (or lower)
				if (alpha > 0) {
					cnv.pixels[loc] = cr;
					cnv.pixels[loc + 1] = cg;
					cnv.pixels[loc + 2] = cb;
					cnv.pixels[loc + 3] = constrain(alpha, 0, 255);
				} else {
					cnv.pixels[loc + 3] = 0;
				}
			}
		}
		cnv.updatePixels();
		p.cathodeDrawn = true;
	};
	///////////////////////////////////////////////////////////////////////////////////////////////

	// tubeP5 reset, setup and draw; glow scheduler ///////////////////////////////////////////////
	p.reset = () => {
		p.noLoop();
		// delete old and create new canvas
		delete p.tubeCnv;
		p.tubeCnv = p.createCanvas(p.parent.clientWidth, p.parent.clientHeight);
		p.tubeCnv.parent(p.parent);
		p.tubeCnv.id("tube-canvas");

		// recalculate spawning area, boundaries and grid position
		recalculateBoundaries(p.parent.clientWidth, p.parent.clientHeight);

		// recalculate electron positions
		electrons.forEach(e => {
			e.x *= p.parent.clientWidth / p.prevWidth;
			e.y *= p.parent.clientHeight / p.prevHeight;
		});

		// keep track of old size for next resize event
		p.prevWidth = p.parent.clientWidth;
		p.prevHeight = p.parent.clientHeight;

		// reset cathode glow canvas
		p.cathodeCnvReset();

		// vanish canvas
		p.background(0);

		// start the loop
		p.frameRate(50);
		p.loop();
	};

	p.setup = () => {
		p.noLoop();
		p.parent = window.document.getElementById("tube-canvas-container");
		p.glows = [];
		// initial reset
		p.reset();
	};

	p.draw = () => {
		p.clear();
		p.drawElectrons();
		if (!p.cathodeDrawn || p.frameCount % 10 === 0) {
			p.redrawCathodeGlow();
		}
		// draw cathode glow
		p.image(p.cathodeCnv, p.cathodeCnvRect.min.x, p.cathodeCnvRect.min.y);
		p.drawGlows();
	};

	p.glow = (x, y) => {
		// schedule glow
		p.glows.push({
			x,
			y,
			a: 255
		});
	};

	///////////////////////////////////////////////////////////////////////////////////////////////
};

const tubeP5 = new p5(tubeSketch, "#tube-canvas-container");
const scheduleCathodeRedraw = debounce(() => (tubeP5.cathodeDrawn = false), 5);

function scheduleGlow(x, y) {
	tubeP5.glow(x, y);
}
