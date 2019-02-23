// base.js

// util functions ///////////////////////////////////////////////////////
const map = (val, xmin, xmax, ymin, ymax) =>
	((val - xmin) / (xmax - xmin)) * (ymax - ymin) + ymin;

const rand = (start, end) => Math.floor(Math.random() * (end - start)) + start;

/////////////////////////////////////////////////////////////////////////

// Set ranges for inputs ////////////////////////////////////////////////
const filamentInput = document.getElementById("filament");
const gridInput = document.getElementById("grid");

const FILAMENT_MAX = 10;
const GRID_MAX = 15;

filamentInput.setAttribute("max", FILAMENT_MAX);
gridInput.setAttribute("max", GRID_MAX);

/////////////////////////////////////////////////////////////////////////

// constants ////////////////////////////////////////////////////////////

// tube: 460px * 208px
// electron spawning area
let eSpawnWidth = 40;
let eSpawnHeight = 70;
let eSpawnStartX = 80;
let eSpawnStartY = 25;

// tube / electron despawn area
let eLeftBound = 57;
let eRightBound = 393;
let eTopBound = 11;
let eBottomBound = 105;

// grid position
let gridX = 315;
let uGrid = 0;
const GRID_LENGTH = 1;

// electron constants
const ELECTRON_RADIUS = 2; //px
const ELECTRON_COLOR = "#4e27b2"; //"#640ac8";
const ELECTRON_MASS = 9e-31;
const ELECTRON_CHARGE = 1.6e-19;
const MAX_ELECTRONS = 200;
let electrons = [];

// glow constants
const GLOW_COLOR = "#ed6517";
const GLOW_RADIUS = 30;
const GLOW_FADE = 10;

// glow area constants
const GLOW_OFFSET = 0.4;
const GLOW_DISTANCE = 4.9;
const GLOW_ERROR = 5;
const MIN_GLOWS = 2;
const MAX_GLOWS = 10;

/////////////////////////////////////////////////////////////////////////

// handle inputs ////////////////////////////////////////////////////////
let newEProb = 0;
let glowProb = 0;

filamentInput.addEventListener("input", e => {
	newEProb = filamentInput.value / 20;
	glowProb = filamentInput.value * 0.5e-2;
});

const f = U =>
	Math.sin(map(U % 4.7, 0, 4.7, 0, (5 / 6) * Math.PI)) * Math.exp(U / 20);
// TODO: add f(U) to be realistic

gridInput.addEventListener("input", e => {
	uGrid = e.target.value;
	drawOnGraph();
});
/////////////////////////////////////////////////////////////////////////

// simulation loop //////////////////////////////////////////////////////
const SIMULATION_TIMEOUT_MS = 10;
const SIMULATION_TIMEOUT = SIMULATION_TIMEOUT_MS / 1000;
/////////////////////////////////////////////////////////////////////////
