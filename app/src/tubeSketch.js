// tubeSketch.js
// p5.js sketch file for the tube

const tubeSketch = function(p) {
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

		electrons.forEach(e => {
			e.x *= p.parent.clientWidth / p.prevWidth;
			e.y *= p.parent.clientHeight / p.prevHeight;
		});

		p.prevWidth = p.parent.clientWidth;
		p.prevHeight = p.parent.clientHeight;

		p.background(0);
		p.frameRate(50);

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
			if (
				e.x < eRightBound &&
				e.x > eLeftBound &&
				e.y < eBottomBound &&
				e.y > eTopBound
			) {
				p.point(e.x, e.y);
			}
		}

		p.noStroke();
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
