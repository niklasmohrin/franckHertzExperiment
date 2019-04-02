"use strict";
exports.__esModule = true;
var p5 = require("p5");
var base_1 = require("./base");
// tubeSketch.js
// p5.js sketch file for the tube
// destruct color into rgb values for later use
var _a = base_1.hexToRgb(base_1.CATHODE_GLOW_COLOR), cr = _a.r, cg = _a.g, cb = _a.b;
var TubeSketch = /** @class */ (function () {
    function TubeSketch() {
    }
    // Drawing methods ////////////////////////////////////////////////////////////////////////////
    TubeSketch.drawElectrons = function (p) {
        p.stroke(base_1.ELECTRON_COLOR);
        p.strokeWeight(base_1.ELECTRON_RADIUS);
        p.fill(base_1.ELECTRON_COLOR);
        for (var _i = 0, electrons_1 = electrons; _i < electrons_1.length; _i++) {
            var e = electrons_1[_i];
            if (e.x < base_1.eRightBound &&
                e.x > base_1.eLeftBound &&
                e.y < base_1.eBottomBound &&
                e.y > base_1.eTopBound) {
                p.point(e.x, e.y);
            }
        }
    };
    TubeSketch.drawGlows = function (p) {
        p.noStroke();
        var c = p.color(base_1.GLOW_COLOR[base_1.curMaterial]);
        for (var i = TubeSketch.glows.length - 1; i > -1; i--) {
            TubeSketch.glows[i].a -= base_1.GLOW_FADE;
            var glow = TubeSketch.glows[i];
            if (glow.a > 0) {
                c.setAlpha(glow.a);
                p.fill(c);
                p.ellipse(glow.x, glow.y, base_1.GLOW_RADIUS, base_1.GLOW_RADIUS);
            }
            else
                TubeSketch.glows.splice(i, 1);
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Cathode Drawing ////////////////////////////////////////////////////////////////////////////
    TubeSketch.cathodeCnvReset = function (p) {
        // recalculate dimensions of the cathode canvas
        TubeSketch.cathodeCnvRect = {
            min: {
                x: Math.floor(base_1.eSpawnStartX - base_1.CATHODE_GLOW_PADDING * base_1.eSpawnWidth),
                y: Math.floor(base_1.eSpawnStartY - base_1.CATHODE_GLOW_PADDING * base_1.eSpawnHeight)
            },
            max: {
                x: Math.floor(base_1.eSpawnEndX + base_1.CATHODE_GLOW_PADDING * base_1.eSpawnWidth),
                y: Math.floor(base_1.eSpawnEndY + base_1.CATHODE_GLOW_PADDING * base_1.eSpawnHeight)
            }
        };
        // recreate cathode canvas
        delete TubeSketch.cathodeCnv;
        document.body.removeChild(document.body.lastChild);
        var w = TubeSketch.cathodeCnvRect.max.x - TubeSketch.cathodeCnvRect.min.x;
        var h = TubeSketch.cathodeCnvRect.max.y - TubeSketch.cathodeCnvRect.min.y;
        TubeSketch.cathodeCnv = p.createGraphics(w, h);
        // setup for drawing
        TubeSketch.cathodeCnv.loadPixels();
        TubeSketch.cathodeCnv.pixelDensity(1);
        // draw the canvas
        TubeSketch.redrawCathodeGlow(p);
    };
    TubeSketch.redrawCathodeGlow = function (p) {
        var cnv = TubeSketch.cathodeCnv;
        var cathodeCenter = {
            min: {
                x: cnv.width / 2 - base_1.eSpawnWidth * base_1.CATHODE_CENTER_WIDTH,
                y: cnv.height / 2 - base_1.eSpawnHeight * base_1.CATHODE_CENTER_HEIGHT
            },
            max: {
                x: cnv.width / 2 + base_1.eSpawnWidth * base_1.CATHODE_CENTER_WIDTH,
                y: cnv.height / 2 + base_1.eSpawnHeight * base_1.CATHODE_CENTER_HEIGHT
            }
        };
        cnv.clear();
        // iterate over all pixels
        for (var x = 0; x < cnv.width; x++) {
            for (var y = 0; y < cnv.height; y++) {
                // location in the pixel array
                var loc = 4 * (x + y * cnv.width);
                // distance to the cathode center rect
                var d = base_1.distanceToRect({ x: x, y: y }, cathodeCenter);
                // alpha mapping
                var alpha = base_1.map(d, 0, cathodeGlowRadius, base_1.map(base_1.uFilament, 0, base_1.FILAMENT_MAX, 0, 310), 0);
                // don't bother setting any colors when alpha is 0 (or lower)
                if (alpha > 0) {
                    cnv.pixels[loc] = cr;
                    cnv.pixels[loc + 1] = cg;
                    cnv.pixels[loc + 2] = cb;
                    cnv.pixels[loc + 3] = base_1.constrain(alpha, 0, 255);
                }
                else {
                    cnv.pixels[loc + 3] = 0;
                }
            }
        }
        cnv.updatePixels();
        TubeSketch.cathodeDrawn = true;
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // tubeP5 reset, setup and draw; glow scheduler ///////////////////////////////////////////////
    TubeSketch.reset = function (p) {
        p.noLoop();
        // delete old and create new canvas
        delete TubeSketch.tubeCnv;
        TubeSketch.tubeCnv = p.createCanvas(TubeSketch.parent.clientWidth, TubeSketch.parent.clientHeight);
        TubeSketch.tubeCnv.parent(TubeSketch.parent);
        TubeSketch.tubeCnv.id("tube-canvas");
        // recalculate spawning area, boundaries and grid position
        base_1.recalculateBoundaries(TubeSketch.parent.clientWidth, TubeSketch.parent.clientHeight);
        // recalculate electron positions
        electrons.forEach(function (e) {
            e.x *= TubeSketch.parent.clientWidth / TubeSketch.prevWidth;
            e.y *= TubeSketch.parent.clientHeight / TubeSketch.prevHeight;
        });
        // keep track of old size for next resize event
        TubeSketch.prevWidth = TubeSketch.parent.clientWidth;
        TubeSketch.prevHeight = TubeSketch.parent.clientHeight;
        // reset cathode glow canvas
        TubeSketch.cathodeCnvReset(p);
        // vanish canvas
        p.background(0);
        // start the loop
        p.frameRate(50);
        p.loop();
    };
    TubeSketch.setup = function (p) {
        p.noLoop();
        // TubeSketch.parent = window.document.getElementById("tube-canvas-container");
        TubeSketch.glows = [];
        // initial reset
        TubeSketch.reset(p);
    };
    TubeSketch.draw = function (p) {
        p.clear();
        TubeSketch.drawElectrons(p);
        if (!TubeSketch.cathodeDrawn || p.frameCount % 10 === 0) {
            TubeSketch.redrawCathodeGlow(p);
        }
        // draw cathode glow
        p.image(TubeSketch.cathodeCnv, TubeSketch.cathodeCnvRect.min.x, TubeSketch.cathodeCnvRect.min.y);
        TubeSketch.drawGlows(p);
    };
    TubeSketch.glow = function (p, x, y) {
        // schedule glow
        TubeSketch.glows.push({
            x: x,
            y: y,
            a: 255
        });
    };
    return TubeSketch;
}());
exports.TubeSketch = TubeSketch;
exports.tubeP5 = new p5(function (p) {
    p.preload = function () { };
    p.setup = function () { return TubeSketch.reset(p); };
    p.draw = function () { return TubeSketch.draw(p); };
}, document.getElementById("#tube-canvas-container"));
exports.scheduleCathodeRedraw = base_1.debounce(function () { return (TubeSketch.cathodeDrawn = false); }, 5);
function scheduleGlow(x, y) {
    TubeSketch.glow(exports.tubeP5, x, y);
}
exports.scheduleGlow = scheduleGlow;
