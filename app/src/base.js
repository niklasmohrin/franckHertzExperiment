// base.js

// util functions ///////////////////////////////////////////////////////
const map = (val, xmin, xmax, ymin, ymax) =>
	((val - xmin) / (xmax - xmin)) * (ymax - ymin) + ymin;

const rand = (start, end) => Math.floor(Math.random() * (end - start)) + start;

const distanceToRectSquared = (p, rect) => {
	const dx =
		p.x > rect.min.x && p.x < rect.max.x
			? 0
			: Math.max(rect.min.x - p.x, p.x - rect.max.x);
	const dy =
		p.y > rect.min.y && p.y < rect.max.y
			? 0
			: Math.max(rect.min.y - p.y, p.y - rect.max.y);
	return dx * dx + dy * dy;
};

const distanceToRect = (p, rect) => Math.sqrt(distanceToRectSquared(p, rect));

const constrain = (x, a, b) => (x > b ? b : x < a ? a : x);

const debounce = (func, wait, immediate) => {
	let timeout;
	return function() {
		const context = this,
			args = arguments;
		const later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

const avg = (...args) => {
	if (args.length > 0) {
		return args.reduce((prev, cur) => (prev += cur)) / args.length;
	} else {
		throw new Error("no args given to avg()");
	}
};

const hexToRgb = hex => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		  }
		: null;
};

const abs = x => (x < 0 ? -x : x);

/////////////////////////////////////////////////////////////////////////

// physics constants ////////////////////////////////////////////////////

// electron spawning area / filament

// postinions of several boundaries at dimensions tubeWidth * tubeHeight
const ORIG_DATA = {
	tubeWidth: 460,
	tubeHeight: 208,
	eSpawnStartX: 79,
	eSpawnStartY: 29,
	eSpawnEndX: 115,
	eSpawnEndY: 91,
	eSpawnWidth: 115 - 79,
	eSpawnHeight: 91 - 29,
	eLeftBound: 57,
	eRightBound: 393,
	eTopBound: 11,
	eBottomBound: 105,
	gridX: 315,
	textPositions: {
		width: 42,
		height: 16,
		yMin: 146,
		yMax: 162,
		uFilament: {
			xMin: 36,
			xMax: 78
		},
		uGrid: {
			xMin: 194,
			xMax: 238
		}
	}
};

// declaration and initialization of boundary variables
let {
	eSpawnStartX,
	eSpawnStartY,
	eSpawnEndX,
	eSpawnEndY,
	eSpawnWidth,
	eSpawnHeight,
	gridX,
	eLeftBound,
	eRightBound,
	eTopBound,
	eBottomBound,
	textPositions
} = ORIG_DATA;

// filament
const FILAMENT_MAX = 10;
let uFilament = 0;

// grid
const GRID_LENGTH = 1;
const GRID_MAX = 25;
let uGrid = 0;

// electron
const ELECTRON_MASS = 9e-31;
const ELECTRON_CHARGE = 1.6e-19;
const ELECTRON_ACC_MIN = 0;
const ELECTRON_ACC_MAX = 0.05;

// mapping U to I
const f = U =>
	Math.sin(map(U % 4.7, 0, 4.7, 0, (5 / 6) * Math.PI)) * Math.exp(U / 20);
// TODO: add f(U) to be realistic

/////////////////////////////////////////////////////////////////////////

// design constants /////////////////////////////////////////////////////

// electrons
const ELECTRON_RADIUS = 2; //px
const MAX_ELECTRONS = 200;
const MIN_ELECTRONS = 10; // if filament voltage is applied
let curMaxElectrons = 0;
let electrons = [];

// colors
const ELECTRON_COLOR = "#4081e8"; //"#4e27b2"; //"#640ac8";
const CATHODE_GLOW_COLOR = "#e05c23"; // TODO: use this, not hard-coded vals in tubeSketch.js
const GLOW_COLOR = { mercury: "#9f40e8", neon: "#ed6517" };

// cathode glow
const CATHODE_GLOW_MIN_RADIUS = 10;
const CATHODE_GLOW_MAX_RADIUS = 50;
let cathodeGlowRadius = 0;
const CATHODE_GLOW_PADDING = 0.5;
const CATHODE_CENTER_WIDTH = 0.05;
const CATHODE_CENTER_HEIGHT = 0.12;

// material glow constants
const GLOW_OFFSET = { mercury: 0.4, neon: 0 };
const GLOW_DISTANCE = { mercury: 4.9, neon: 18.7 };
const GLOW_ERROR = 0.3;
const ranGlowError = () => Math.random() * 2 * GLOW_ERROR - GLOW_ERROR;
const GLOW_RADIUS = 10;
const GLOW_FADE = 10;
const MIN_GLOWS = 2;
const MAX_GLOWS = 10;

// text constants
const TEXT_FONT_FAMILY = "ARIAL";
const TEXT_FONT_SIZE = 12;
const TEXT_FONT_STROKE = 1;

// Graph constants
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
const GRAPH_FRAMERATE = 30;

/////////////////////////////////////////////////////////////////////////

// Set ranges for inputs ////////////////////////////////////////////////
const materialInputs = document.getElementsByName("material");
const filamentInput = document.getElementById("filament");
const gridInput = document.getElementById("grid");
const SPAN_UFILAMENT = document.getElementById("uFilament-text-span");
const SPAN_UGRID = document.getElementById("uGrid-text-span");

filamentInput.setAttribute("max", FILAMENT_MAX);
gridInput.setAttribute("max", GRID_MAX);

/////////////////////////////////////////////////////////////////////////

// handle inputs ////////////////////////////////////////////////////////
let curMaterial;
let newEProb = 0;
let glowProb = 0;

// radio group
materialInputs.forEach(node => {
	node.addEventListener("input", () => {
		curMaterial = node.value;
	});
});
// initial trigger
materialInputs[0].dispatchEvent(new Event("input"));

// sliders
const handleFilamentInput = () => {
	uFilament = Number(filamentInput.value);
	newEProb = uFilament / 20;
	glowProb = uFilament * 0.5e-2;
	// adjust cathode glow radius based on uFilament
	cathodeGlowRadius = map(
		uFilament,
		0,
		FILAMENT_MAX,
		CATHODE_GLOW_MIN_RADIUS,
		CATHODE_GLOW_MAX_RADIUS
	);
	// adjust to window size
	cathodeGlowRadius *= avg(window.innerWidth, window.innerHeight) / 678.5;
	scheduleCathodeRedraw();
	SPAN_UFILAMENT.innerText = uFilament.toFixed(2) + " V";
};

const handleGridInput = () => {
	uGrid = Number(gridInput.value);
	addPoint();
	curMaxElectrons =
		uGrid === 0 ? 0 : map(uGrid, 0, GRID_MAX, MIN_ELECTRONS, MAX_ELECTRONS);
	SPAN_UGRID.innerText = uGrid.toFixed(2) + " V";
};

filamentInput.addEventListener("input", handleFilamentInput);
gridInput.addEventListener("input", handleGridInput);
/////////////////////////////////////////////////////////////////////////

// Positioning calculations /////////////////////////////////////////////
// map tube and cathode areas to new dimensions
const recalculateBoundaries = (w, h) => {
	const wFactor = w / ORIG_DATA.tubeWidth;
	const hFactor = h / ORIG_DATA.tubeHeight;
	// recalculate spawning area
	eSpawnStartX = ORIG_DATA.eSpawnStartX * wFactor;
	eSpawnStartY = ORIG_DATA.eSpawnStartY * hFactor;
	eSpawnEndX = ORIG_DATA.eSpawnEndX * wFactor;
	eSpawnEndY = ORIG_DATA.eSpawnEndY * hFactor;
	eSpawnWidth = ORIG_DATA.eSpawnWidth * wFactor;
	eSpawnHeight = ORIG_DATA.eSpawnHeight * hFactor;

	// recalculate boundaries
	eLeftBound = ORIG_DATA.eLeftBound * wFactor;
	eRightBound = ORIG_DATA.eRightBound * wFactor;
	eTopBound = ORIG_DATA.eTopBound * hFactor;
	eBottomBound = ORIG_DATA.eBottomBound * hFactor;

	// recalculate grid position
	gridX = ORIG_DATA.gridX * wFactor;

	// text rects
	textPositions = {
		width: ORIG_DATA.textPositions.width * wFactor,
		height: ORIG_DATA.textPositions.height * hFactor,
		yMin: ORIG_DATA.textPositions.yMin * hFactor,
		yMax: ORIG_DATA.textPositions.yMax * hFactor,
		uFilament: {
			xMin: ORIG_DATA.textPositions.uFilament.xMin * wFactor,
			xMax: ORIG_DATA.textPositions.uFilament.xMax * wFactor
		},
		uGrid: {
			xMin: ORIG_DATA.textPositions.uGrid.xMin * wFactor,
			xMax: ORIG_DATA.textPositions.uGrid.xMin * wFactor
		}
	};
};

const repositionSpans = () => {
	SPAN_UFILAMENT.style.left = textPositions.uFilament.xMin.toString() + "px";
	SPAN_UFILAMENT.style.top = textPositions.yMin.toString() + "px";
	SPAN_UGRID.style.left = textPositions.uGrid.xMin.toString() + "px";
	SPAN_UGRID.style.top = textPositions.yMin.toString() + "px";
	SPAN_UFILAMENT.style.width = SPAN_UGRID.style.width =
		textPositions.width.toString() + "px";
	SPAN_UFILAMENT.style.height = SPAN_UGRID.style.height =
		textPositions.height.toString() + "px";
};
/////////////////////////////////////////////////////////////////////////

// simulation loop //////////////////////////////////////////////////////
const SIMULATION_TIMEOUT_MS = 10;
const SIMULATION_TIMEOUT = SIMULATION_TIMEOUT_MS / 1000;
/////////////////////////////////////////////////////////////////////////
