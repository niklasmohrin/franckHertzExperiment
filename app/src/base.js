"use strict";
// base.js
exports.__esModule = true;
var tubeSketch_1 = require("./tubeSketch");
// util functions ///////////////////////////////////////////////////////
function map(val, xmin, xmax, ymin, ymax) {
    return ((val - xmin) / (xmax - xmin)) * (ymax - ymin) + ymin;
}
exports.map = map;
function rand(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
}
exports.rand = rand;
function distanceToRectSquared(p, rect) {
    var dx = p.x > rect.min.x && p.x < rect.max.x
        ? 0
        : Math.max(rect.min.x - p.x, p.x - rect.max.x);
    var dy = p.y > rect.min.y && p.y < rect.max.y
        ? 0
        : Math.max(rect.min.y - p.y, p.y - rect.max.y);
    return dx * dx + dy * dy;
}
exports.distanceToRectSquared = distanceToRectSquared;
function distanceToRect(p, rect) {
    return Math.sqrt(distanceToRectSquared(p, rect));
}
exports.distanceToRect = distanceToRect;
function constrain(x, a, b) {
    return x > b ? b : x < a ? a : x;
}
exports.constrain = constrain;
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
}
exports.debounce = debounce;
exports.avg = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length > 0) {
        return args.reduce(function (prev, cur) { return (prev += cur); }) / args.length;
    }
    else {
        throw new Error("no args given to avg()");
    }
};
exports.hexToRgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        : null;
};
exports.abs = function (x) { return (x < 0 ? -x : x); };
/////////////////////////////////////////////////////////////////////////
// physics constants ////////////////////////////////////////////////////
// electron spawning area / filament
// postinions of several boundaries at dimensions tubeWidth * tubeHeight
exports.ORIG_DATA = {
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
exports.eSpawnStartX = exports.ORIG_DATA.eSpawnStartX, exports.eSpawnStartY = exports.ORIG_DATA.eSpawnStartY, exports.eSpawnEndX = exports.ORIG_DATA.eSpawnEndX, exports.eSpawnEndY = exports.ORIG_DATA.eSpawnEndY, exports.eSpawnWidth = exports.ORIG_DATA.eSpawnWidth, exports.eSpawnHeight = exports.ORIG_DATA.eSpawnHeight, exports.gridX = exports.ORIG_DATA.gridX, exports.eLeftBound = exports.ORIG_DATA.eLeftBound, exports.eRightBound = exports.ORIG_DATA.eRightBound, exports.eTopBound = exports.ORIG_DATA.eTopBound, exports.eBottomBound = exports.ORIG_DATA.eBottomBound, exports.textPositions = exports.ORIG_DATA.textPositions, exports.textFontSize = exports.ORIG_DATA.textFontSize;
// electron
exports.ELECTRON_MASS = 9e-31;
exports.ELECTRON_CHARGE = 1.6e-19;
exports.ELECTRON_ACC_MIN = 0;
exports.ELECTRON_ACC_MAX = 0.03;
exports.ELECTRON_HIT_SPEED_DECLINE = 1 / 3;
exports.ELECTRON_SPEED_ERROR = 3;
exports.ranSpeedError = function () {
    return 1 + Math.random() * 2 * exports.ELECTRON_SPEED_ERROR - exports.ELECTRON_SPEED_ERROR;
};
exports.ELECTRON_MAX_BACKWARDS_SPEED = -0.5;
// grid
exports.GRID_MAX = { mercury: 25, neon: 10 };
exports.uGrid = 0;
// filament
exports.FILAMENT_MAX = 10;
exports.uFilament = 0;
exports.COUNTER_VOLTAGE = 1.5;
exports.COUNTER_FORCE = -0.01;
exports.AMPERAGE_MAX = { mercury: 500, neon: 200 };
exports.curAmperage = 0;
// mapping of grid voltage to amperage
// the data is read from images and saved as a js obj in pointData.js
exports.f = function (U) {
    // find the closest voltage in the sorted data set with binary search
    var start = 0;
    var stop = POINT_DATA[exports.curMaterial].length - 1;
    var middle = Math.floor((start + stop) / 2);
    while (POINT_DATA[exports.curMaterial][middle][0] !== U && start < stop) {
        middle = Math.floor((start + stop) / 2);
        if (U < POINT_DATA[exports.curMaterial][middle][0]) {
            stop = middle - 1;
        }
        else {
            start = middle + 1;
        }
    }
    // and return the corresponding amperage
    return (POINT_DATA[exports.curMaterial][start][1] * map(exports.uFilament, 0, exports.FILAMENT_MAX, 0, 1));
};
/////////////////////////////////////////////////////////////////////////
// design constants /////////////////////////////////////////////////////
// electrons
exports.ELECTRON_RADIUS = 2; //px
exports.MAX_ELECTRONS = 1000;
exports.MIN_ELECTRONS = 100; // when filament voltage is applied
var curMaxElectrons = 0;
var electrons = [];
// colors
exports.ELECTRON_COLOR = "#4081e8";
exports.CATHODE_GLOW_COLOR = "#e05c23";
exports.GLOW_COLOR = { mercury: "#9f40e8", neon: "#ed6517" };
// cathode glow
exports.CATHODE_GLOW_MIN_RADIUS = 10;
exports.CATHODE_GLOW_MAX_RADIUS = 50;
var cathodeGlowRadius = 0;
exports.CATHODE_GLOW_PADDING = 0.5;
exports.CATHODE_CENTER_WIDTH = 0.05;
exports.CATHODE_CENTER_HEIGHT = 0.12;
// material glow constants
exports.GLOW_OFFSET = { mercury: 0.2, neon: 0 };
exports.GLOW_DISTANCE = { mercury: 4.9, neon: 2 };
exports.GLOW_ERROR = 0.3;
exports.ranGlowError = function () { return Math.random() * 2 * exports.GLOW_ERROR - exports.GLOW_ERROR; };
exports.GLOW_RADIUS = 10;
exports.GLOW_FADE = 10;
var glowAreas = [];
exports.recalculateGlowAreas = function () {
    // calculate glow areas
    // starting at first area
    var curArea = exports.GLOW_OFFSET[exports.curMaterial] + exports.GLOW_DISTANCE[exports.curMaterial];
    glowAreas = [];
    // glow energy cannot surpass grid voltage
    while (curArea < exports.uGrid) {
        glowAreas.push(curArea);
        curArea += exports.GLOW_DISTANCE[exports.curMaterial];
    }
};
// Graph constants
exports.GRAPH_STROKE = "blue";
exports.GRAPH_SW = 2;
exports.GRAPH_AXIS_STROKE = "white";
exports.GRAPH_AXIS_SW = 2.5;
exports.GRAPH_PADDING_HEIGHT = 0.15;
exports.GRAPH_PADDING_WIDTH = 0.1;
exports.GRAPH_X_AXIS_STEP = { mercury: 2.5, neon: 1.25 };
exports.GRAPH_Y_AXIS_STEP = { mercury: 50, neon: 25 };
exports.GRAPH_X_AXIS_LABEL_STEP = { mercury: 5, neon: 2.5 };
exports.GRAPH_Y_AXIS_LABEL_STEP = { mercury: 100, neon: 50 };
exports.GRAPH_AXIS_LINE_HEIGHT = 2;
exports.GRAPH_AXIS_LINE_SW = 1.5;
exports.GRAPH_AXIS_FONT_SIZE = 10;
exports.GRAPH_ARROWTIP_LENGTH = 10;
exports.GRAPH_CUR_POINT_COLOR = "#9a4aef";
exports.GRAPH_CUR_POINT_SW = 4;
exports.GRAPH_FRAMERATE = 30;
exports.GRAPH_X_ACCURACY = { mercury: 300, neon: 500 };
exports.GRAPH_POINTS_ARR_LEN = exports.GRID_MAX.mercury * exports.GRAPH_X_ACCURACY.mercury;
exports.measuredPoints = new Array(exports.GRAPH_POINTS_ARR_LEN);
exports.addPoint = function (x, y) {
    exports.measuredPoints[Math.floor(x * exports.GRAPH_X_ACCURACY[exports.curMaterial])] = y;
};
exports.clearGraph = function () {
    for (var i = 0; i < exports.GRAPH_POINTS_ARR_LEN; i++) {
        delete exports.measuredPoints[i];
    }
};
/////////////////////////////////////////////////////////////////////////
// Set ranges for inputs ////////////////////////////////////////////////
var materialInputs = document.getElementsByName("material");
var filamentInput = document.getElementById("filament");
var gridInput = document.getElementById("grid");
var SPAN_UFILAMENT = document.getElementById("uFilament-text-span");
var SPAN_UGRID = document.getElementById("uGrid-text-span");
var SPAN_AMPERAGE = document.getElementById("amperage-text-span");
exports.SPAN_UCOUNTER = document.getElementById("uCounter-text-span");
filamentInput.setAttribute("max", exports.FILAMENT_MAX.toString());
exports.newEProb = 0;
exports.uFilamentChanged = false;
var resizing = false;
// sliders
exports.handleFilamentInput = function () {
    exports.uFilament = Number(filamentInput.nodeValue);
    exports.newEProb = exports.uFilament / 40;
    // adjust cathode glow radius based on uFilament
    cathodeGlowRadius = map(exports.uFilament, 0, exports.FILAMENT_MAX, exports.CATHODE_GLOW_MIN_RADIUS, exports.CATHODE_GLOW_MAX_RADIUS);
    // adjust to window size
    cathodeGlowRadius *= exports.avg(window.innerWidth, window.innerHeight) / 678.5;
    tubeSketch_1.scheduleCathodeRedraw();
    SPAN_UFILAMENT.innerText = exports.uFilament.toFixed(2) + " V";
    exports.uFilamentChanged = !resizing;
};
exports.handleGridInput = function () {
    exports.uGrid = Number(gridInput.nodeValue);
    exports.curAmperage = exports.f(exports.uGrid);
    exports.addPoint(exports.uGrid, exports.curAmperage);
    curMaxElectrons =
        exports.uGrid * exports.uFilament === 0
            ? 0
            : map(exports.uGrid * exports.uFilament, 0, exports.GRID_MAX.mercury * exports.AMPERAGE_MAX.mercury, exports.MIN_ELECTRONS, exports.MAX_ELECTRONS);
    SPAN_UGRID.innerText = exports.uGrid.toFixed(2) + " V";
    SPAN_AMPERAGE.innerText = exports.curAmperage.toFixed(2) + " nA";
    if (exports.uFilamentChanged) {
        exports.clearGraph();
        exports.uFilamentChanged = false;
    }
    exports.recalculateGlowAreas();
};
filamentInput.addEventListener("input", exports.handleFilamentInput);
gridInput.addEventListener("input", exports.handleGridInput);
// radio group
materialInputs.forEach(function (node) {
    node.addEventListener("input", function () {
        exports.curMaterial = node.nodeValue;
        exports.recalculateGlowAreas();
        exports.clearGraph();
        gridInput.setAttribute("max", exports.GRID_MAX[exports.curMaterial].toString());
        gridInput.nodeValue = constrain(Number(gridInput.nodeValue), 0, exports.GRID_MAX[exports.curMaterial]).toString();
        exports.handleGridInput();
    });
});
// initial trigger
materialInputs[0].dispatchEvent(new Event("input"));
/////////////////////////////////////////////////////////////////////////
// Positioning calculations /////////////////////////////////////////////
// map tube and cathode areas to new dimensions
exports.recalculateBoundaries = function (w, h) {
    var wFactor = w / exports.ORIG_DATA.tubeWidth;
    var hFactor = h / exports.ORIG_DATA.tubeHeight;
    // recalculate spawning area
    exports.eSpawnStartX = exports.ORIG_DATA.eSpawnStartX * wFactor;
    exports.eSpawnStartY = exports.ORIG_DATA.eSpawnStartY * hFactor;
    exports.eSpawnEndX = exports.ORIG_DATA.eSpawnEndX * wFactor;
    exports.eSpawnEndY = exports.ORIG_DATA.eSpawnEndY * hFactor;
    exports.eSpawnWidth = exports.ORIG_DATA.eSpawnWidth * wFactor;
    exports.eSpawnHeight = exports.ORIG_DATA.eSpawnHeight * hFactor;
    // recalculate boundaries
    exports.eLeftBound = exports.ORIG_DATA.eLeftBound * wFactor;
    exports.eRightBound = exports.ORIG_DATA.eRightBound * wFactor;
    exports.eTopBound = exports.ORIG_DATA.eTopBound * hFactor;
    exports.eBottomBound = exports.ORIG_DATA.eBottomBound * hFactor;
    // recalculate grid position
    exports.gridX = exports.ORIG_DATA.gridX * wFactor;
    // text rects
    exports.textPositions = {
        width: exports.ORIG_DATA.textPositions.width * wFactor,
        height: exports.ORIG_DATA.textPositions.height * hFactor,
        yMin: exports.ORIG_DATA.textPositions.yMin * hFactor,
        yMax: exports.ORIG_DATA.textPositions.yMax * hFactor,
        uFilamentX: exports.ORIG_DATA.textPositions.uFilamentX * wFactor,
        uGridX: exports.ORIG_DATA.textPositions.uGridX * wFactor,
        amperageX: exports.ORIG_DATA.textPositions.amperageX * wFactor,
        uCounterX: exports.ORIG_DATA.textPositions.uCounterX * wFactor
    };
    exports.textFontSize = exports.ORIG_DATA.textFontSize * exports.avg(wFactor, hFactor);
};
exports.repositionSpans = function () {
    SPAN_UFILAMENT.style.left =
        (exports.textPositions.uFilamentX - exports.textPositions.width / 2).toString() + "px";
    SPAN_UGRID.style.left =
        (exports.textPositions.uGridX - exports.textPositions.width / 2).toString() + "px";
    SPAN_AMPERAGE.style.left =
        (exports.textPositions.amperageX - exports.textPositions.width / 2).toString() + "px";
    exports.SPAN_UCOUNTER.style.left =
        (exports.textPositions.uCounterX - exports.textPositions.width / 2).toString() + "px";
    SPAN_UFILAMENT.style.top = SPAN_UGRID.style.top = SPAN_AMPERAGE.style.top = exports.SPAN_UCOUNTER.style.top =
        exports.textPositions.yMin.toString() + "px";
    SPAN_UFILAMENT.style.width = SPAN_UGRID.style.width = SPAN_AMPERAGE.style.width = exports.SPAN_UCOUNTER.style.width =
        exports.textPositions.width.toString() + "px";
    SPAN_UFILAMENT.style.height = SPAN_UGRID.style.height = SPAN_AMPERAGE.style.height = exports.SPAN_UCOUNTER.style.height =
        exports.textPositions.height.toString() + "px";
    SPAN_UFILAMENT.style.fontSize = SPAN_UGRID.style.fontSize = SPAN_AMPERAGE.style.fontSize = exports.SPAN_UCOUNTER.style.fontSize =
        exports.textFontSize.toString() + "px";
};
/////////////////////////////////////////////////////////////////////////
// simulation loop //////////////////////////////////////////////////////
exports.SIMULATION_TIMEOUT_MS = 10;
exports.SIMULATION_TIMEOUT = exports.SIMULATION_TIMEOUT_MS / 1000;
/////////////////////////////////////////////////////////////////////////
