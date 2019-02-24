// base.js

// util functions ///////////////////////////////////////////////////////
const map = (val, xmin, xmax, ymin, ymax) =>
	((val - xmin) / (xmax - xmin)) * (ymax - ymin) + ymin;

const rand = (start, end) => Math.floor(Math.random() * (end - start)) + start;

/////////////////////////////////////////////////////////////////////////

// constants ////////////////////////////////////////////////////////////

// tube: 460px * 208px
// electron spawning area / filament
let eSpawnWidth = 40;
let eSpawnHeight = 70;
let eSpawnStartX = 80;
let eSpawnStartY = 25;
const FILAMENT_MAX = 10;

// tube / electron despawn area
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
const ELECTRON_COLOR = "#4e27b2"; //"#640ac8";
const ELECTRON_MASS = 9e-31;
const ELECTRON_CHARGE = 1.6e-19;
const MAX_ELECTRONS = 200;
let electrons = [];

// mapping U to I
const f = U =>
	Math.sin(map(U % 4.7, 0, 4.7, 0, (5 / 6) * Math.PI)) * Math.exp(U / 20);
// TODO: add f(U) to be realistic

// glow constants
const GLOW_COLOR = "#ed6517";
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
filamentInput.addEventListener("input", e => {
	newEProb = filamentInput.value / 20;
	glowProb = filamentInput.value * 0.5e-2;
});

gridInput.addEventListener("input", e => {
	uGrid = e.target.value;
	drawOnGraph();
});
/////////////////////////////////////////////////////////////////////////

// simulation loop //////////////////////////////////////////////////////
const SIMULATION_TIMEOUT_MS = 10;
const SIMULATION_TIMEOUT = SIMULATION_TIMEOUT_MS / 1000;
/////////////////////////////////////////////////////////////////////////
