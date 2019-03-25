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
};
