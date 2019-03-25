// simulation.js
let glowAreas = [];

const simulation = () => {
	// adds an electron sometimes
	if (electrons.length < curMaxElectrons && Math.random() < newEProb) {
		electrons.push(new ParticleElectron());
	}

	// simplified, just for demonstration
	const curAcc = map(uGrid, 0, GRID_MAX, ELECTRON_ACC_MIN, ELECTRON_ACC_MAX);

	// update all electrons
	for (let i = electrons.length - 1; i > -1; i--) {
		const e = electrons[i];

		// accelerate if not behind grid
		if (e.x < gridX) {
			e.accelerate(curAcc * ranSpeedError(), 0);
		}
		// always update
		e.update();

		// bounds checking, remove if out of bounds
		if (
			e.x > eRightBound ||
			e.x < eLeftBound ||
			e.y > eBottomBound ||
			e.y < eTopBound ||
			(e.x <= gridX && e.isInArea(glowAreas))
		) {
			electrons.splice(i, 1);
		}
	}

	// calculate glow areas and add glow points
	// starting at first area
	let curArea = GLOW_OFFSET[curMaterial] + GLOW_DISTANCE[curMaterial];
	glowAreas = [];
	// glow energy cannot surpass grid voltage
	while (curArea < uGrid) {
		glowAreas.push(curArea);
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
