import {Triangle, Rectangle, Ellipse, Smiley} from "./shape.js";

const numberFields = ["computeSize", "viewSize", "steps", "shapes", "alpha", "mutations"];
const boolFields = ["mutateAlpha"];
const fillField = "fill";
const shapeField = "shapeType";
const shapeMap = {
	"triangle": Triangle,
	"rectangle": Rectangle,
	"ellipse": Ellipse,
	"smiley": Smiley
}

function fixRange(range) {
	function sync() {
		let value = range.value;
		range.parentNode.querySelector(".value").innerHTML = value;
	}

	range.oninput = sync;
	sync();
}

export function init() {
	let ranges = document.querySelectorAll("[type=range]");
	Array.from(ranges).forEach(fixRange);
}

export function lock() {
	/* fixme */
}

export function showResult(raster, vector) {
	let node;

	node = document.querySelector("#placeholder-raster");
	node.innerHTML = "";
	node.appendChild(raster);

	node = document.querySelector("#placeholder-vector");
	node.innerHTML = "";
	node.appendChild(vector);
}

export function getConfig() {
	let form = document.querySelector("form");
	let cfg = {};

	numberFields.forEach(name => {
		cfg[name] = Number(form.querySelector(`[name=${name}]`).value);
	});

	boolFields.forEach(name => {
		cfg[name] = form.querySelector(`[name=${name}]`).checked;
	});

	cfg.shapeTypes = [];
	let shapeFields = Array.from(form.querySelectorAll(`[name=${shapeField}]`));
	shapeFields.forEach(input => {
		if (!input.checked) { return; }
		cfg.shapeTypes.push(shapeMap[input.value]);
	});

	let fillFields = Array.from(form.querySelectorAll(`[name=${fillField}]`));
	fillFields.forEach(input => {
		if (!input.checked) { return; }
		
		switch (input.value) {
			case "auto": cfg.fill = "auto"; break;
			case "fixed": cfg.fill = form.querySelector("[name='fill-color']").value; break;
		}
	});

	cfg.DEBUGGING = document.querySelector("#debuggingToggle").checked;
	
	console.log("DEBUGGING", cfg.DEBUGGING);

	document.getElementById("debugPhase1Canvas").style.display = cfg.DEBUGGING ? "block" : "none";
	document.getElementById("debugMutationCanvas").style.display = cfg.DEBUGGING ? "block" : "none";

	cfg.saliency = {};
	cfg.saliency.phase = 0;
	cfg.saliency.boundingShapes = [];  
	// for now, hardcoded on pexels/1a2b89987b488d73140e70db8360a804e3302b37abb4af0a8d0f9800749788f8.json
	/*
	cfg.saliency.boundingShapes.push({
		"points": [
			[
				3582,
				1783
			],
			[
				3153,
				1367
			],
			[
				3770,
				733
			],
			[
				4198,
				1149
			]
		]
	});
	*/
	
	
	cfg.saliency.boundingShapes.push({
		"points": [
			[
				3309,
				857
			],
			[
				3309 + 730,
				857
			],
			[
				3309 + 730,
				857 + 731
			],
			[
				3309,
				857 + 731
			]
		]
	});

	return cfg;
}
