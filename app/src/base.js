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
		let context = this,
			args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
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

/////////////////////////////////////////////////////////////////////////

// constants ////////////////////////////////////////////////////////////

// tube: 460px * 208px
// electron spawning area / filament
let eSpawnWidth = 38;
let eSpawnHeight = 70;
let eSpawnStartX = 76;
let eSpawnStartY = 25;
const FILAMENT_MAX = 10;
let uFilament = 0;
const CATHODE_GLOW_COLOR = "#e05c23";
// TODO: use this, not hard-coded vals in tubeSketch.js
const CATHODE_GLOW_COLOR_ALPHA = 150;
let cathodeGlowRadius = 0;
const CATHODE_GLOW_MIN_RADIUS = 10;
const CATHODE_GLOW_MAX_RADIUS = 50;
const CATHODE_GLOW_PADDING = 0.3;
const CATHODE_CENTER_WIDTH = 0.05;
const CATHODE_CENTER_HEIGHT = 0.12;

// electron despawn area
let eLeftBound = 57;
let eRightBound = 393;
let eTopBound = 11;
let eBottomBound = 105;

// grid
let gridX = 315;
let uGrid = 0;
const GRID_LENGTH = 1;
const GRID_MAX = 25;

// electron constants
const ELECTRON_RADIUS = 2; //px
const ELECTRON_COLOR = "#4081e8"; //"#4e27b2"; //"#640ac8";
const ELECTRON_MASS = 9e-31;
const ELECTRON_CHARGE = 1.6e-19;
const MAX_ELECTRONS = 200;
const MIN_ELECTRONS = 10; // if filament voltage is applied
let curMaxElectrons = 0;
let electrons = [];

// mapping U to I
const f = U =>
	Math.sin(map(U % 4.7, 0, 4.7, 0, (5 / 6) * Math.PI)) * Math.exp(U / 20);
// TODO: add f(U) to be realistic

// glow constants
const GLOW_COLOR = { mercury: "#9f40e8", neon: "#ed6517" };
const GLOW_RADIUS = 10;
const GLOW_FADE = 10;

// glow area constants
const GLOW_OFFSET = { mercury: 0.4, neon: 0 };
const GLOW_DISTANCE = { mercury: 4.9, neon: 18.7 };
const MIN_GLOWS = 2;
const MAX_GLOWS = 10;
const GLOW_ERROR = 0.3;
const ranGlowError = () => Math.random() * 2 * GLOW_ERROR - GLOW_ERROR;

/////////////////////////////////////////////////////////////////////////

// Set ranges for inputs ////////////////////////////////////////////////
const MATERIAL_INPUTS = document.getElementsByName("material");
const filamentInput = document.getElementById("filament");
const gridInput = document.getElementById("grid");

filamentInput.setAttribute("max", FILAMENT_MAX);
gridInput.setAttribute("max", GRID_MAX);

/////////////////////////////////////////////////////////////////////////

// handle inputs ////////////////////////////////////////////////////////

let curMaterial;
let newEProb = 0;
let glowProb = 0;

// radio group
MATERIAL_INPUTS.forEach(node => {
	node.addEventListener("input", () => {
		curMaterial = node.value;
	});
});

// intitial trigger
MATERIAL_INPUTS[0].dispatchEvent(new Event("input"));

// sliders
const handleFilamentInput = e => {
	uFilament = filamentInput.value;
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
};

const handleGridInput = e => {
	uGrid = gridInput.value;
	drawOnGraph();
	curMaxElectrons =
		uGrid === 0 ? 0 : map(uGrid, 0, GRID_MAX, MIN_ELECTRONS, MAX_ELECTRONS);
};

filamentInput.addEventListener("input", handleFilamentInput);
gridInput.addEventListener("input", handleGridInput);
/////////////////////////////////////////////////////////////////////////

// simulation loop //////////////////////////////////////////////////////
const SIMULATION_TIMEOUT_MS = 10;
const SIMULATION_TIMEOUT = SIMULATION_TIMEOUT_MS / 1000;
/////////////////////////////////////////////////////////////////////////
