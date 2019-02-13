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

		p.background(0);
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
};

const tubeP5 = new p5(tubeSketch, "#tube-canvas-container");
