import p5 = require("p5");
import {
	hexToRgb,
	CATHODE_GLOW_COLOR,
	ELECTRON_COLOR,
	ELECTRON_RADIUS,
	electrons,
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
	cathodeGlowRadius,
	uFilament,
	FILAMENT_MAX,
	constrain,
	recalculateBoundaries,
	debounce,
	Rectangle
} from "./base";

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
	drawElectrons = (p: p5) => {
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

	drawGlows = (p: p5) => {
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
	cathodeCnvReset = (p: p5) => {
		// recalculate dimensions of the cathode canvas
		this.cathodeCnvRect = {
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
		delete this.cathodeCnv;
		document.body.removeChild(document.body.lastChild);
		const w = this.cathodeCnvRect.max.x - this.cathodeCnvRect.min.x;
		const h = this.cathodeCnvRect.max.y - this.cathodeCnvRect.min.y;
		this.cathodeCnv = p.createGraphics(w, h);

		// setup for drawing
		this.cathodeCnv.loadPixels();
		this.cathodeCnv.pixelDensity(1);

		// draw the canvas
		this.redrawCathodeGlow(p);
	};

	redrawCathodeGlow = (p: p5) => {
		const cnv = this.cathodeCnv;
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
	reset = (p: p5) => {
		p.noLoop();
		// delete old and create new canvas
		delete this.tubeCnv;
		this.tubeCnv = p.createCanvas(
			this.parent.clientWidth,
			this.parent.clientHeight
		);
		this.tubeCnv.parent(this.parent);
		this.tubeCnv.id("tube-canvas");

		// recalculate spawning area, boundaries and grid position
		recalculateBoundaries(this.parent.clientWidth, this.parent.clientHeight);

		// recalculate electron positions
		electrons.forEach(e => {
			e.x *= this.parent.clientWidth / this.prevWidth;
			e.y *= this.parent.clientHeight / this.prevHeight;
		});

		// keep track of old size for next resize event
		this.prevWidth = this.parent.clientWidth;
		this.prevHeight = this.parent.clientHeight;

		// reset cathode glow canvas
		this.cathodeCnvReset(p);

		// vanish canvas
		p.background(0);

		// start the loop
		p.frameRate(50);
		p.loop();
	};

	setup = (p: p5) => {
		p.noLoop();
		// this.parent = window.document.getElementById("tube-canvas-container");
		TubeSketch.glows = [];
		// initial reset
		this.reset(p);
	};

	draw = (p: p5) => {
		p.clear();
		this.drawElectrons(p);
		if (!TubeSketch.cathodeDrawn || p.frameCount % 10 === 0) {
			this.redrawCathodeGlow(p);
		}
		// draw cathode glow
		p.image(
			this.cathodeCnv,
			this.cathodeCnvRect.min.x,
			this.cathodeCnvRect.min.y
		);
		this.drawGlows(p);
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
	cathodeCnvRect: Rectangle;
	cathodeCnv: any;
	static cathodeDrawn: boolean;
	tubeCnv: any;
	parent: any;
	prevWidth: any;
	prevHeight: any;
}

export const tubeP5 = new p5(p => {
	const tubeSketch = new TubeSketch();
	p.preload = () => {};
	p.setup = tubeSketch.reset;
	p.draw = tubeSketch.draw;
}, document.getElementById("#tube-canvas-container"));

export const scheduleCathodeRedraw = debounce(
	() => (TubeSketch.cathodeDrawn = false),
	5
);

export function scheduleGlow(x, y) {
	TubeSketch.glow(tubeP5, x, y);
}
