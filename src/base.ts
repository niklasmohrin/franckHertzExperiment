// base.js

import { scheduleCathodeRedraw, scheduleGlow } from "./tubeSketch";

// util functions ///////////////////////////////////////////////////////
export function map(
	val: number,
	xmin: number,
	xmax: number,
	ymin: number,
	ymax: number
): number {
	return ((val - xmin) / (xmax - xmin)) * (ymax - ymin) + ymin;
}

export function rand(start: number, end: number): number {
	return Math.floor(Math.random() * (end - start)) + start;
}

export interface Point {
	x: number;
	y: number;
}

export interface Rectangle {
	min: Point;
	max: Point;
}

export function distanceToRectSquared(p: Point, rect: Rectangle): number {
	const dx =
		p.x > rect.min.x && p.x < rect.max.x
			? 0
			: Math.max(rect.min.x - p.x, p.x - rect.max.x);
	const dy =
		p.y > rect.min.y && p.y < rect.max.y
			? 0
			: Math.max(rect.min.y - p.y, p.y - rect.max.y);
	return dx * dx + dy * dy;
}

export function distanceToRect(p: Point, rect: Rectangle): number {
	return Math.sqrt(distanceToRectSquared(p, rect));
}

export function constrain(x: number, a: number, b: number): number {
	return x > b ? b : x < a ? a : x;
}

export function debounce(
	func: Function,
	wait: number,
	immediate?: boolean
): Function {
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
}

export const avg = (...args: any[]) => {
	if (args.length > 0) {
		return args.reduce((prev, cur) => (prev += cur)) / args.length;
	} else {
		throw new Error("no args given to avg()");
	}
};

export const hexToRgb = hex => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		  }
		: null;
};

export const abs = x => (x < 0 ? -x : x);
/////////////////////////////////////////////////////////////////////////

// physics constants ////////////////////////////////////////////////////

// electron spawning area / filament

// postinions of several boundaries at dimensions tubeWidth * tubeHeight
export const ORIG_DATA = {
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
export let {
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

// electron
export const ELECTRON_MASS = 9e-31;
export const ELECTRON_CHARGE = 1.6e-19;
export const ELECTRON_ACC_MIN = 0;
export const ELECTRON_ACC_MAX = 0.03;
export const ELECTRON_HIT_SPEED_DECLINE = 1 / 3;
export const ELECTRON_SPEED_ERROR = 3;
export const ranSpeedError = () =>
	1 + Math.random() * 2 * ELECTRON_SPEED_ERROR - ELECTRON_SPEED_ERROR;
export const ELECTRON_MAX_BACKWARDS_SPEED = -0.5;

// grid
export const GRID_MAX = { mercury: 25, neon: 10 };
export let uGrid = 0;

// filament
export const FILAMENT_MAX = 10;
export let uFilament = 0;

export const COUNTER_VOLTAGE = 1.5;
export const COUNTER_FORCE = -0.01;

export const AMPERAGE_MAX = { mercury: 500, neon: 200 };
export let curAmperage = 0;

// mapping of grid voltage to amperage
// the data is read from images and saved as a js obj in pointData.js
export const f = U => {
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
		POINT_DATA[curMaterial][start][1] * map(uFilament, 0, FILAMENT_MAX, 0, 1)
	);
};
/////////////////////////////////////////////////////////////////////////

// design constants /////////////////////////////////////////////////////

// electrons
export const ELECTRON_RADIUS = 2; //px
export const MAX_ELECTRONS = 1000;
export const MIN_ELECTRONS = 100; // when filament voltage is applied
export let curMaxElectrons = 0;
export let electrons = [];

// colors
export const ELECTRON_COLOR = "#4081e8";
export const CATHODE_GLOW_COLOR = "#e05c23";
export const GLOW_COLOR = { mercury: "#9f40e8", neon: "#ed6517" };

// cathode glow
export const CATHODE_GLOW_MIN_RADIUS = 10;
export const CATHODE_GLOW_MAX_RADIUS = 50;
export let cathodeGlowRadius = 0;
export const CATHODE_GLOW_PADDING = 0.5;
export const CATHODE_CENTER_WIDTH = 0.05;
export const CATHODE_CENTER_HEIGHT = 0.12;

// material glow constants
export const GLOW_OFFSET = { mercury: 0.2, neon: 0 };
export const GLOW_DISTANCE = { mercury: 4.9, neon: 2 };
export const GLOW_ERROR = 0.3;
export const ranGlowError = () => Math.random() * 2 * GLOW_ERROR - GLOW_ERROR;
export const GLOW_RADIUS = 10;
export const GLOW_FADE = 10;
export let glowAreas = [];

export const recalculateGlowAreas = () => {
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

// Graph constants
export const GRAPH_STROKE = "blue";
export const GRAPH_SW = 2;
export const GRAPH_AXIS_STROKE = "white";
export const GRAPH_AXIS_SW = 2.5;
export const GRAPH_PADDING_HEIGHT = 0.15;
export const GRAPH_PADDING_WIDTH = 0.1;
export const GRAPH_X_AXIS_STEP = { mercury: 2.5, neon: 1.25 };
export const GRAPH_Y_AXIS_STEP = { mercury: 50, neon: 25 };
export const GRAPH_X_AXIS_LABEL_STEP = { mercury: 5, neon: 2.5 };
export const GRAPH_Y_AXIS_LABEL_STEP = { mercury: 100, neon: 50 };
export const GRAPH_AXIS_LINE_HEIGHT = 2;
export const GRAPH_AXIS_LINE_SW = 1.5;
export const GRAPH_AXIS_FONT_SIZE = 10;
export const GRAPH_ARROWTIP_LENGTH = 10;
export const GRAPH_CUR_POINT_COLOR = "#9a4aef";
export const GRAPH_CUR_POINT_SW = 4;
export const GRAPH_FRAMERATE = 30;
export const GRAPH_X_ACCURACY = { mercury: 300, neon: 500 };
export const GRAPH_POINTS_ARR_LEN = GRID_MAX.mercury * GRAPH_X_ACCURACY.mercury;
export const measuredPoints = new Array(GRAPH_POINTS_ARR_LEN);
export const addPoint = (x, y) => {
	measuredPoints[Math.floor(x * GRAPH_X_ACCURACY[curMaterial])] = y;
};
export const clearGraph = () => {
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

filamentInput.setAttribute("max", FILAMENT_MAX.toString());
/////////////////////////////////////////////////////////////////////////

// handle inputs ////////////////////////////////////////////////////////
export let curMaterial;
export let newEProb = 0;
export let uFilamentChanged = false;
export let resizing = false;

// sliders
export const handleFilamentInput = () => {
	uFilament = Number(filamentInput.nodeValue);
	newEProb = uFilament / 40;
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

export const handleGridInput = () => {
	uGrid = Number(gridInput.nodeValue);
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
		curMaterial = node.nodeValue;
		recalculateGlowAreas();
		clearGraph();
		gridInput.setAttribute("max", GRID_MAX[curMaterial]);
		gridInput.nodeValue = constrain(
			Number(gridInput.nodeValue),
			0,
			GRID_MAX[curMaterial]
		).toString();
		handleGridInput();
	});
});
// initial trigger
materialInputs[0].dispatchEvent(new Event("input"));
/////////////////////////////////////////////////////////////////////////

// Positioning calculations /////////////////////////////////////////////
// map tube and cathode areas to new dimensions
export const recalculateBoundaries = (w, h) => {
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

export const repositionSpans = () => {
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
export const SIMULATION_TIMEOUT_MS = 10;
export const SIMULATION_TIMEOUT = SIMULATION_TIMEOUT_MS / 1000;
/////////////////////////////////////////////////////////////////////////
