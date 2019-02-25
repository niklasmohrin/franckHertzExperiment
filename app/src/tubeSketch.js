// tubeSketch.js
// p5.js sketch file for the tube

const cr = 224;
const cg = 92;
const cb = 35;

const tubeSketch = function(p) {
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

	p.cathodeCnvReset = () => {
		// recalculate cathode rectangle
		p.cathodeRect = {
			min: {
				x: eSpawnStartX,
				y: eSpawnStartY
			},
			max: {
				x: eSpawnStartX + eSpawnWidth,
				y: eSpawnStartY + eSpawnHeight
			}
		};

		p.cathodeCnvRect = {
			min: {
				x: Math.floor(eSpawnStartX - CATHODE_GLOW_PADDING * eSpawnWidth),
				y: Math.floor(eSpawnStartY - CATHODE_GLOW_PADDING * eSpawnHeight)
			},
			max: {
				x: Math.floor(
					eSpawnStartX + eSpawnWidth + CATHODE_GLOW_PADDING * eSpawnWidth
				),
				y: Math.floor(
					eSpawnStartY + eSpawnHeight + CATHODE_GLOW_PADDING * eSpawnHeight
				)
			}
		};

		p.cathodeCnv = p.createGraphics(
			p.cathodeCnvRect.max.x - p.cathodeCnvRect.min.x,
			p.cathodeCnvRect.max.y - p.cathodeCnvRect.min.y
		);

		p.cathodeCnv.loadPixels();
		p.cathodeCnv.pixelDensity(1);
		// p.cathodeCnv.translate(p.cathodeCnv.width / 2, p.cathodeCnv.height / 2);
		p.cathodeCnv.cathodeRect = {
			min: {
				x:
					p.cathodeCnv.width / 2 -
					Math.floor(3 * CATHODE_GLOW_PADDING * eSpawnWidth),
				y:
					p.cathodeCnv.height / 2 -
					Math.floor(3 * CATHODE_GLOW_PADDING * eSpawnHeight)
			},
			max: {
				x:
					p.cathodeCnv.width / 2 +
					Math.floor(3 * CATHODE_GLOW_PADDING * eSpawnWidth),
				y:
					p.cathodeCnv.height / 2 +
					Math.floor(3 * CATHODE_GLOW_PADDING * eSpawnHeight)
			}
		};
		p.redrawCathodeGlow();
	};

	p.redrawCathodeGlow = () => {
		const cnv = p.cathodeCnv;

		cnv.clear();
		for (let x = 0; x < cnv.width; x++) {
			for (let y = 0; y < cnv.height; y++) {
				const loc = 4 * (x + y * cnv.width);

				const d = distanceToRect({ x, y }, cnv.cathodeRect);

				const alpha = map(d, 0, cathodeGlowRadius, 255, 0);

				if (alpha > 0) {
					cnv.pixels[loc] = cr;
					cnv.pixels[loc + 1] = cg;
					cnv.pixels[loc + 2] = cb;
					cnv.pixels[loc + 3] = constrain(alpha, 0, 255);
				} else {
					cnv.pixels[loc + 3] = 0;
				}

				// cnv.set();
			}
		}
		cnv.updatePixels();
	};

	p.reset = () => {
		p.noLoop();
		// delete old and create new canvas
		delete p.tubeCnv;
		p.tubeCnv = p.createCanvas(p.parent.clientWidth, p.parent.clientHeight);
		p.tubeCnv.parent(p.parent);
		p.tubeCnv.id("tube-canvas");

		// recalculate spawning area
		eSpawnWidth = (40 * p.parent.clientWidth) / 460;
		eSpawnHeight = (70 * p.parent.clientHeight) / 208;
		eSpawnStartX = (80 * p.parent.clientWidth) / 460;
		eSpawnStartY = (25 * p.parent.clientHeight) / 208;

		// recalculate boundaries
		eLeftBound = (57 * p.parent.clientWidth) / 460;
		eRightBound = (393 * p.parent.clientWidth) / 460;
		eTopBound = (11 * p.parent.clientHeight) / 208;
		eBottomBound = (105 * p.parent.clientHeight) / 208;

		// recalculate grid position
		gridX = (315 * p.parent.clientWidth) / 460;

		// recalculating electron positions
		electrons.forEach(e => {
			e.x *= p.parent.clientWidth / p.prevWidth;
			e.y *= p.parent.clientHeight / p.prevHeight;
		});

		// keeping track of old size for next resize
		p.prevWidth = p.parent.clientWidth;
		p.prevHeight = p.parent.clientHeight;

		// reset cathode glow canvas
		p.cathodeCnvReset();

		// vanish canvas
		p.background(0);

		p.loop();
	};

	p.setup = () => {
		p.noLoop();
		p.parent = window.document.getElementById("tube-canvas-container");
		p.glows = [];
		p.frameRate(50);
		// initial reset
		p.reset();
	};

	p.draw = () => {
		p.clear();
		p.drawElectrons();
		if (p.frameCount % 10 === 0) {
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
};

const tubeP5 = new p5(tubeSketch, "#tube-canvas-container");
