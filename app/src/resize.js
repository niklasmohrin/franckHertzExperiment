"use strict";
exports.__esModule = true;
var base_1 = require("./base");
var tubeSketch_1 = require("./tubeSketch");
var graphSketch_1 = require("./graphSketch");
var simulation_1 = require("./simulation");
// resize.js
// only exectutes 250ms after last event
window.addEventListener("resize", {
    handleEvent: base_1.debounce(function (e) {
        resizing = true;
        tubeSketch_1.TubeSketch.reset(tubeSketch_1.tubeP5);
        graphSketch_1.GraphSketch.reset(graphSketch_1.graphP5);
        base_1.handleFilamentInput();
        base_1.handleGridInput();
        base_1.repositionSpans();
        resizing = false;
    }, 150)
});
window.onload = function () {
    // initial events
    // scheduling the simulation interval
    var simulationInterval = setInterval(simulation_1.simulation, base_1.SIMULATION_TIMEOUT_MS);
    base_1.handleFilamentInput();
    base_1.handleGridInput();
    base_1.repositionSpans();
    base_1.SPAN_UCOUNTER.innerText = base_1.COUNTER_VOLTAGE.toFixed(2) + " V";
};
