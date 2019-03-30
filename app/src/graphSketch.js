// graphSketch.js
// p5.js sketch file for the graph

const graphSketch = p => {
	p.drawDiagram = () => {
		p.background(0);

		// set color
		p.stroke(GRAPH_AXIS_STROKE);
		p.strokeWeight(GRAPH_AXIS_SW);
		p.noFill();

		// draw axis
		p.line(
			GRAPH_PADDING_WIDTH * p.width - GRAPH_SW,
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW,
			p.width * (1 - GRAPH_PADDING_WIDTH) - GRAPH_SW,
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW
		);
		p.line(
			GRAPH_PADDING_WIDTH * p.width - GRAPH_SW,
			GRAPH_PADDING_HEIGHT * p.height + GRAPH_SW,
			GRAPH_PADDING_WIDTH * p.width - GRAPH_SW,
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW
		);

		// drawing the arrows at the end of the axis
		// x - axis
		p.line(
			p.width * (1 - GRAPH_PADDING_WIDTH),
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_AXIS_SW / 2,
			p.width * (1 - GRAPH_PADDING_WIDTH) - GRAPH_ARROWTIP_LENGTH,
			p.height * (1 - GRAPH_PADDING_HEIGHT) -
				GRAPH_ARROWTIP_LENGTH +
				GRAPH_AXIS_SW / 2
		);
		p.line(
			p.width * (1 - GRAPH_PADDING_WIDTH),
			p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_AXIS_SW / 2,
			p.width * (1 - GRAPH_PADDING_WIDTH) - GRAPH_ARROWTIP_LENGTH,
			p.height * (1 - GRAPH_PADDING_HEIGHT) +
				GRAPH_ARROWTIP_LENGTH +
				GRAPH_AXIS_SW / 2
		);
		// y - axis
		p.line(
			GRAPH_PADDING_WIDTH * p.width - GRAPH_AXIS_SW / 2,
			GRAPH_PADDING_HEIGHT * p.height,
			GRAPH_PADDING_WIDTH * p.width + GRAPH_ARROWTIP_LENGTH - GRAPH_AXIS_SW / 2,
			GRAPH_PADDING_HEIGHT * p.height + GRAPH_ARROWTIP_LENGTH
		);
		p.line(
			GRAPH_PADDING_WIDTH * p.width - GRAPH_AXIS_SW / 2,
			GRAPH_PADDING_HEIGHT * p.height,
			GRAPH_PADDING_WIDTH * p.width - GRAPH_ARROWTIP_LENGTH - GRAPH_AXIS_SW / 2,
			GRAPH_PADDING_HEIGHT * p.height + GRAPH_ARROWTIP_LENGTH
		);

		p.strokeWeight(GRAPH_AXIS_LINE_SW);
		p.textSize(textFontSize * 0.7);
		p.textAlign(p.CENTER, p.CENTER);

		// labeling the x axis
		{
			const y = p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW;
			for (let i = 0; i < GRID_MAX; i += GRAPH_X_AXIS_STEP) {
				let x = map(
					i,
					0,
					GRID_MAX,
					GRAPH_PADDING_WIDTH * p.width,
					p.width * (1 - GRAPH_PADDING_WIDTH)
				);
				if (i > 0)
					p.line(x, y - GRAPH_AXIS_LINE_HEIGHT, x, y + GRAPH_AXIS_LINE_HEIGHT);

				p.text(i, x, y + GRAPH_AXIS_LINE_HEIGHT + textFontSize * 0.7);
			}

			p.text(
				"U in V",
				p.width * (1 - GRAPH_PADDING_WIDTH),
				y + (GRAPH_AXIS_LINE_HEIGHT + textFontSize * 0.7) * 1.3
			);
		}

		// labeling the y axis
		{
			const x = p.width * GRAPH_PADDING_WIDTH - GRAPH_SW;
			for (let i = 0; i < AMPERAGE_MAX; i += GRAPH_Y_AXIS_STEP) {
				let y = map(
					i,
					0,
					AMPERAGE_MAX,
					p.height * (1 - GRAPH_PADDING_HEIGHT) + GRAPH_SW,
					GRAPH_PADDING_HEIGHT * p.height
				);
				if (i > 0)
					p.line(x - GRAPH_AXIS_LINE_HEIGHT, y, x + GRAPH_AXIS_LINE_HEIGHT, y);

				p.text(i, x - GRAPH_AXIS_LINE_HEIGHT - textFontSize * 0.7, y);
			}

			p.text(
				"I in nA",
				x - GRAPH_AXIS_LINE_HEIGHT - textFontSize * 0.7,
				p.height * GRAPH_PADDING_HEIGHT * 0.7
			);
		}
	};

	// map the voltage to coordinates on the canvas
	p.mapToCnv = _x => {
		const x = map(
			_x / GRAPH_X_ACCURACY,
			0,
			GRID_MAX,
			GRAPH_PADDING_WIDTH * p.width,
			p.width - GRAPH_PADDING_WIDTH * p.width
		);
		const y = map(
			measuredPoints[_x] / GRAPH_Y_ACCURACY,
			0,
			AMPERAGE_MAX,
			p.height - GRAPH_PADDING_HEIGHT * p.height,
			GRAPH_PADDING_HEIGHT * p.height
		);

		return [x, y];
	};

	// draw the actual curve
	p.drawGraph = () => {
		p.beginShape();
		for (let _x = 0; _x < GRAPH_POINTS_ARR_LEN; _x++) {
			const [x, y] = p.mapToCnv(_x);
			p.vertex(x, y);
		}
		p.endShape();
		p.smooth();
	};

	// highlight the current position / voltage
	p.drawCurPoint = () => {
		p.stroke(GRAPH_CUR_POINT_COLOR);
		p.strokeWeight(GRAPH_CUR_POINT_SW);
		p.noFill();
		const x = map(
			uGrid,
			0,
			GRID_MAX,
			GRAPH_PADDING_WIDTH * graphP5.width,
			graphP5.width - GRAPH_PADDING_WIDTH * graphP5.width
		);
		const y = map(
			f(uGrid),
			0,
			AMPERAGE_MAX,
			graphP5.height - GRAPH_PADDING_HEIGHT * graphP5.height,
			GRAPH_PADDING_HEIGHT * graphP5.height
		);
		p.point(x, y);
	};

	p.reset = () => {
		p.noLoop();
		p.graphCnv = p.createCanvas(p.parent.clientWidth, p.parent.clientHeight);
		p.graphCnv.parent(p.parent);
		p.graphCnv.id("graph-canvas");
		p.pixelDensity(1);
		p.graphCnv.mousePressed(clearGraph);

		p.drawDiagram();

		p.stroke(GRAPH_STROKE);
		p.strokeWeight(GRAPH_SW);

		// p.recalcPoints();
		p.drawGraph();

		p.prevWidth = p.parent.clientWidth;
		p.prevHeight = p.parent.clientHeight;

		p.frameRate(GRAPH_FRAMERATE);
		p.loop();
	};

	p.setup = () => {
		p.parent = window.document.getElementById("graph-canvas-container");
		p.reset();
	};

	p.draw = () => {
		p.drawDiagram();
		p.stroke(GRAPH_STROKE);
		p.strokeWeight(GRAPH_SW);
		p.drawGraph();
		p.drawCurPoint();
	};
};

const graphP5 = new p5(graphSketch, "#graph-canvas-container");
