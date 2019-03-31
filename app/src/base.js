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
	tubeWidth: 1920,
	tubeHeight: 819,
	eSpawnStartX: 288,
	eSpawnStartY: 157,
	eSpawnEndX: 418,
	eSpawnEndY: 454,
	eSpawnWidth: 418 - 288,
	eSpawnHeight: 454 - 157,
	eLeftBound: 286,
	eRightBound: 1670,
	eTopBound: 84,
	eBottomBound: 512,
	gridX: 1375,
	textPositions: {
		width: 200,
		height: 58,
		yMin: 566,
		yMax: 624,
		uFilamentX: 235,
		uGridX: 890,
		amperageX: 1750,
		uCounterX: 1550
	},
	textFontSize: 40
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
	textPositions,
	textFontSize
} = ORIG_DATA;

// filament
const FILAMENT_MAX = 10;
let uFilament = 0;

// electron
const ELECTRON_MASS = 9e-31;
const ELECTRON_CHARGE = 1.6e-19;
const ELECTRON_ACC_MIN = 0;
const ELECTRON_ACC_MAX = 0.03;
const ELECTRON_HIT_SPEED_DECLINE = 1 / 3;
const ELECTRON_CONSTANT_SPEED_DECLINE = 1 / 50;
const ELECTRON_SPEED_ERROR = 3;
const ranSpeedError = () =>
	1 + Math.random() * 2 * ELECTRON_SPEED_ERROR - ELECTRON_SPEED_ERROR;
const ELECTRON_MAX_BACKWARDS_SPEED = -0.5;

// grid
const GRID_LENGTH = 1;
const GRID_MAX = { mercury: 25, neon: 10 };
let uGrid = 0;

const COUNTER_VOLTAGE = 1.5;
const COUNTER_FORCE = -0.01;

const AMPERAGE_MAX = { mercury: 500, neon: 200 };
let curAmperage = 0;

// mapping of grid voltage to amperage
// the data is read from images and saved as a js obj in pointData.js
const f = U => {
	// find the closest voltage in the sorted data set with binary search
	let start = 0;
	let stop = POINT_DATA[curMaterial].length - 1;
	let middle = Math.floor((start + stop) / 2);
	while (POINT_DATA[curMaterial][middle][0] !== U && start < stop) {
		middle = Math.floor((start + stop) / 2);
		if (U < POINT_DATA[curMaterial][middle][0]) {
			stop = middle - 1;
		} else {
			start = middle + 1;
		}
	}
	// and return the corresponding amperage
	return (
		POINT_DATA[curMaterial][middle][1] * map(uFilament, 0, FILAMENT_MAX, 0, 1)
	);
};
/////////////////////////////////////////////////////////////////////////

// design constants /////////////////////////////////////////////////////

// electrons
const ELECTRON_RADIUS = 2; //px
const MAX_ELECTRONS = 1000;
const MIN_ELECTRONS = 100; // if filament voltage is applied
let curMaxElectrons = 0;
let electrons = [];

// colors
const ELECTRON_COLOR = "#4081e8";
const CATHODE_GLOW_COLOR = "#e05c23";
const GLOW_COLOR = { mercury: "#9f40e8", neon: "#ed6517" };

// cathode glow
const CATHODE_GLOW_MIN_RADIUS = 10;
const CATHODE_GLOW_MAX_RADIUS = 50;
let cathodeGlowRadius = 0;
const CATHODE_GLOW_PADDING = 0.5;
const CATHODE_CENTER_WIDTH = 0.05;
const CATHODE_CENTER_HEIGHT = 0.12;

// material glow constants
const GLOW_OFFSET = { mercury: 0.2, neon: 0 };
const GLOW_DISTANCE = { mercury: 4.9, neon: 2 };
const GLOW_ERROR = 0.3;
const ranGlowError = () => Math.random() * 2 * GLOW_ERROR - GLOW_ERROR;
const GLOW_RADIUS = 10;
const GLOW_FADE = 10;
const MIN_GLOWS = 2;
const MAX_GLOWS = 10;
let glowAreas = [];

const recalculateGlowAreas = () => {
	// calculate glow areas
	// starting at first area
	let curArea = GLOW_OFFSET[curMaterial] + GLOW_DISTANCE[curMaterial];
	glowAreas = [];
	// glow energy cannot surpass grid voltage
	while (curArea < uGrid) {
		glowAreas.push(curArea);
		curArea += GLOW_DISTANCE[curMaterial];
	}
};

// text constants
const TEXT_FONT_FAMILY = "ARIAL";
const TEXT_FONT_STROKE = 1;

// Graph constants
const GRAPH_STROKE = "blue";
const GRAPH_SW = 2;
const GRAPH_AXIS_STROKE = "white";
const GRAPH_AXIS_SW = 2.5;
const GRAPH_PADDING_HEIGHT = 0.15;
const GRAPH_PADDING_WIDTH = 0.1;
const GRAPH_X_AXIS_STEP = { mercury: 5, neon: 2.5 };
const GRAPH_Y_AXIS_STEP = { mercury: 100, neon: 50 };
const GRAPH_AXIS_LINE_HEIGHT = 2;
const GRAPH_AXIS_LINE_SW = 1.5;
const GRAPH_AXIS_FONT_SIZE = 10;
const GRAPH_ARROWTIP_LENGTH = 10;
const GRAPH_MAX_X_DIFF = 3;
const GRAPH_CUR_POINT_COLOR = "#9a4aef";
const GRAPH_CUR_POINT_SW = 4;
const GRAPH_FRAMERATE = 30;
const GRAPH_X_ACCURACY = { mercury: 300, neon: 500 };
const GRAPH_Y_ACCURACY = 300;
const GRAPH_POINTS_ARR_LEN = GRID_MAX.mercury * GRAPH_X_ACCURACY.mercury;
const measuredPoints = new Array(GRAPH_POINTS_ARR_LEN);
const addPoint = (x, y) => {
	measuredPoints[Math.floor(x * GRAPH_X_ACCURACY[curMaterial])] =
		y * GRAPH_Y_ACCURACY;
};
const clearGraph = () => {
	for (let i = 0; i < GRAPH_POINTS_ARR_LEN; i++) {
		delete measuredPoints[i];
	}
};
/////////////////////////////////////////////////////////////////////////

// Set ranges for inputs ////////////////////////////////////////////////
const materialInputs = document.getElementsByName("material");
const filamentInput = document.getElementById("filament");
const gridInput = document.getElementById("grid");
const SPAN_UFILAMENT = document.getElementById("uFilament-text-span");
const SPAN_UGRID = document.getElementById("uGrid-text-span");
const SPAN_AMPERAGE = document.getElementById("amperage-text-span");
const SPAN_UCOUNTER = document.getElementById("uCounter-text-span");

filamentInput.setAttribute("max", FILAMENT_MAX);
/////////////////////////////////////////////////////////////////////////

// handle inputs ////////////////////////////////////////////////////////
let curMaterial;
let newEProb = 0;
let glowProb = 0;
let uFilamentChanged = false;
let resizing = false;

// sliders
const handleFilamentInput = () => {
	uFilament = Number(filamentInput.value);
	newEProb = uFilament / 40;
	glowProb = uFilament * 0.25e-2;
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
	uFilamentChanged = !resizing;
};

const handleGridInput = () => {
	uGrid = Number(gridInput.value);
	curAmperage = f(uGrid);
	addPoint(uGrid, curAmperage);
	curMaxElectrons =
		uGrid * uFilament === 0
			? 0
			: map(
					uGrid * uFilament,
					0,
					GRID_MAX.mercury * AMPERAGE_MAX.mercury,
					MIN_ELECTRONS,
					MAX_ELECTRONS
			  );
	SPAN_UGRID.innerText = uGrid.toFixed(2) + " V";
	SPAN_AMPERAGE.innerText = curAmperage.toFixed(2) + " nA";
	if (uFilamentChanged) {
		clearGraph();
		uFilamentChanged = false;
	}
	recalculateGlowAreas();
};

filamentInput.addEventListener("input", handleFilamentInput);
gridInput.addEventListener("input", handleGridInput);

// radio group
materialInputs.forEach(node => {
	node.addEventListener("input", () => {
		curMaterial = node.value;
		recalculateGlowAreas();
		clearGraph();
		gridInput.setAttribute("max", GRID_MAX[curMaterial]);
		gridInput.value = constrain(gridInput.value, 0, GRID_MAX[curMaterial]);
		handleGridInput();
	});
});
// initial trigger
materialInputs[0].dispatchEvent(new Event("input"));
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
		uFilamentX: ORIG_DATA.textPositions.uFilamentX * wFactor,
		uGridX: ORIG_DATA.textPositions.uGridX * wFactor,
		amperageX: ORIG_DATA.textPositions.amperageX * wFactor,
		uCounterX: ORIG_DATA.textPositions.uCounterX * wFactor
	};

	textFontSize = ORIG_DATA.textFontSize * avg(wFactor, hFactor);
};

const repositionSpans = () => {
	SPAN_UFILAMENT.style.left =
		(textPositions.uFilamentX - textPositions.width / 2).toString() + "px";
	SPAN_UGRID.style.left =
		(textPositions.uGridX - textPositions.width / 2).toString() + "px";
	SPAN_AMPERAGE.style.left =
		(textPositions.amperageX - textPositions.width / 2).toString() + "px";
	SPAN_UCOUNTER.style.left =
		(textPositions.uCounterX - textPositions.width / 2).toString() + "px";
	SPAN_UFILAMENT.style.top = SPAN_UGRID.style.top = SPAN_AMPERAGE.style.top = SPAN_UCOUNTER.style.top =
		textPositions.yMin.toString() + "px";
	SPAN_UFILAMENT.style.width = SPAN_UGRID.style.width = SPAN_AMPERAGE.style.width = SPAN_UCOUNTER.style.width =
		textPositions.width.toString() + "px";
	SPAN_UFILAMENT.style.height = SPAN_UGRID.style.height = SPAN_AMPERAGE.style.height = SPAN_UCOUNTER.style.height =
		textPositions.height.toString() + "px";

	SPAN_UFILAMENT.style.fontSize = SPAN_UGRID.style.fontSize = SPAN_AMPERAGE.style.fontSize = SPAN_UCOUNTER.style.fontSize =
		textFontSize.toString() + "px";
};
/////////////////////////////////////////////////////////////////////////

// simulation loop //////////////////////////////////////////////////////
const SIMULATION_TIMEOUT_MS = 10;
const SIMULATION_TIMEOUT = SIMULATION_TIMEOUT_MS / 1000;
/////////////////////////////////////////////////////////////////////////
