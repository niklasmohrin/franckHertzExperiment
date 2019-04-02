import {
	debounce,
	handleFilamentInput,
	handleGridInput,
	repositionSpans,
	SIMULATION_TIMEOUT_MS,
	COUNTER_VOLTAGE,
	SPAN_UCOUNTER
} from "./base";

declare let resizing: boolean;

import { TubeSketch, tubeP5 } from "./tubeSketch";
import { GraphSketch, graphP5 } from "./graphSketch";
import { simulation } from "./simulation";

// resize.js

// only exectutes 250ms after last event
window.addEventListener("resize", {
	handleEvent: debounce(e => {
		resizing = true;
		TubeSketch.reset(tubeP5);
		GraphSketch.reset(graphP5);
		handleFilamentInput();
		handleGridInput();
		repositionSpans();
		resizing = false;
	}, 150)
});
window.onload = () => {
	// initial events
	// scheduling the simulation interval
	let simulationInterval = setInterval(simulation, SIMULATION_TIMEOUT_MS);
	handleFilamentInput();
	handleGridInput();
	repositionSpans();
	SPAN_UCOUNTER.innerText = COUNTER_VOLTAGE.toFixed(2) + " V";
};
