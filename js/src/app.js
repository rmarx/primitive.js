import * as ui from "./ui.js";
import autoConfig from "./automatedConfig.js";
import Canvas from "./canvas.js";
import Optimizer from "./optimizer.js";
import {Polygon} from "./shape.js";
//import * as JSZip from "jszip";

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
	//svgCanvas.setAttribute("width", cfg2.width); // screen-filling svg by default
	//svgCanvas.setAttribute("height", cfg2.height); // screen-filling svg by default
	nodes.vector.appendChild(svgCanvas);
	
	// svg is not by default filling up the div, as is the case with canvas 
	document.getElementById("vector").style.width = cfg2.width + "px";
	document.getElementById("vector").style.height = cfg2.height + "px";
    
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
		if (step !== undefined && step !== null) {
			rasterCanvas.drawStep(step);
			svgCanvas.appendChild(step.toSVG());
			let percent = (100*(1-step.distance)).toFixed(2);
			nodes.vectorText.value = serializer.serializeToString(svgCanvas);

			let configName = "";
			if( autoState && autoState.currentConfig && autoState.currentConfig.name )
				configName = "" + autoState.currentConfig.name + ", "

			if( cfg.saliency && (cfg.saliency.drawSalientRegions || cfg.DEBUGGING) )
				nodes.steps.innerHTML = `(${configName}${++steps} of ${cfg.steps}, ${percent}% similar, ${~~(cfg.saliency.bias*100)}% bias to salient regions)`;
			else
				nodes.steps.innerHTML = `(${++steps} of ${cfg.steps}, ${percent}% similar)`;
        }
        else
            console.error("app:onStep : no step given... is this really an error though? ", step);
    }
    
	optimizer.onDebugPhase1Step = (step, referenceCanvas) => {
		if( !cfg.DEBUGGING )
			return;

		if (step) {
			debugPhase1Canvas.replaceWithOther( referenceCanvas );
			debugPhase1Canvas.drawStep(step);
		}
		else
			console.error("app:onDebugMutationStep : no step given... is this really an error though? ", step);
	}

	optimizer.onDebugMutationStep = (step, referenceCanvas) => {
		if( !cfg.DEBUGGING )
			return;

		if (step) {
            debugMutationCanvas.replaceWithOther( referenceCanvas );
			debugMutationCanvas.drawStep(step);

			if( cfg.DEBUGGING && cfg.saliency && cfg.saliency.boundingShapes){
				optimizer.onSaliencyKnown( cfg.saliency.boundingShapes );
			}
        }
        else
            console.error("app:onDebugMutationStep : no step given... is this really an error though? ", step);
	}

	optimizer.onSaliencyKnown = (saliencyPolygons) => {

		// so we can make videos without salient regions
		let drawRegions = (cfg.saliency.drawSalientRegions !== undefined) ? cfg.saliency.drawSalientRegions : true;
		if( !drawRegions )
			return;

		if( !cfg.DEBUGGING ){
			debugPhase1Canvas.replaceWithOther( originalCanvas );
			for( let polygon of saliencyPolygons ){
				let p = new Polygon(2000, 2000, saliencyPolygons, polygon.points.length);
				p.points = polygon.points;
				p.computeBbox();
				debugPhase1Canvas.ctx.fillStyle = "#FF0000";
				debugPhase1Canvas.ctx.globalAlpha = 0.5;

				p.render( debugPhase1Canvas.ctx );
			}
		}
		else{
			for( let polygon of saliencyPolygons ){
				let p = new Polygon(2000, 2000, saliencyPolygons, polygon.points.length);
				p.points = polygon.points;
				p.computeBbox();
				debugMutationCanvas.ctx.fillStyle = "#FF0000";

				p.render( debugMutationCanvas.ctx );
			}
		}

	}

	optimizer.onDone = () => {

		if( autoState.currentURLindex != -1 ){ // if -1, it means we're not doing automated processing 
			console.log("Done, putting it in localStorage!");

			let url = autoState.currentURL;
			url = url.substring(url.lastIndexOf('/')+1);
			url = url.replace(".jpeg", ".svg");
			url = url.replace(".jpg", ".svg");
			url = url.replace(".png", ".svg");

			// want the config name at the END so windows explorer correctly sorts the same images together
			url = url.replace(".svg", "_" + autoState.currentConfig.name + ".svg");

			localStorage.setItem("automatedSVG_" + url, document.getElementById("vector-text").value);

			processNextURL();
		}

		/*
		let zip = new JSZip();

		let contents = localStorage.getItem("robinTestdeDingen");
		zip.file("test2.svg", contents );

		zip.generateAsync({type:"blob"}).then(function (blob) {
			
			let link = document.createElement('a');
			link.href = window.URL.createObjectURL( blob );
			link.download = "total.zip";

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			
		});
		*/
	}

	optimizer.start();

	document.documentElement.scrollTop = document.documentElement.scrollHeight;
}

function processURL( url, cfg ){
	Canvas.original(url, cfg).then(
		(originalCanvas) => {
			// cfg.scale is only now known
			if( cfg.saliency ){
				for( let shape of cfg.saliency.boundingShapes ){
					for( let point of shape.points ){
						point[0] = point[0] / cfg.computeScale; // x
						point[1] = point[1] / cfg.computeScale; // y
					}
				}
			}
			return go(originalCanvas, cfg);
		});
}

function onSubmit(e) {
	e.preventDefault();

	let inputFile = document.querySelector("input[type=file]");
	let inputUrl = document.querySelector("input[name=url]");

	let url = "test";
	let hardcodedURLused = false;
	if (inputFile.files.length > 0) {
		let file = inputFile.files[0];
		url = URL.createObjectURL(file);
	} else if (inputUrl.value) {
		url = inputUrl.value;
		if( inputUrl.value.indexOf("1a2b89987b488d73140e70db8360a804e3302b37abb4af0a8d0f9800749788f8.jpeg") >= 0 )
			hardcodedURLused = true;
	}

	let cfg = ui.getConfig();

	if( hardcodedURLused ){
		cfg.saliency = {};
		cfg.saliency.drawSalientRegions = true;
		cfg.saliency.bias = 0.95; // in percentage, how many shapes MUST originate within the salient areas
		// e.g., if 0: totally random. if 1: everything from salient areas, if 0.8: 80% will start in salient zone
		cfg.saliency.boundingShapes = [];  
		// for now, hardcoded on pexels/1a2b89987b488d73140e70db8360a804e3302b37abb4af0a8d0f9800749788f8.json
		cfg.saliency.boundingShapes.push({
			"points": [
				[
					3309 - (730 * 0.2),
					857 - (857 * 0.2)
				],
				[
					3309 - (730 * 0.2) + (730 * 1.4),
					857 - (731 * 0.2)
				],
				[
					3309 - (730 * 0.2) + (730 * 1.4),
					857 - (731 * 0.2) + (731 * 1.4)
				],
				[
					3309 - (730 * 0.2),
					857 - (731 * 0.2) + (731 * 1.4)
				]
			]
		});
	}

	processURL( url, cfg );
}

function onAutomatedStart(e){
	e.preventDefault();

	localStorage.clear();

	processNextURL();
}

let autoState = {};
autoState.currentURLindex = -1;
autoState.currentURL = "";
autoState.currentConfigIndex = 0;
autoState.currentConfig = autoConfig.configs[autoState.currentConfigIndex];

function processNextURL(){

	++autoState.currentURLindex;

	// we do all images in 1 config after another, then switch to the next config 
	if( autoState.currentURLindex >= autoConfig.urls.length ){
		if( autoState.currentConfigIndex < autoConfig.configs.length - 1 ){
			autoState.currentConfigIndex += 1;
			autoState.currentConfig = autoConfig.configs[ autoState.currentConfigIndex ];

			autoState.currentURLindex = 0;
		}
		else{
			autoState.currentConfigIndex += 1; // we would reach the length, so we're done
			// config limit has also been reached, we will go into the next if-test which ends the process
		}
	}

	if( autoState.currentURLindex >= autoConfig.urls.length && 
		autoState.currentConfigIndex >= autoConfig.configs.length ){
		console.log("Automated url processing done. Processed " + autoConfig.urls.length + " images, "+ autoConfig.configs.length +" times.");

		let zip = new JSZip();
		zip.file("config.json", JSON.stringify(autoConfig.configs, null, 4));

		let storedKeys = Object.keys( localStorage );
		let fileCount = 0;
		for( let key of storedKeys ){
			if( key.indexOf("automatedSVG_") < 0 )
				continue;

			zip.file( key.replace("automatedSVG_", ""), localStorage.getItem(key) );
			++fileCount;
		}

		if( fileCount > 0 ){

			zip.generateAsync({type:"blob"}).then(function (blob) {
				
				let link = document.createElement('a');
				link.href = window.URL.createObjectURL( blob );
				link.download = "automatedSVGs.zip";

				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				
			});
		}
		else{
			console.error("Automated processing done, but nothing was saved in localstorage... why did you even do it then?");
		}

		return;
	}

	autoState.currentURL = autoConfig.urls[autoState.currentURLindex];

	let saliencyURL = autoState.currentURL.replace("jpeg", "json");
	saliencyURL = saliencyURL.replace("jpg", "json");
	saliencyURL = saliencyURL.replace("png", "json");

	fetch(saliencyURL).then(
		function(response) {
			if (response.status !== 200) {
				console.log('Fetching saliency: Looks like there was a problem. Status Code: ' + response.status);
				return;
			}

			// Examine the text in the response
			response.json().then(function(saliencyInfo) {

				let saliency = autoState.currentConfig.saliency;
				saliency.boundingShapes = [];

				let rectangles = saliencyInfo.rectangles.axisAligned;
				for( let rectangle of rectangles ){
					// rectangle is object with properties h, w, x, y
					// we want to generate 4 coordinates: top left, top right, bottom right, bottom left 
					// for canvas drawing, top left is 0,0 (so inverted y-axis)
					
					let points = [];
					let enlargeBy = saliency.enlargeBy ? saliency.enlargeBy : 0; //0;//0.25; // 25%

					if( enlargeBy == 0 ){
						points.push( [rectangle.x, rectangle.y] );
						points.push( [rectangle.x + rectangle.w, rectangle.y] );
						points.push( [rectangle.x + rectangle.w, rectangle.y + rectangle.h] );
						points.push( [rectangle.x, rectangle.y + rectangle.h] );
					}
					else{
						// our python script is a bit too aggressive in generating bounding rects
						// so we might want to enlarge the salient regions a bit
						// e.g., if 20%, enlargeBy is 0.2
						// do left -20% of the width, right + 20%
						
						points.push( [rectangle.x - (rectangle.w * enlargeBy), rectangle.y - (rectangle.h * enlargeBy)] );
						points.push( [rectangle.x + (rectangle.w * ( 1 + enlargeBy)), rectangle.y - (rectangle.h * enlargeBy)] );
						points.push( [rectangle.x + (rectangle.w * ( 1 + enlargeBy)), rectangle.y + (rectangle.h * (1 + enlargeBy))] );
						points.push( [rectangle.x - (rectangle.w * enlargeBy), rectangle.y + (rectangle.h * (1 + enlargeBy))] );
					}
				
					saliency.boundingShapes.push( { "points": points} );
				}

				// set initial bias 
				saliency.bias = 0; // just in case if the tweak callback doesn't have initialization logic for step 0
				saliency.tweakParameters( autoState.currentConfig, 0, autoState.currentConfig.steps );
				
				document.getElementById("debugPhase1Canvas").style.display = (autoState.currentConfig.DEBUGGING || autoState.currentConfig.saliency.drawSalientRegions) ? "block" : "none";
				document.getElementById("debugMutationCanvas").style.display = autoState.currentConfig.DEBUGGING ? "block" : "none";
			
				//let cfg = ui.getConfig();
			
				console.log("CONFIG", JSON.stringify(autoState.currentConfig));
			
			
			
				processURL( autoState.currentURL, autoState.currentConfig );
				
			});
		}
	)
	.catch(function(err) {
		console.log('Fetching saliency Error :-S', err);
	});
}






function init() {
	nodes.output.style.display = "none";
	nodes.types.forEach(input => input.addEventListener("click", syncType));
	ui.init();
	syncType();
	document.querySelector("form").addEventListener("submit", onSubmit);

	document.querySelector("#automatedStart").addEventListener("click", onAutomatedStart);
}

function syncType() {
	nodes.output.className = "";
	nodes.types.forEach(input => {
		if (input.checked) { nodes.output.classList.add(input.value); }
	});
}

init();
