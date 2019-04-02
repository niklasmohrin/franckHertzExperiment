import { ParticleElectron } from "./ParticleElectron";
import {
	map,
	GRID_MAX,
	ELECTRON_ACC_MIN,
	ELECTRON_ACC_MAX,
	gridX,
	ranSpeedError,
	COUNTER_FORCE,
	eRightBound,
	eLeftBound,
	eBottomBound,
	eTopBound
} from "./base";

// simulation.js

declare let electrons: ParticleElectron[];
declare let curMaxElectrons: number;
declare let newEProb: number;
declare let uGrid: number;

export const simulation = () => {
	// adds an electron sometimes
	if (electrons.length < curMaxElectrons && Math.random() < newEProb) {
		electrons.push(new ParticleElectron());
	}
	// simplified, just for demonstration
	const curAcc = map(
		uGrid,
		0,
		GRID_MAX.mercury,
		ELECTRON_ACC_MIN,
		ELECTRON_ACC_MAX
	);
	// update all electrons
	for (let i = electrons.length - 1; i > -1; i--) {
		const e = electrons[i];

		// accelerate if not behind grid
		if (e.x < gridX) {
			e.accelerate(curAcc * ranSpeedError(), 0);
		} else {
			e.accelerate(COUNTER_FORCE * ranSpeedError(), 0);
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
};
