// ParticleElectron.js

class ParticleElectron {
	constructor(_x, _y, _vx, _vy, _ax, _ay) {
		this.x = _x || Math.floor(Math.random() * eSpawnWidth) + eSpawnStartX;
		this.y = _y || Math.floor(Math.random() * eSpawnHeight) + eSpawnStartY;

		this.vx = _vx || 0;
		this.vy = _vy || 0;

		this.ax = _ax || 0;
		this.ay = _ay || 0;
	}
}

ParticleElectron.prototype.update = function() {
	this.vx += this.ax;
	this.vy += this.ay;

	this.ax = this.ay = 0;

	this.x += this.vx;
	this.y += this.vy;
};

ParticleElectron.prototype.accelerate = function(_ax, _ay) {
	this.ax += _ax;
	this.ay += _ay;
};
