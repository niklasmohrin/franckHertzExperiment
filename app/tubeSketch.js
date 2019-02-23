// p5.js sketch file for the tube

const tubeSketch = function(p) {
	p.preload = () => {
		// replaced with html img tag
		// console.log("loadings imgs");
		// p.tubeImg = p.loadImage("assets/tube.png");
		// p.circuitImg = p.loadImage("assets/schaltung.png");
		// console.log("done loading imgs");
	};

	p.reset = () => {
		p.noLoop();
		p.tubeCnv = p.createCanvas(p.parent.clientWidth, p.parent.clientHeight);
		p.tubeCnv.parent(p.parent);
		p.tubeCnv.id("tube-canvas");

		eSpawnWidth = (40 * p.parent.clientWidth) / 460;
		eSpawnHeight = (70 * p.parent.clientHeight) / 208;
		eSpawnStartX = (80 * p.parent.clientWidth) / 460;
		eSpawnStartY = (25 * p.parent.clientHeight) / 208;

		eLeftBound = (57 * p.parent.clientWidth) / 460;
		eRightBound = (393 * p.parent.clientWidth) / 460;
		eTopBound = (11 * p.parent.clientHeight) / 208;
		eBottomBound = (105 * p.parent.clientHeight) / 208;

		gridX = (315 * p.parent.clientWidth) / 460;

		// eSpawnWidth *= p.parent.clientWidth / p.prevWidth;
		// eSpawnStartX *= p.parent.clientWidth / p.prevWidth;
		// eSpawnHeight *= p.parent.clientHeight / p.prevHeight;
		// eSpawnStartY *= p.parent.clientHeight / p.prevHeight;

		// eLeftBound *= p.parent.clientWidth / p.prevWidth;
		// eRightBound *= p.parent.clientWidth / p.prevWidth;
		// eTopBound *= p.parent.clientHeight / p.prevHeight;
		// eBottomBound *= p.parent.clientHeight / p.prevHeight;

		electrons.forEach(e => {
			e.x *= p.parent.clientWidth / p.prevWidth;
			e.y *= p.parent.clientHeight / p.prevHeight;
		});

		p.prevWidth = p.parent.clientWidth;
		p.prevHeight = p.parent.clientHeight;

		p.background(0);
		p.frameRate(50);

		// p.glowCnv = p.createGraphics(p.width, p.height);
		// p.glowCnv.noStroke();

		p.loop();
	};

	p.setup = () => {
		p.parent = window.document.getElementById("tube-canvas-container");
		p.glows = [];
		p.reset();
	};

	p.draw = () => {
		p.clear();

		p.stroke(ELECTRON_COLOR);
		p.strokeWeight(ELECTRON_RADIUS);
		p.fill(ELECTRON_COLOR);

		for (let e of electrons) {
			p.point(e.x, e.y);
		}

		p.noStroke();
		// p.fill(GLOW_COLOR);
		const c = p.color(GLOW_COLOR);

		let toRemove = [];

		for (let i = p.glows.length - 1; i >= 0; i--) {
			p.glows[i].a -= GLOW_FADE;
			const glow = p.glows[i];
			if (glow.a <= 255) {
				c.setAlpha(glow.a);
				p.fill(c);
				p.ellipse(glow.x, glow.y, GLOW_RADIUS, GLOW_RADIUS);
			} else toRemove.push(i);
		}

		toRemove.forEach(index => p.glows.pop(index));
	};

	p.glow = (x, y) => {
		p.glows.push({
			x,
			y,
			o: 1,
			a: 255
		});
	};
};

const tubeP5 = new p5(tubeSketch, "#tube-canvas-container");
