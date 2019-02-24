// graphSketch.js
// p5.js sketch file for the graph

const GRAPH_STROKE = "blue";
const GRAPH_SW = 2;
const GRAPH_AXIS_STROKE = "white";
const GRAPH_AXIS_SW = 3;
const GRAPH_PADDING_HEIGHT = 0.15;
const GRAPH_PADDING_WIDTH = 0.1;
const GRAPH_AXIS_STEP = 5;
const GRAPH_AXIS_LINE_HEIGHT = 2;
const GRAPH_AXIS_LINE_SW = 2;
const GRAPH_AXIS_FONT_SIZE = 10;

const graphSketch = function(p) {
	p.drawDiagram = () => {
		p.background(0);

		p.stroke(GRAPH_AXIS_STROKE);
		p.strokeWeight(GRAPH_AXIS_SW);
		p.noFill();

		p.line(
			GRAPH_PADDING_WIDTH * p.width - GRAPH_SW,
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW,
			p.width * (1 - GRAPH_PADDING_WIDTH) - GRAPH_SW,
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW
		);
		p.line(
			GRAPH_PADDING_WIDTH * p.width - GRAPH_SW,
			GRAPH_PADDING_HEIGHT * p.height + GRAPH_SW,
			GRAPH_PADDING_WIDTH * p.width - GRAPH_SW,
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW
		);

		p.strokeWeight(GRAPH_AXIS_LINE_SW);
		p.textSize(GRAPH_AXIS_FONT_SIZE);
		p.textAlign(p.CENTER, p.CENTER);

		let y = p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW;
		for (let i = 0; i <= GRID_MAX; i += GRAPH_AXIS_STEP) {
			let x = map(
				i,
				0,
				GRID_MAX,
				GRAPH_PADDING_WIDTH * p.width,
				p.width * (1 - GRAPH_PADDING_WIDTH)
			);
			if (i > 0)
				p.line(x, y - GRAPH_AXIS_LINE_HEIGHT, x, y + GRAPH_AXIS_LINE_HEIGHT);

			p.text(i, x, y + GRAPH_AXIS_LINE_HEIGHT + GRAPH_AXIS_FONT_SIZE);
		}
	};

	p.reset = () => {
		p.noLoop();
		p.graphCnv = p.createCanvas(p.parent.clientWidth, p.parent.clientHeight);
		p.graphCnv.parent(p.parent);
		p.graphCnv.id("graph-canvas");

		p.drawDiagram();

		p.stroke(GRAPH_STROKE);
		p.strokeWeight(GRAPH_SW);

		p.points.forEach(point => {
			point[0] *= p.parent.clientWidth / p.prevWidth;
			point[1] *= p.parent.clientHeight / p.prevHeight;
			p.point(Math.floor(point[0]), Math.floor(point[1]));
		});

		p.prevWidth = p.parent.clientWidth;
		p.prevHeight = p.parent.clientHeight;

		p.loop();
	};

	p.setup = () => {
		p.parent = window.document.getElementById("graph-canvas-container");
		p.points = [];
		p.frameRate(10);
		p.reset();
	};

	p.draw = () => {
		p.drawDiagram();
		p.stroke(GRAPH_STROKE);
		p.strokeWeight(GRAPH_SW);
		p.points.forEach(point =>
			p.point(Math.floor(point[0]), Math.floor(point[1]))
		);
	};
};

const graphP5 = new p5(graphSketch, "#graph-canvas-container");

const drawOnGraph = () => {
	const point = ([x, y] = [
		Math.floor(
			map(
				uGrid,
				0,
				GRID_MAX,
				GRAPH_PADDING_WIDTH * graphP5.width,
				graphP5.width - GRAPH_PADDING_WIDTH * graphP5.width
			)
		),
		Math.floor(
			map(
				f(uGrid),
				0,
				f(GRID_MAX),
				graphP5.height - GRAPH_PADDING_HEIGHT * graphP5.height,
				GRAPH_PADDING_HEIGHT * graphP5.height
			)
		)
	]);
	graphP5.point(x, y);
	graphP5.points.push(point);
};
