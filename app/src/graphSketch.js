// graphSketch.js
// p5.js sketch file for the graph

const GRAPH_STROKE = "blue";
const GRAPH_SW = 2;
const GRAPH_AXIS_STROKE = "white";
const GRAPH_AXIS_SW = 2.5;
const GRAPH_PADDING_HEIGHT = 0.15;
const GRAPH_PADDING_WIDTH = 0.1;
const GRAPH_AXIS_STEP = 5;
const GRAPH_AXIS_LINE_HEIGHT = 2;
const GRAPH_AXIS_LINE_SW = 1.5;
const GRAPH_AXIS_FONT_SIZE = 10;
const GRAPH_ARROWTIP_LENGTH = 10;
const GRAPH_MAX_X_DIFF = 3;
const GRAPH_CUR_POINT_COLOR = "#9a4aef";
const GRAPH_CUR_POINT_SW = 4;

const graphSketch = p => {
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

		// labeling the x axis
		{
			const y = p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW;
			for (let i = 0; i < GRID_MAX; i += GRAPH_AXIS_STEP) {
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
		}

		// drawing the arrows at the end of the axis
		// x - axis
		p.line(
			p.width * (1 - GRAPH_PADDING_WIDTH),
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_AXIS_SW / 2,
			p.width * (1 - GRAPH_PADDING_WIDTH) - GRAPH_ARROWTIP_LENGTH,
			p.height * (1 - GRAPH_PADDING_HEIGHT) -
				GRAPH_ARROWTIP_LENGTH +
				GRAPH_AXIS_SW / 2
		);
		p.line(
			p.width * (1 - GRAPH_PADDING_WIDTH),
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_AXIS_SW / 2,
			p.width * (1 - GRAPH_PADDING_WIDTH) - GRAPH_ARROWTIP_LENGTH,
			p.height * (1 - GRAPH_PADDING_HEIGHT) +
				GRAPH_ARROWTIP_LENGTH +
				GRAPH_AXIS_SW / 2
		);
		// y - axis
		p.line(
			GRAPH_PADDING_WIDTH * p.width - GRAPH_AXIS_SW / 2,
			GRAPH_PADDING_HEIGHT * p.height,
			GRAPH_PADDING_WIDTH * p.width + GRAPH_ARROWTIP_LENGTH - GRAPH_AXIS_SW / 2,
			GRAPH_PADDING_HEIGHT * p.height + GRAPH_ARROWTIP_LENGTH
		);
		p.line(
			GRAPH_PADDING_WIDTH * p.width - GRAPH_AXIS_SW / 2,
			GRAPH_PADDING_HEIGHT * p.height,
			GRAPH_PADDING_WIDTH * p.width - GRAPH_ARROWTIP_LENGTH - GRAPH_AXIS_SW / 2,
			GRAPH_PADDING_HEIGHT * p.height + GRAPH_ARROWTIP_LENGTH
		);
	};

	p.drawGraph = () => {
		const keys = Object.keys(p.points)
			.map(parseFloat)
			.sort();
		for (let i = 1; i < keys.length; i++) {
			if (abs(keys[i - 1] - keys[i]) < GRAPH_MAX_X_DIFF)
				p.line(keys[i - 1], p.points[keys[i - 1]], keys[i], p.points[keys[i]]);
		}
		p.smooth();
	};

	p.recalcPoints = () => {
		const wFactor = p.parent.clientWidth / p.prevWidth;
		const hFactor = p.parent.clientHeight / p.prevHeight;
		const keys = Object.keys(p.points);
		const newPoints = {};
		keys.forEach(key => {
			newPoints[key * wFactor] = p.points[key] * hFactor;
		});
		p.points = newPoints;
	};

	p.drawCurPoint = () => {
		p.stroke(GRAPH_CUR_POINT_COLOR);
		p.strokeWeight(GRAPH_CUR_POINT_SW);
		p.noFill();
		const x = map(
			uGrid,
			0,
			GRID_MAX,
			GRAPH_PADDING_WIDTH * graphP5.width,
			graphP5.width - GRAPH_PADDING_WIDTH * graphP5.width
		);
		const y = map(
			f(uGrid),
			0,
			f(GRID_MAX),
			graphP5.height - GRAPH_PADDING_HEIGHT * graphP5.height,
			GRAPH_PADDING_HEIGHT * graphP5.height
		);
		p.point(x, y);
	};

	p.reset = () => {
		p.noLoop();
		p.graphCnv = p.createCanvas(p.parent.clientWidth, p.parent.clientHeight);
		p.graphCnv.parent(p.parent);
		p.graphCnv.id("graph-canvas");

		p.drawDiagram();

		p.stroke(GRAPH_STROKE);
		p.strokeWeight(GRAPH_SW);

		p.recalcPoints();
		p.drawGraph();

		p.prevWidth = p.parent.clientWidth;
		p.prevHeight = p.parent.clientHeight;

		p.loop();
	};

	p.setup = () => {
		p.parent = window.document.getElementById("graph-canvas-container");
		p.points = {};
		p.frameRate(10);
		p.reset();
	};

	p.draw = () => {
		p.drawDiagram();
		p.stroke(GRAPH_STROKE);
		p.strokeWeight(GRAPH_SW);
		p.drawGraph();
		p.drawCurPoint();
	};
};

const graphP5 = new p5(graphSketch, "#graph-canvas-container");

const addPoint = () => {
	const x = map(
		uGrid,
		0,
		GRID_MAX,
		GRAPH_PADDING_WIDTH * graphP5.width,
		graphP5.width - GRAPH_PADDING_WIDTH * graphP5.width
	);
	const y = map(
		f(uGrid),
		0,
		f(GRID_MAX),
		graphP5.height - GRAPH_PADDING_HEIGHT * graphP5.height,
		GRAPH_PADDING_HEIGHT * graphP5.height
	);
	graphP5.points[x] = y;
};
