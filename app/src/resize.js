/* --------------------------------------------------------------------------
 * Franck Hertz Experiment
 * Visualisation of the Franck Hertz Experiment in an Electron app.
 *
 * Copyright (C) 2019 Niklas Mohrin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *-------------------------------------------------------------------------*/

// resize.js

// only exectutes 250ms after last event
window.addEventListener(
	"resize",
	debounce(() => {
		resizing = true;
		tubeP5.reset();
		graphP5.reset();
		handleFilamentInput();
		handleGridInput();
		repositionSpans();
		resizing = false;
	}, 150)
);
window.onload = () => {
	// initial events
	// scheduling the simulation interval
	let simulationInterval = setInterval(simulation, SIMULATION_TIMEOUT_MS);
	handleFilamentInput();
	handleGridInput();
	repositionSpans();
	SPAN_UCOUNTER.innerText = COUNTER_VOLTAGE.toFixed(2) + " V";
};
