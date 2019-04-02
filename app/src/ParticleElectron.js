"use strict";
exports.__esModule = true;
var base_1 = require("./base");
var tubeSketch_1 = require("./tubeSketch");
// ParticleElectron.js
var ParticleElectron = /** @class */ (function () {
    function ParticleElectron(x, y) {
        if (x === void 0) { x = Math.floor(Math.random() * base_1.eSpawnWidth) + base_1.eSpawnStartX; }
        if (y === void 0) { y = Math.floor(Math.random() * base_1.eSpawnHeight) + base_1.eSpawnStartY; }
        this.x = x;
        this.y = y;
        this.vx = this.vy = this.ax = this.ay = 0;
        this.timesHit = 0;
    }
    return ParticleElectron;
}());
exports.ParticleElectron = ParticleElectron;
ParticleElectron.prototype.update = function () {
    this.vx += this.ax;
    this.vy += this.ay;
    this.ax = this.ay = 0;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x <= base_1.gridX) {
        // current energy based on position in the tube
        var energy = base_1.map(this.x, base_1.eSpawnStartX, base_1.gridX, 0, base_1.uGrid) -
            base_1.GLOW_DISTANCE[base_1.curMaterial] * this.timesHit;
        if (base_1.abs(((energy - 0.3) % base_1.GLOW_DISTANCE[base_1.curMaterial]) -
            base_1.GLOW_DISTANCE[base_1.curMaterial]) < 0.25) {
            tubeSketch_1.scheduleGlow(this.x, this.y);
            this.vx -= base_1.GLOW_DISTANCE[base_1.curMaterial] * base_1.ELECTRON_HIT_SPEED_DECLINE;
            if (this.vx < base_1.ELECTRON_MAX_BACKWARDS_SPEED) {
                this.vx = base_1.ELECTRON_MAX_BACKWARDS_SPEED;
            }
            this.timesHit++;
        }
    }
    else {
        // if behind grid and negative velocity, go out of bounds and delete in simulation.js
        if (this.vx <= 0) {
            this.x = base_1.eRightBound + 1000;
        }
    }
};
ParticleElectron.prototype.accelerate = function (_ax, _ay) {
    this.ax += _ax;
    this.ay += _ay;
};
