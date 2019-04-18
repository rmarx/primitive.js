import Canvas from "./canvas.js";
import * as util from "./util.js";

window.DEBUGrandomCount = 0;
window.DEBUGsalientCount = 0;

/* Shape: a geometric primitive with a bbox */
export class Shape {
	randomPoint(width, height) {

		// note: this is also called when mutating. It never has saliency set then
		// however, that's just because it's called in the ctor : overridden immediately afterwards
		if( this.saliency && (Math.random() < this.saliency.bias) ){

			let saliencyAreas = this.saliency.boundingShapes;
			// Note: we do all the logic here because it's easiest to implement
			// in a decent framework, we would abstract this out, but we don't plan to keep on using this anyway, so...

			// for now, we just use the axis-aligned bounding box. 
			// Since we do a bit of mutating anyways, this should work well enough.

			// we can have multiple salient areas: choose one at random
			// length = 1: floor to 0, length = 2: floor to 0 or 1 etc.
			let rectIndex = ~~(Math.random() * saliencyAreas.length);

			
			// BEWARE: saliencyAreas is shared by ALL generated shapes! 
			if( !saliencyAreas[rectIndex].bbox ){
				console.log("Generating saliency BBOX, should only happen once for each salient area!");
				let min = [
					saliencyAreas[rectIndex].points.reduce((v, p) => Math.min(v, p[0]), Infinity),
					saliencyAreas[rectIndex].points.reduce((v, p) => Math.min(v, p[1]), Infinity)
				];
				let max = [
					saliencyAreas[rectIndex].points.reduce((v, p) => Math.max(v, p[0]), -Infinity),
					saliencyAreas[rectIndex].points.reduce((v, p) => Math.max(v, p[1]), -Infinity)
				];
		
				saliencyAreas[rectIndex].bbox = {
					left: min[0],
					top: min[1],
					width: (max[0]-min[0]) || 1, /* fallback for deformed shapes */
					height: (max[1]-min[1]) || 1
				};
			}

			let x = saliencyAreas[rectIndex].bbox.left + Math.random()*saliencyAreas[rectIndex].bbox.width;
			let y = saliencyAreas[rectIndex].bbox.top + Math.random()*saliencyAreas[rectIndex].bbox.height;

			++window.DEBUGsalientCount;
			return [~~x, ~~y];
		}
		else{
			// no saliency info known: just random for the entire image 
			// ~~ is a faster replacement for Math.floor 
			++window.DEBUGrandomCount;
			//console.trace("Random point without saliency, what madness is this?!?");
			return [~~(Math.random()*width), ~~(Math.random()*height)];
		}

		/*
        if( 1 == 0 ){
            // ~~ is a faster replacement for Math.floor 
            let leftEdge = width * 0.40;
            let rightEdge = width * 0.60;
            width = (Math.random()*(rightEdge - leftEdge)) + leftEdge; // between leftEdge and rightEdge

            // y 0 is at the TOP, not bottom, so inverse logic 
            let topEdge = height * 0.15; // should be the shorter one 
            let bottomEdge = height * 0.25;
            height = (Math.random()*(bottomEdge - topEdge)) + topEdge;

            console.log("RANDOM POINT ", leftEdge, rightEdge, width, height);
            return [~~width, ~~height];
		}
		*/
	}

	static create(cfg) {
		let ctors = cfg.shapeTypes;
		let index = Math.floor(Math.random() * ctors.length);
		let ctor = ctors[index];

		return new ctor(cfg.width, cfg.height, cfg.saliency);
	}

	constructor(w, h, saliency) {
		this.bbox = {};
		this.saliency = saliency;
	}

	mutate(cfg) { return this; }

	toSVG() {}

	/* get a new smaller canvas with this shape */
	rasterize(alpha) { 
		let canvas = new Canvas(this.bbox.width, this.bbox.height);
		let ctx = canvas.ctx;
		ctx.fillStyle = "#000";
		ctx.globalAlpha = alpha;
		ctx.translate(-this.bbox.left, -this.bbox.top);
		this.render(ctx);
		return canvas;
	}

	render(ctx) {}
}

export class Polygon extends Shape {
	constructor(w, h, saliency, count) {
		super(w, h, saliency);
		
		if( count != 0 ){
			this.points = this._createPoints(w, h, count);
			this.computeBbox();
		}
	}

	render(ctx) {
		ctx.beginPath();
		this.points.forEach(([x, y], index) => {
			if (index) {
				ctx.lineTo(x, y);
			} else {
				ctx.moveTo(x, y);
			}
		});
		ctx.closePath();
		ctx.fill();
	}

	toSVG() {
		let path = document.createElementNS(util.SVGNS, "path");
		let d = this.points.map((point, index) => {
			let cmd = (index ? "L" : "M");
			return `${cmd}${point.join(",")}`;
		}).join("");
		path.setAttribute("d", `${d}Z`);
		return path;
	}

	mutate(cfg) {
		let clone = new this.constructor(0, 0, this.saliency, 0);
		clone.points = this.points.map(point => point.slice());

		let index = Math.floor(Math.random() * this.points.length);
		let point = clone.points[index];

		let angle = Math.random() * 2 * Math.PI;
		let radius = Math.random() * 20;
		point[0] += ~~(radius * Math.cos(angle));
		point[1] += ~~(radius * Math.sin(angle));

		return clone.computeBbox();
	}

	computeBbox() {
		let min = [
			this.points.reduce((v, p) => Math.min(v, p[0]), Infinity),
			this.points.reduce((v, p) => Math.min(v, p[1]), Infinity)
		];
		let max = [
			this.points.reduce((v, p) => Math.max(v, p[0]), -Infinity),
			this.points.reduce((v, p) => Math.max(v, p[1]), -Infinity)
		];

		this.bbox = {
			left: min[0],
			top: min[1],
			width: (max[0]-min[0]) || 1, /* fallback for deformed shapes */
			height: (max[1]-min[1]) || 1
		};

		return this;
	}

	_createPoints(w, h, count) {
		let first = this.randomPoint(w, h);
		let points = [first];

		for (let i=1;i<count;i++) {
			let angle = Math.random() * 2 * Math.PI;
			let radius = Math.random() * 20;//100; // originaly, this constant was 20
			points.push([
				first[0] + ~~(radius * Math.cos(angle)),
				first[1] + ~~(radius * Math.sin(angle))
			]);
		}
		return points;
	}
}

export class Triangle extends Polygon {
	constructor(w, h, saliency) {
		super(w, h, saliency, 3);
	}
}

export class Rectangle extends Polygon {
	constructor(w, h, saliency) {
		super(w, h, saliency, 4);
	}

	mutate(cfg) {
		let clone = new this.constructor(0, 0, this.saliency, 0);
		clone.points = this.points.map(point => point.slice());

		let amount = ~~((Math.random()-0.5) * 20);

		switch (Math.floor(Math.random()*4)) {
			case 0: /* left */
				clone.points[0][0] += amount;
				clone.points[3][0] += amount;
			break;
			case 1: /* top */
				clone.points[0][1] += amount;
				clone.points[1][1] += amount;
			break;
			case 2: /* right */
				clone.points[1][0] += amount;
				clone.points[2][0] += amount;
			break;
			case 3: /* bottom */
				clone.points[2][1] += amount;
				clone.points[3][1] += amount;
			break;
		}

		return clone.computeBbox();
	}

	_createPoints(w, h, count) {
		let p1 = this.randomPoint(w, h);
		let p2 = this.randomPoint(w, h);

		let left = Math.min(p1[0], p2[0]);
		let right = Math.max(p1[0], p2[0]);
		let top = Math.min(p1[1], p2[1]);
		let bottom = Math.max(p1[1], p2[1]);

		return [
			[left, top],
			[right, top],
			[right, bottom],
			[left, bottom]
		];
	}
}

export class Ellipse extends Shape {
	constructor(w, h, saliency) {
		super(w, h, saliency);

		this.center = this.randomPoint(w, h);
		this.rx = 1 + ~~(Math.random() * 20);
		this.ry = 1 + ~~(Math.random() * 20);

		this.computeBbox();
	}

	render(ctx) {
		ctx.beginPath();
		ctx.ellipse(this.center[0], this.center[1], this.rx, this.ry, 0, 0, 2*Math.PI, false);
		ctx.fill();
	}

	toSVG() {
		let node = document.createElementNS(util.SVGNS, "ellipse");
		node.setAttribute("cx", this.center[0]);
		node.setAttribute("cy", this.center[1]);
		node.setAttribute("rx", this.rx);
		node.setAttribute("ry", this.ry);
		return node;
	}

	mutate(cfg) {
		let clone = new this.constructor(0, 0, this.saliency);
		clone.center = this.center.slice();
		clone.rx = this.rx;
		clone.ry = this.ry;

		switch (Math.floor(Math.random()*3)) {
			case 0:
				let angle = Math.random() * 2 * Math.PI;
				let radius = Math.random() * 20;
				clone.center[0] += ~~(radius * Math.cos(angle));
				clone.center[1] += ~~(radius * Math.sin(angle));
			break;

			case 1:
				clone.rx += (Math.random()-0.5) * 20;
				clone.rx = Math.max(1, ~~clone.rx);
			break;

			case 2:
				clone.ry += (Math.random()-0.5) * 20;
				clone.ry = Math.max(1, ~~clone.ry);
			break;
		}

		return clone.computeBbox();
	}

	computeBbox() {
		this.bbox = {
			left: this.center[0] - this.rx,
			top: this.center[1] - this.ry,
			width: 2*this.rx,
			height: 2*this.ry
		}
		return this;
	}
}

export class Smiley extends Shape {
	constructor(w, h, saliency) {
		super(w, h, saliency);
		this.center = this.randomPoint(w, h);
		this.text = "☺";
		this.fontSize = 16;
		this.computeBbox();
	}

	computeBbox() {
		let tmp = new Canvas(1, 1);
		tmp.ctx.font = `${this.fontSize}px sans-serif`;
		let w = ~~(tmp.ctx.measureText(this.text).width);

		this.bbox = {
			left: ~~(this.center[0] - w/2),
			top: ~~(this.center[1] - this.fontSize/2),
			width: w,
			height: this.fontSize
		}
		return this;
	}

	render(ctx) {
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = `${this.fontSize}px sans-serif`;
		ctx.fillText(this.text, this.center[0], this.center[1]);
	}

	mutate(cfg) {
		let clone = new this.constructor(0, 0, this.saliency)
		clone.center = this.center.slice();
		clone.fontSize = this.fontSize;

		switch (Math.floor(Math.random()*2)) {
			case 0:
				let angle = Math.random() * 2 * Math.PI;
				let radius = Math.random() * 20;
				clone.center[0] += ~~(radius * Math.cos(angle));
				clone.center[1] += ~~(radius * Math.sin(angle));
			break;

			case 1:
				clone.fontSize += (Math.random() > 0.5 ? 1 : -1);
				clone.fontSize = Math.max(10, clone.fontSize);
			break;
		}

		return clone.computeBbox();
	}

	toSVG() {
		let text = document.createElementNS(util.SVGNS, "text");
		text.appendChild(document.createTextNode(this.text));

		text.setAttribute("text-anchor", "middle");
		text.setAttribute("dominant-baseline", "central");
		text.setAttribute("font-size", this.fontSize);
		text.setAttribute("font-family", "sans-serif");
		text.setAttribute("x", this.center[0]);
		text.setAttribute("y", this.center[1]);

		return text;
	}
}

export class Debug extends Shape {
	constructor(w, h, saliency) {
		super(w, h, saliency);
		this.bbox = {left: 0, top: 0, width:w, height: h};
	}

	render(ctx) {
		ctx.fillRect(0, 0, 1.5, 1.5);
	}
}
