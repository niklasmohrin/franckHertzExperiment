// simulation.js

const simulation = () => {
	// adds an electron sometimes
	if (electrons.length < MAX_ELECTRONS && Math.random() < newEProb) {
		electrons.push(new ParticleElectron());
	}

	// TODO: simplyfiy
	const curForce = (ELECTRON_CHARGE * uGrid) / GRID_LENGTH / 1e13;

	// update all electrons
	for (let i = electrons.length - 1; i > -1; i--) {
		const e = electrons[i];

		// accelerate if not behind grid
		if (e.x < gridX) {
			e.applyForce(curForce, 0);
		}
		// always update
		e.update();

		// bounds checking, remove if out of bounds
		if (
			e.x > eRightBound ||
			e.x < eLeftBound ||
			e.y > eBottomBound ||
			e.y < eTopBound
		) {
			electrons.splice(i, 1);
		}
	}

	// calculate glow areas and add glow points
	// starting at first area
	let curArea = GLOW_OFFSET[curMaterial] + GLOW_DISTANCE[curMaterial];
	// glow energy cannot surpass grid voltage
	while (curArea < uGrid) {
		// random number of effects, between MIN_GLOWS and MAX_GLOWS
		for (let i = 0; i < rand(MIN_GLOWS, MAX_GLOWS); i++) {
			if (Math.random() < glowProb) {
				// calculate glow position
				const x = map(curArea + ranGlowError(), 0, uGrid, eSpawnStartX, gridX);
				const y = rand(eSpawnStartY, eSpawnStartY + eSpawnHeight);
				// schedule glow effect
				tubeP5.glow(x, y);
			}
		}
		// move on to the next area
		curArea += GLOW_DISTANCE[curMaterial];
	}
};

// scheduling the simulation interval
let simulationInterval = setInterval(simulation, SIMULATION_TIMEOUT_MS);
