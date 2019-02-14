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
		p.loop();
	};

	p.setup = () => {
		p.parent = window.document.getElementById("tube-canvas-container");
		p.reset();
	};

	p.draw = () => {
		p.clear();
		// replaced with html img tag

		// p.image(p.tubeImg, 0, 0, p.width, (p.height * 110) / 208);
		// p.image(
		// 	p.circuitImg,
		// 	0,
		// 	(p.height * 110) / 208,
		// 	p.width,
		// 	(p.height * 98) / 208
		// );

		p.stroke(ELECTRON_COLOR);
		p.strokeWeight(ELECTRON_RADIUS);
		p.fill(ELECTRON_COLOR);

		for (let e of electrons) {
			p.point(e.x, e.y);
		}
	};

	p.glow = (x, y) => {
		console.log("glow");
	};
};

const tubeP5 = new p5(tubeSketch, "#tube-canvas-container");
