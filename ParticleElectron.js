const ELECTRON_RADIUS = 2; //px
const ELECTRON_COLOR = "#4e27b2"; //"#640ac8";
const ELECTRON_MASS = 9e-31;
const ELECTRON_CHARGE = 1.6e-19;

const VEL_DIV = 1e13;

let newEProb = 0;

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

ParticleElectron.prototype.getAbs = function() {
	Math.sqrt(this.vx * this.vx + this.vy * this.vy);
};

ParticleElectron.prototype.update = function() {
	this.vx += this.ax;
	this.vy += this.ay;

	this.ax = this.ay = 0;

	this.x += this.vx / VEL_DIV;
	this.y += this.vy / VEL_DIV;
};

ParticleElectron.prototype.accelerate = function(_ax, _ay) {
	this.ax += _ax;
	this.ay += _ay;
};

ParticleElectron.prototype.applyForce = function(_fx, _fy) {
	// this.accelerate(_fx / ELECTRON_MASS, _fy / ELECTRON_MASS);
	this.ax += _fx / ELECTRON_MASS;
	this.ay += _fy / ELECTRON_MASS;
};

ParticleElectron.prototype.getE = function() {
	return 0.5 * ELECTRON_MASS * (this.vx * this.vx + this.vy * this.vy);
};
