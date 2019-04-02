import p5 = require("p5");
import {
	hexToRgb,
	CATHODE_GLOW_COLOR,
	ELECTRON_COLOR,
	ELECTRON_RADIUS,
	eRightBound,
	eLeftBound,
	eBottomBound,
	eTopBound,
	GLOW_COLOR,
	curMaterial,
	GLOW_FADE,
	GLOW_RADIUS,
	eSpawnStartX,
	CATHODE_GLOW_PADDING,
	eSpawnWidth,
	eSpawnStartY,
	eSpawnHeight,
	eSpawnEndX,
	eSpawnEndY,
	CATHODE_CENTER_WIDTH,
	CATHODE_CENTER_HEIGHT,
	distanceToRect,
	map,
	uFilament,
	FILAMENT_MAX,
	constrain,
	recalculateBoundaries,
	debounce,
	Rectangle
} from "./base";
import { ParticleElectron } from "./ParticleElectron";

declare let electrons: ParticleElectron[];
declare let cathodeGlowRadius: number;

// tubeSketch.js
// p5.js sketch file for the tube

// destruct color into rgb values for later use
const { r: cr, g: cg, b: cb } = hexToRgb(CATHODE_GLOW_COLOR);

export interface Glow {
	x: number;
	y: number;
	a: number;
}

export class TubeSketch {
	// Drawing methods ////////////////////////////////////////////////////////////////////////////
	static drawElectrons = (p: p5) => {
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

	static drawGlows = (p: p5) => {
		p.noStroke();
		const c = p.color(GLOW_COLOR[curMaterial]);
		for (let i = TubeSketch.glows.length - 1; i > -1; i--) {
			TubeSketch.glows[i].a -= GLOW_FADE;
			const glow = TubeSketch.glows[i];
			if (glow.a > 0) {
				c.setAlpha(glow.a);
				p.fill(c);
				p.ellipse(glow.x, glow.y, GLOW_RADIUS, GLOW_RADIUS);
			} else TubeSketch.glows.splice(i, 1);
		}
	};
	///////////////////////////////////////////////////////////////////////////////////////////////

	// Cathode Drawing ////////////////////////////////////////////////////////////////////////////
	static cathodeCnvReset = (p: p5) => {
		// recalculate dimensions of the cathode canvas
		TubeSketch.cathodeCnvRect = {
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
		delete TubeSketch.cathodeCnv;
		document.body.removeChild(document.body.lastChild);
		const w = TubeSketch.cathodeCnvRect.max.x - TubeSketch.cathodeCnvRect.min.x;
		const h = TubeSketch.cathodeCnvRect.max.y - TubeSketch.cathodeCnvRect.min.y;
		TubeSketch.cathodeCnv = p.createGraphics(w, h);

		// setup for drawing
		TubeSketch.cathodeCnv.loadPixels();
		TubeSketch.cathodeCnv.pixelDensity(1);

		// draw the canvas
		TubeSketch.redrawCathodeGlow(p);
	};

	static redrawCathodeGlow = (p: p5) => {
		const cnv = TubeSketch.cathodeCnv;
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
		TubeSketch.cathodeDrawn = true;
	};
	///////////////////////////////////////////////////////////////////////////////////////////////

	// tubeP5 reset, setup and draw; glow scheduler ///////////////////////////////////////////////
	static reset = (p: p5) => {
		p.noLoop();
		// delete old and create new canvas
		delete TubeSketch.tubeCnv;
		TubeSketch.tubeCnv = p.createCanvas(
			TubeSketch.parent.clientWidth,
			TubeSketch.parent.clientHeight
		);
		TubeSketch.tubeCnv.parent(TubeSketch.parent);
		TubeSketch.tubeCnv.id("tube-canvas");

		// recalculate spawning area, boundaries and grid position
		recalculateBoundaries(
			TubeSketch.parent.clientWidth,
			TubeSketch.parent.clientHeight
		);

		// recalculate electron positions
		electrons.forEach(e => {
			e.x *= TubeSketch.parent.clientWidth / TubeSketch.prevWidth;
			e.y *= TubeSketch.parent.clientHeight / TubeSketch.prevHeight;
		});

		// keep track of old size for next resize event
		TubeSketch.prevWidth = TubeSketch.parent.clientWidth;
		TubeSketch.prevHeight = TubeSketch.parent.clientHeight;

		// reset cathode glow canvas
		TubeSketch.cathodeCnvReset(p);

		// vanish canvas
		p.background(0);

		// start the loop
		p.frameRate(50);
		p.loop();
	};

	static setup = (p: p5) => {
		p.noLoop();
		// TubeSketch.parent = window.document.getElementById("tube-canvas-container");
		TubeSketch.glows = [];
		// initial reset
		TubeSketch.reset(p);
	};

	static draw = (p: p5) => {
		p.clear();
		TubeSketch.drawElectrons(p);
		if (!TubeSketch.cathodeDrawn || p.frameCount % 10 === 0) {
			TubeSketch.redrawCathodeGlow(p);
		}
		// draw cathode glow
		p.image(
			TubeSketch.cathodeCnv,
			TubeSketch.cathodeCnvRect.min.x,
			TubeSketch.cathodeCnvRect.min.y
		);
		TubeSketch.drawGlows(p);
	};

	static glow = (p: p5, x, y) => {
		// schedule glow
		TubeSketch.glows.push({
			x,
			y,
			a: 255
		});
	};
	static glows: Glow[];
	static cathodeCnvRect: Rectangle;
	static cathodeCnv: any;
	static cathodeDrawn: boolean;
	static tubeCnv: any;
	static parent: any;
	static prevWidth: any;
	static prevHeight: any;
}

export const tubeP5 = new p5(p => {
	p.preload = () => {};
	p.setup = () => TubeSketch.reset(p);
	p.draw = () => TubeSketch.draw(p);
}, document.getElementById("#tube-canvas-container"));

export const scheduleCathodeRedraw = debounce(
	() => (TubeSketch.cathodeDrawn = false),
	5
);

export function scheduleGlow(x, y) {
	TubeSketch.glow(tubeP5, x, y);
}
