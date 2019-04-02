"use strict";
exports.__esModule = true;
var base_1 = require("./base");
var p5 = require("p5");
// graphSketch.js
// p5.js sketch file for the graph
var GraphSketch = /** @class */ (function () {
    function GraphSketch() {
    }
    GraphSketch.drawDiagram = function (p) {
        p.background(0);
        // set color
        p.stroke(base_1.GRAPH_AXIS_STROKE);
        p.strokeWeight(base_1.GRAPH_AXIS_SW);
        p.noFill();
        // draw axis
        p.line(base_1.GRAPH_PADDING_WIDTH * p.width - base_1.GRAPH_SW, p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) + base_1.GRAPH_SW, p.width * (1 - base_1.GRAPH_PADDING_WIDTH) - base_1.GRAPH_SW, p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) + base_1.GRAPH_SW);
        p.line(base_1.GRAPH_PADDING_WIDTH * p.width - base_1.GRAPH_SW, base_1.GRAPH_PADDING_HEIGHT * p.height + base_1.GRAPH_SW, base_1.GRAPH_PADDING_WIDTH * p.width - base_1.GRAPH_SW, p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) + base_1.GRAPH_SW);
        // drawing the arrows at the end of the axis
        // x - axis
        p.line(p.width * (1 - base_1.GRAPH_PADDING_WIDTH), p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) + base_1.GRAPH_AXIS_SW / 2, p.width * (1 - base_1.GRAPH_PADDING_WIDTH) - base_1.GRAPH_ARROWTIP_LENGTH, p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) -
            base_1.GRAPH_ARROWTIP_LENGTH +
            base_1.GRAPH_AXIS_SW / 2);
        p.line(p.width * (1 - base_1.GRAPH_PADDING_WIDTH), p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) + base_1.GRAPH_AXIS_SW / 2, p.width * (1 - base_1.GRAPH_PADDING_WIDTH) - base_1.GRAPH_ARROWTIP_LENGTH, p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) +
            base_1.GRAPH_ARROWTIP_LENGTH +
            base_1.GRAPH_AXIS_SW / 2);
        // y - axis
        p.line(base_1.GRAPH_PADDING_WIDTH * p.width - base_1.GRAPH_AXIS_SW / 2, base_1.GRAPH_PADDING_HEIGHT * p.height, base_1.GRAPH_PADDING_WIDTH * p.width + base_1.GRAPH_ARROWTIP_LENGTH - base_1.GRAPH_AXIS_SW / 2, base_1.GRAPH_PADDING_HEIGHT * p.height + base_1.GRAPH_ARROWTIP_LENGTH);
        p.line(base_1.GRAPH_PADDING_WIDTH * p.width - base_1.GRAPH_AXIS_SW / 2, base_1.GRAPH_PADDING_HEIGHT * p.height, base_1.GRAPH_PADDING_WIDTH * p.width - base_1.GRAPH_ARROWTIP_LENGTH - base_1.GRAPH_AXIS_SW / 2, base_1.GRAPH_PADDING_HEIGHT * p.height + base_1.GRAPH_ARROWTIP_LENGTH);
        p.strokeWeight(base_1.GRAPH_AXIS_LINE_SW);
        p.textSize(base_1.textFontSize * 0.7);
        p.textAlign(p.CENTER, p.CENTER);
        // labeling the x axis
        {
            var y = p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) + base_1.GRAPH_SW;
            for (var i = 0; i < base_1.GRID_MAX[base_1.curMaterial]; i += base_1.GRAPH_X_AXIS_STEP[base_1.curMaterial]) {
                var x = base_1.map(i, 0, base_1.GRID_MAX[base_1.curMaterial], base_1.GRAPH_PADDING_WIDTH * p.width, p.width * (1 - base_1.GRAPH_PADDING_WIDTH));
                if (i > 0)
                    p.line(x, y - base_1.GRAPH_AXIS_LINE_HEIGHT, x, y + base_1.GRAPH_AXIS_LINE_HEIGHT);
                if (i % base_1.GRAPH_X_AXIS_LABEL_STEP[base_1.curMaterial] === 0)
                    p.text(i, x, y + base_1.GRAPH_AXIS_LINE_HEIGHT + base_1.textFontSize * 0.7);
            }
            p.text("U in V", p.width * (1 - base_1.GRAPH_PADDING_WIDTH), y + (base_1.GRAPH_AXIS_LINE_HEIGHT + base_1.textFontSize * 0.7) * 1.3);
        }
        // labeling the y axis
        {
            var x = p.width * base_1.GRAPH_PADDING_WIDTH - base_1.GRAPH_SW;
            for (var i = 0; i < base_1.AMPERAGE_MAX[base_1.curMaterial]; i += base_1.GRAPH_Y_AXIS_STEP[base_1.curMaterial]) {
                var y = base_1.map(i, 0, base_1.AMPERAGE_MAX[base_1.curMaterial], p.height * (1 - base_1.GRAPH_PADDING_HEIGHT) + base_1.GRAPH_SW, base_1.GRAPH_PADDING_HEIGHT * p.height);
                if (i > 0)
                    p.line(x - base_1.GRAPH_AXIS_LINE_HEIGHT, y, x + base_1.GRAPH_AXIS_LINE_HEIGHT, y);
                if (i % base_1.GRAPH_Y_AXIS_LABEL_STEP[base_1.curMaterial] === 0)
                    p.text(i, x - base_1.GRAPH_AXIS_LINE_HEIGHT - base_1.textFontSize * 0.7, y);
            }
            p.text("I in nA", x - base_1.GRAPH_AXIS_LINE_HEIGHT - base_1.textFontSize * 0.7, p.height * base_1.GRAPH_PADDING_HEIGHT * 0.7);
        }
    };
    // map the voltage to coordinates on the canvas
    GraphSketch.mapToCnv = function (p, _x) {
        var x = base_1.map(_x / base_1.GRAPH_X_ACCURACY[base_1.curMaterial], 0, base_1.GRID_MAX[base_1.curMaterial], base_1.GRAPH_PADDING_WIDTH * p.width, p.width - base_1.GRAPH_PADDING_WIDTH * p.width);
        var y = base_1.map(base_1.measuredPoints[_x], 0, base_1.AMPERAGE_MAX[base_1.curMaterial], p.height - base_1.GRAPH_PADDING_HEIGHT * p.height, base_1.GRAPH_PADDING_HEIGHT * p.height);
        return [x, y];
    };
    // draw the actual curve
    GraphSketch.drawGraph = function (p) {
        p.beginShape();
        for (var _x = 0; _x < base_1.GRID_MAX[base_1.curMaterial] * base_1.GRAPH_X_ACCURACY[base_1.curMaterial]; _x++) {
            var _a = GraphSketch.mapToCnv(p, _x), x = _a[0], y = _a[1];
            p.vertex(x, y);
        }
        p.endShape();
        p.smooth();
    };
    // highlight the current position / voltage
    GraphSketch.drawCurPoint = function (p) {
        p.stroke(base_1.GRAPH_CUR_POINT_COLOR);
        p.strokeWeight(base_1.GRAPH_CUR_POINT_SW);
        p.noFill();
        var x = base_1.map(base_1.uGrid, 0, base_1.GRID_MAX[base_1.curMaterial], base_1.GRAPH_PADDING_WIDTH * exports.graphP5.width, exports.graphP5.width - base_1.GRAPH_PADDING_WIDTH * exports.graphP5.width);
        var y = base_1.map(base_1.f(base_1.uGrid), 0, base_1.AMPERAGE_MAX[base_1.curMaterial], exports.graphP5.height - base_1.GRAPH_PADDING_HEIGHT * exports.graphP5.height, base_1.GRAPH_PADDING_HEIGHT * exports.graphP5.height);
        p.point(x, y);
    };
    GraphSketch.reset = function (p) {
        p.noLoop();
        GraphSketch.graphCnv = p.createCanvas(GraphSketch.parent.clientWidth, GraphSketch.parent.clientHeight);
        GraphSketch.graphCnv.parent(GraphSketch.parent);
        GraphSketch.graphCnv.id("graph-canvas");
        p.pixelDensity(1);
        GraphSketch.graphCnv.mousePressed(base_1.clearGraph);
        GraphSketch.drawDiagram(p);
        p.stroke(base_1.GRAPH_STROKE);
        p.strokeWeight(base_1.GRAPH_SW);
        GraphSketch.drawGraph(p);
        GraphSketch.prevWidth = GraphSketch.parent.clientWidth;
        GraphSketch.prevHeight = GraphSketch.parent.clientHeight;
        p.frameRate(base_1.GRAPH_FRAMERATE);
        p.loop();
    };
    GraphSketch.setup = function (p) {
        GraphSketch.parent = window.document.getElementById("graph-canvas-container");
        GraphSketch.reset(p);
    };
    GraphSketch.draw = function (p) {
        GraphSketch.drawDiagram(p);
        p.stroke(base_1.GRAPH_STROKE);
        p.strokeWeight(base_1.GRAPH_SW);
        GraphSketch.drawGraph(p);
        GraphSketch.drawCurPoint(p);
    };
    return GraphSketch;
}());
exports.GraphSketch = GraphSketch;
exports.graphP5 = new p5(function (p) {
    p.preload = function () { };
    p.setup = function () { return GraphSketch.setup(p); };
    p.draw = function () { return GraphSketch.draw(p); };
}, document.getElementById("#graph-canvas-container"));
