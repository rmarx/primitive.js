import * as ui from "./ui.js";
import Canvas from "./canvas.js";
import Optimizer from "./optimizer.js";

// these are just the output nodes on the bottom of the page, not the input switches
const nodes = {
	output: document.querySelector("#output"),
	original: document.querySelector("#original"),
	steps: document.querySelector("#steps"),
    raster: document.querySelector("#raster"),
    debugPhase1Canvas: document.querySelector("#debugPhase1Canvas"),
    debugMutationCanvas: document.querySelector("#debugMutationCanvas"),
	vector: document.querySelector("#vector"),
	vectorText: document.querySelector("#vector-text"),
	types: Array.from(document.querySelectorAll("#output [name=type]"))
}

let steps;

function go(originalCanvas, cfg) {
    ui.lock();
    
    console.log("ROBIN SAYS GOOOO!");

	nodes.steps.innerHTML = "";
	nodes.original.innerHTML = "";
    nodes.raster.innerHTML = "";
    nodes.debugPhase1Canvas.innerHTML = "";
    nodes.debugMutationCanvas.innerHTML = "";
	nodes.vector.innerHTML = "";
	nodes.vectorText.value = "";

	nodes.output.style.display = "";
	nodes.original.appendChild(originalCanvas.node);

	let optimizer = new Optimizer(originalCanvas, cfg);
    steps = 0;
    
    console.log(`Scaling to ${cfg.scale}`);

	let cfg2 = Object.assign({}, cfg, {width:cfg.scale*cfg.width, height:cfg.scale*cfg.height});
	let rasterCanvas = Canvas.empty(cfg2, false);
	rasterCanvas.ctx.scale(cfg.scale, cfg.scale);
	nodes.raster.appendChild(rasterCanvas.node);

	let svgCanvas = Canvas.empty(cfg, true);
	svgCanvas.setAttribute("width", cfg2.width);
	svgCanvas.setAttribute("height", cfg2.height);
    nodes.vector.appendChild(svgCanvas);
    
    let debugPhase1Canvas = Canvas.empty(cfg2, false);
	debugPhase1Canvas.ctx.scale(cfg.scale, cfg.scale);
	nodes.debugPhase1Canvas.appendChild(debugPhase1Canvas.node);
    let debugMutationCanvas = Canvas.empty(cfg2, false);
	debugMutationCanvas.ctx.scale(cfg.scale, cfg.scale);
	nodes.debugMutationCanvas.appendChild(debugMutationCanvas.node);

	let serializer = new XMLSerializer();

    // optimizer generates step definitions, here we actually draw them
    // it is very unclear to me why we are rendering to both raster and svg canvases though...
	optimizer.onStep = (step) => {
		if (step) {
			rasterCanvas.drawStep(step);
			svgCanvas.appendChild(step.toSVG());
			let percent = (100*(1-step.distance)).toFixed(2);
			nodes.vectorText.value = serializer.serializeToString(svgCanvas);
			nodes.steps.innerHTML = `(${++steps} of ${cfg.steps}, ${percent}% similar)`;
        }
        else
            console.error("app:onStep : no step given... is this really an error though? ", step);
    }
    
	optimizer.onDebugPhase1Step = (step, referenceCanvas) => {
		if (step) {
            debugPhase1Canvas.replaceWithOther( referenceCanvas );
			debugPhase1Canvas.drawStep(step);
        }
        else
            console.error("app:onDebugMutationStep : no step given... is this really an error though? ", step);
	}

	optimizer.onDebugMutationStep = (step, referenceCanvas) => {
		if (step) {
            debugMutationCanvas.replaceWithOther( referenceCanvas );
			debugMutationCanvas.drawStep(step);
        }
        else
            console.error("app:onDebugMutationStep : no step given... is this really an error though? ", step);
	}

	optimizer.start();

	document.documentElement.scrollTop = document.documentElement.scrollHeight;
}

function onSubmit(e) {
	e.preventDefault();

	let inputFile = document.querySelector("input[type=file]");
	let inputUrl = document.querySelector("input[name=url]");

	let url = "test";
	if (inputFile.files.length > 0) {
		let file = inputFile.files[0];
		url = URL.createObjectURL(file);
	} else if (inputUrl.value) {
		url = inputUrl.value;
	}

	let cfg = ui.getConfig();

	Canvas.original(url, cfg).then(originalCanvas => go(originalCanvas, cfg));
}




function init() {
	nodes.output.style.display = "none";
	nodes.types.forEach(input => input.addEventListener("click", syncType));
	ui.init();
	syncType();
	document.querySelector("form").addEventListener("submit", onSubmit);
}

function syncType() {
	nodes.output.className = "";
	nodes.types.forEach(input => {
		if (input.checked) { nodes.output.classList.add(input.value); }
	});
}

init();
