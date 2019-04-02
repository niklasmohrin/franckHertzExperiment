"use strict";
exports.__esModule = true;
var ParticleElectron_1 = require("./ParticleElectron");
var base_1 = require("./base");
exports.simulation = function () {
    // adds an electron sometimes
    if (electrons.length < curMaxElectrons && Math.random() < newEProb) {
        electrons.push(new ParticleElectron_1.ParticleElectron());
    }
    // simplified, just for demonstration
    var curAcc = base_1.map(uGrid, 0, base_1.GRID_MAX.mercury, base_1.ELECTRON_ACC_MIN, base_1.ELECTRON_ACC_MAX);
    // update all electrons
    for (var i = electrons.length - 1; i > -1; i--) {
        var e = electrons[i];
        // accelerate if not behind grid
        if (e.x < base_1.gridX) {
            e.accelerate(curAcc * base_1.ranSpeedError(), 0);
        }
        else {
            e.accelerate(base_1.COUNTER_FORCE * base_1.ranSpeedError(), 0);
        }
        // always update
        e.update();
        // bounds checking, remove if out of bounds
        if (e.x > base_1.eRightBound ||
            e.x < base_1.eLeftBound ||
            e.y > base_1.eBottomBound ||
            e.y < base_1.eTopBound) {
            electrons.splice(i, 1);
        }
    }
};
