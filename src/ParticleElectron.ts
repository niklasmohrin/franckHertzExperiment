import {
	eSpawnWidth,
	eSpawnStartX,
	eSpawnHeight,
	eSpawnStartY,
	gridX,
	map,
	uGrid,
	GLOW_DISTANCE,
	curMaterial,
	abs,
	ELECTRON_HIT_SPEED_DECLINE,
	ELECTRON_MAX_BACKWARDS_SPEED,
	eRightBound
} from "./base";

import { scheduleGlow } from "./tubeSketch";

// ParticleElectron.js

class ParticleElectron {
	public vx: number;
	public vy: number;
	public ax: number;
	public ay: number;
	public timesHit: number;
	public update: () => void;
	public accelerate: (_ax: number, _ay: number) => void;
	constructor(
		public x: number = Math.floor(Math.random() * eSpawnWidth) + eSpawnStartX,
		public y: number = Math.floor(Math.random() * eSpawnHeight) + eSpawnStartY
	) {
		this.vx = this.vy = this.ax = this.ay = 0;
		this.timesHit = 0;
	}
}

ParticleElectron.prototype.update = function() {
	this.vx += this.ax;
	this.vy += this.ay;
	this.ax = this.ay = 0;
	this.x += this.vx;
	this.y += this.vy;

	if (this.x <= gridX) {
		// current energy based on position in the tube
		const energy =
			map(this.x, eSpawnStartX, gridX, 0, uGrid) -
			GLOW_DISTANCE[curMaterial] * this.timesHit;
		if (
			abs(
				((energy - 0.3) % GLOW_DISTANCE[curMaterial]) -
					GLOW_DISTANCE[curMaterial]
			) < 0.25
		) {
			scheduleGlow(this.x, this.y);
			this.vx -= GLOW_DISTANCE[curMaterial] * ELECTRON_HIT_SPEED_DECLINE;
			if (this.vx < ELECTRON_MAX_BACKWARDS_SPEED) {
				this.vx = ELECTRON_MAX_BACKWARDS_SPEED;
			}
			this.timesHit++;
		}
	} else {
		// if behind grid and negative velocity, go out of bounds and delete in simulation.js
		if (this.vx <= 0) {
			this.x = eRightBound + 1000;
		}
	}
};

ParticleElectron.prototype.accelerate = function(_ax, _ay) {
	this.ax += _ax;
	this.ay += _ay;
};
