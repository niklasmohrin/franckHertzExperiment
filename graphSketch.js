// p5.js sketch file for the graph

const GRAPH_STROKE = "blue";
const GRAPH_SW = 2;

const graphSketch = function(p) {
	p.reset = () => {
		p.noLoop();
		p.graphCnv = p.createCanvas(p.parent.clientWidth, p.parent.clientHeight);
		p.graphCnv.parent(p.parent);
		p.graphCnv.id("graph-canvas");

		p.background(0);
		p.stroke(GRAPH_STROKE);
		p.strokeWeight(GRAPH_SW);
		p.noFill();
	};

	p.setup = () => {
		p.parent = window.document.getElementById("graph-canvas-container");
		p.reset();
	};

	p.draw = () => {};
};

const graphP5 = new p5(graphSketch, "#graph-canvas-container");

const drawOnGraph = () => {
	graphP5.point(
		Math.floor(map(uGrid, 0, GRID_MAX, 0, graphP5.width)),
		Math.floor(map(f(uGrid), 0, f(GRID_MAX), graphP5.height, 0))
	);
	// console.log(
	// 	"drew point at",
	// 	map(uGrid, 0, GRID_MAX, 0, graphP5.width),
	// 	map(f(uGrid), 0, f(GRID_MAX), graphP5.height, 0)
	// );
};
