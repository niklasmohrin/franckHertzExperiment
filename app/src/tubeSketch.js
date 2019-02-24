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

	p.drawCathodeGlow = () => {
		const cnv = p.cathodeCnv;

		if (p.frameCount % 10 === 0) {
			cnv.clear();
			// cnv.noStroke();
			// cnv.fill(CATHODE_GLOW_COLOR);
			// cnv.ellipse(cnv.width / 2, cnv.height / 2, cnv.width / 2, cnv.height / 2);
			cnv.loadPixels();
			for (let x = 0; x < cnv.width; x++) {
				for (let y = 0; y < cnv.height; y++) {
					const loc = 4 * (x + y * cnv.width);
					// let r = cnv.pixels[loc];
					// let g = cnv.pixels[loc + 1];
					// let b = cnv.pixels[loc + 2];
					// const a = cnv.pixels[loc + 3];
					// const d = distanceToRect({ x, y }, cnv.cathodeRect);
					const d = Math.sqrt(
						Math.pow(x - cnv.width / 2, 2) + Math.pow(y - cnv.height / 2, 2)
					);
					// const adjustAlpha =
					// 	(255 * (CATHODE_GLOW_RADIUS - d)) / CATHODE_GLOW_RADIUS;

					const alpha =
						d > CATHODE_GLOW_RADIUS
							? 0
							: map(d, 0, CATHODE_GLOW_RADIUS, 255, 0);

					// if (adjustAlpha == constrain(adjustAlpha, -255, 255))
					// 	console.log(adjustAlpha);
					cnv.pixels[loc] = cr;
					cnv.pixels[loc + 1] = cg;
					cnv.pixels[loc + 2] = cb;
					cnv.pixels[loc + 3] = 255;

					cnv.set();
				}
			}
			cnv.updatePixels();
		}
		p.image(cnv, p.cathodeCnvRect.min.x, p.cathodeCnvRect.min.y);
	};

	p.reset = () => {
		p.noLoop();
		// create and mount new canvas
		p.tubeCnv = p.createCanvas(p.parent.clientWidth, p.parent.clientHeight);
		p.tubeCnv.parent(p.parent);
		p.tubeCnv.id("tube-canvas");

		// recalculate spawning area
		eSpawnWidth = (40 * p.parent.clientWidth) / 460;
		eSpawnHeight = (70 * p.parent.clientHeight) / 208;
		eSpawnStartX = (80 * p.parent.clientWidth) / 460;
		eSpawnStartY = (25 * p.parent.clientHeight) / 208;

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
				x: eSpawnStartX - Math.floor(CATHODE_GLOW_PADDING * eSpawnWidth),
				y: eSpawnStartY - Math.floor(CATHODE_GLOW_PADDING * eSpawnHeight)
			},
			max: {
				x:
					eSpawnStartX +
					eSpawnWidth +
					Math.floor(CATHODE_GLOW_PADDING * eSpawnWidth),
				y:
					eSpawnStartY +
					eSpawnHeight +
					Math.floor(CATHODE_GLOW_PADDING * eSpawnHeight)
			}
		};

		p.cathodeCnv = p.createGraphics(
			p.cathodeCnvRect.max.x - p.cathodeCnvRect.min.x,
			p.cathodeCnvRect.max.y - p.cathodeCnvRect.min.y
		);
		// p.cathodeCnv.pixelDensity(1);
		// p.cathodeCnv.translate(p.cathodeCnv.width / 2, p.cathodeCnv.height / 2);
		p.cathodeCnv.cathodeRect = {
			min: {
				x: Math.floor(CATHODE_GLOW_PADDING * eSpawnWidth),
				y: Math.floor(CATHODE_GLOW_PADDING * eSpawnHeight)
			},
			max: {
				x: Math.floor(CATHODE_GLOW_PADDING * eSpawnWidth) + eSpawnWidth,
				y: Math.floor(CATHODE_GLOW_PADDING * eSpawnHeight) + eSpawnHeight
			}
		};

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
		p.drawCathodeGlow();
		p.drawElectrons();
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
