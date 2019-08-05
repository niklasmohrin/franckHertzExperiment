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

// simulation.js

const simulation = () => {
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
