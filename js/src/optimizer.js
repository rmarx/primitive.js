import Step from "./step.js";
import State from "./state.js";
import Canvas from "./canvas.js";
import {Shape} from "./shape.js";

export default class Optimizer {
	constructor(originalCanvas, cfg) {
		this.cfg = cfg;
		this.state = new State(originalCanvas, Canvas.empty(cfg));
		this._steps = 0;
        this.onStep = () => {};
        this.onDone = () => {};
        console.log("initial distance %s", this.state.distance);
        
        //this.DEBUGGING = true;
        this.DEBUGGING = cfg.DEBUGGING;
        this.debugConfig = {};
        this.debugConfig.phase1Timeout = 0;
        this.debugConfig.mutationTimeout = 0;
        this.onSaliencyKnown = () => {};
        this.onDebugPhase1Step = () => {};
        this.onDebugMutationStep = () => {};
        this.debugState = new State(this.state.canvas, Canvas.empty(cfg));
        this.debugState.currentReferenceTarget = this.debugState.target;
	}

	start() {
        if( this.DEBUGGING && this.cfg.saliency && this.cfg.saliency.boundingShapes){
            this.onSaliencyKnown( this.cfg.saliency.boundingShapes );
        }
        
        this._ts = Date.now();
        this._addShape();
	}

	_addShape() {

        // Algorithm has 2 phases:
        // Phase 1: (findBestStep)
        // -------
        // generate an amount of steps (default = 200)
        // for each, check if they improve the visual similarity between the generated (target) and original image
        // return only the best result (lowest distance between original and generated)
        // 
        // Phase 2: (optimizeStep)
        // --------
        // For the result found in Phase 1, we try to permutate it, to see if we can get it to fit even better
        // We stop these permutations only when after a set limit of tries (default = 30), we have failed to improve the result (no mutated steps had lower distance)

		this._findBestStep().then(step => this._optimizeStep(step)).then(step => {
			this._steps++;
			if (step.distance < this.state.distance) { /* better than current state, epic */
				this.state = step.apply(this.state);
				console.log("switched to new state (%s) with distance: %s", this._steps, this.state.distance);
                this.onStep(step);
                
                this.debugState.currentReferenceTarget = this.state.canvas;
			} else { /* worse than current state, discard */
				this.onStep(null);
            }
			this._continue();
		});
	}

	_continue() {
		if (this._steps < this.cfg.steps) {
            // initial bias can be set via UI, so only change at fixed intervals here
            // normally:
            // 0 - 5%: totally random (bias = 0)
            // 5 - 75% : 95% from salient
            // 75% - 100% : 100% from salient
            if( this._steps == ~~(0.05 * this.cfg.steps) ){
                this.cfg.saliency.bias = 0.975;
                console.log("Updating saliency bias after 10% of steps ", this._steps, this.cfg.steps, this.cfg.saliency.bias);
            }
            else if( this._steps == ~~(0.75 * this.cfg.steps) ){
                this.cfg.saliency.bias = 1;
                console.log("Updating saliency bias after 90% of steps ", this._steps, this.cfg.steps, this.cfg.saliency.bias);
            }

			setTimeout(() => this._addShape(), 0);//10);
		} else {
			let time = Date.now() - this._ts;
			console.log("target distance %s", this.state.distance);
			console.log("real target distance %s", this.state.target.distance(this.state.canvas));
            console.log("finished in %s", time);
            
			console.log("Generated shapes in salient areas", window.DEBUGsalientCount, window.DEBUGrandomCount, (window.DEBUGrandomCount + window.DEBUGsalientCount),  window.DEBUGsalientCount / (window.DEBUGrandomCount + window.DEBUGsalientCount));
        
            this.onDone();
        } 
	}

	_findBestStep() {
		const LIMIT = this.cfg.shapes; // amount of shapes per-step (default: 200)

        let bestStep = null;
        
        // normally, we can generate these first shapes in parallel, they don't depend on each other
        // for debugging however, we want to watch them one by one, so we have to generate them separately
        if( !this.DEBUGGING ){

            let promises = [];

            for (let i=0;i<LIMIT;i++) {
                let shape = Shape.create(this.cfg);

                let promise = new Step(shape, this.cfg).compute(this.state).then(step => {

                    if (!bestStep || step.distance < bestStep.distance) {
                        bestStep = step;
                    }
                });
                promises.push(promise);
            }

            return Promise.all(promises).then(() => bestStep);
        }
        else{ // debugging

            let resolve = null;
            let resolver = new Promise(r => resolve = r);
        
            let generatedSteps = 0;
            let generateStep = () => {

                let shape = Shape.create(this.cfg);
                new Step(shape, this.cfg).compute(this.state).then(step => {

                    ++generatedSteps;
                    this.onDebugPhase1Step( step, this.debugState.currentReferenceTarget );
                    
                    //if( bestStep )
                    //    console.log("Phase1step : ", step.distance, bestStep.distance, Math.abs(bestStep.distance - step.distance));    

                    if (!bestStep || step.distance < bestStep.distance) {
                        bestStep = step;
                    }


                    if( generatedSteps >= LIMIT ){
                        this.onDebugPhase1Step( bestStep, this.debugState.currentReferenceTarget );
                        resolve(bestStep);
                    }
                    else
                        setTimeout(() => generateStep(), this.debugConfig.phase1Timeout);

                });
            }

            generateStep();
            return resolver;
        }
	}

	_optimizeStep(step) {
		const LIMIT = this.cfg.mutations;

		let totalAttempts = 0;
		let successAttempts = 0;
		let failedAttempts = 0;
		let resolve = null;
		let bestStep = step;
		let promise = new Promise(r => resolve = r);

		let tryMutation = () => {
			if (failedAttempts >= LIMIT) {
                console.log("mutation optimized distance from %s to %s in (%s good, %s total) attempts", arguments[0].distance, bestStep.distance, successAttempts, totalAttempts);
				return resolve(bestStep);
			}

			totalAttempts++;
			bestStep.mutate().compute(this.state).then(mutatedStep => {

                if( this.DEBUGGING )
                    this.onDebugMutationStep( mutatedStep, this.debugState.currentReferenceTarget );

				if (mutatedStep.distance < bestStep.distance) { /* success */
					successAttempts++;
					failedAttempts = 0; // we stop when we've had LIMIT failedAttempts in a row. If even 1 in there improved, we try 30 times again 
					bestStep = mutatedStep;
				} else { /* failure */
					failedAttempts++;
				}
				
                if( this.DEBUGGING )
			        setTimeout(() => tryMutation(), this.debugConfig.mutationTimeout);
                else
                    tryMutation();
			});
		}

		tryMutation();

		return promise;
	}
}
