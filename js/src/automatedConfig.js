import {Triangle, Rectangle, Ellipse} from "./shape.js";

let config = {};
config.urls = [
	"TEMP/input/pexels/0cc0680128765f61512b1e9dca4805b8bbe5cf95eef79cefb1b89903ab9149d7.jpeg",
	"TEMP/input/pexels/0b325c07fc18ccb0163c82655b4296f5beee08c02f44dbfe8933cdd6067e66e3.jpeg",
    "TEMP/input/pexels/0bcb90087c59c54796ed680e5864c0182bf42baca6884ba5bd63d5c652369f0e.jpeg",
    "TEMP/input/pexels/1a2b89987b488d73140e70db8360a804e3302b37abb4af0a8d0f9800749788f8.jpeg",
	"TEMP/input/pexels/0f4d00fc957efe49254e9db382a42e853f5716eff3e486bf32e91720eece3ec3.jpeg",
	"TEMP/input/pexels/16e419efdf21916cf6fedf8157050346564564e771b4d23908173b9541eb1ae2.jpeg",
	"TEMP/input/pexels/02bea757f29c8f9a3c3c4dd28c48bb875edab22a62a92c6193760a2d03977eb6.jpeg",
	"TEMP/input/pexels/037afc83ad7f53cbd773012aabc1504d7560efac49026af76d9094abe2b633e1.jpeg",
	"TEMP/input/pexels/022f34f6c1752bf2109bd6376a7e4fca1959fa73a39493383d60ec8047aa6c03.jpeg",
	"TEMP/input/pexels/0df33752620afdb5e8dc69541e96fe785982ee50046f563191131013005ac615.jpeg",
	"TEMP/input/pexels/09b8d0e83c23c9ed07259cae3ad5280901512c553d20e420fecc616f5a858421.jpeg",
	"TEMP/input/pexels/13cf844e4bab344ac68ff1db590595fc4eedcb9fd33767af9eff8895fb43e4e9.jpeg",
	"TEMP/input/pexels/0955a45917e736aa80b15a1ae43d9a00dfc35f46af8a524d79899c81579706c0.jpeg",
	"TEMP/input/pexels/06d9da3ee8c8308b0f4d899d6392bc483bbd1a76d738b6bb5940e76cc871c3b9.jpeg",
	"TEMP/input/pexels/1cdae928afd6d8276bc26bfc32c8ffb210edcb6d3b9bc6d2a8064b15a44abda1.jpeg",
	"TEMP/input/pexels/0cf2db820f1b47bdbaba15c5dcb5eab3ed1a4915588791ecd0f1c2ecdbd4353a.jpeg",
	"TEMP/input/pexels/09a0ce7c2a46b99e2edb46457462ab2365a6439d31936b6b6ab33c3966f20bc1.jpeg",
	"TEMP/input/pexels/13aa5d4eec4f3dfb02e201cd42e7e189ad12ed25847284a6e3a8d0eeb839f362.jpeg",
	"TEMP/input/pexels/1332ec3beba5f0e24bd8e0b07015a188b21290251214c2f9956af5d4289d7767.jpeg",
	"TEMP/input/pexels/0bcb90087c59c54796ed680e5864c0182bf42baca6884ba5bd63d5c652369f0e.jpeg"
];

let defaultBiasUpdater = function(saliencyConfig, step, totalSteps){ 
    // 0 - 10%: totally random (initialBias = 0)
    // 10 - 75% : 95% from salient
    // 75% - 100% : 100% from salient
    if( step == 0 ){
        saliencyConfig.bias = 0;
        console.log("Setting initial saliency bias ", step, totalSteps, saliencyConfig.bias);
    }
    else if( step == ~~(0.1 * totalSteps) ){ 
        saliencyConfig.bias = 0.975;
        console.log("Updating saliency bias after 10% of steps ", step, totalSteps, saliencyConfig.bias);
    }
    else if( step == ~~(0.75 * totalSteps) ){
        saliencyConfig.bias = 1;
        console.log("Updating saliency bias after 90% of steps ", step, totalSteps, saliencyConfig.bias);
    }
};

let strictBiasUpdater = function(saliencyConfig, step, totalSteps){ 
    saliencyConfig.bias = 1;
}


config.configs = [
    { 
        name: "fast500",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 500, 
        shapes: 500,
        mutations: 50,
        //shapes: 1000, 
        //mutations: 100,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            initialBias: 0,
            updateBias: strictBiasUpdater//defaultBiasUpdater
        }
    }/*,
    { 
        name: "medium100",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 100, 
        shapes: 500,
        mutations: 50,
        //shapes: 1000, 
        //mutations: 100,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            initialBias: 0,
            updateBias: defaultBiasUpdater
        }
    },
    { 
        name: "fast50",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 50, 
        shapes: 200,
        mutations: 30,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            initialBias: 0,
            updateBias: defaultBiasUpdater
        }
    }*/
]


export default config;