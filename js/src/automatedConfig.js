import {Triangle, Rectangle, Ellipse} from "./shape.js";

let config = {};
config.urls = [
    "TEMP/input/pexels/1a2b89987b488d73140e70db8360a804e3302b37abb4af0a8d0f9800749788f8.jpeg",
	"TEMP/input/pexels/0b325c07fc18ccb0163c82655b4296f5beee08c02f44dbfe8933cdd6067e66e3.jpeg",
    "TEMP/input/pexels/1d190c6cfdc339fb037e7dc7328d86b60bcef92a9ef85f557e7bea4085540cab.jpeg",
	"TEMP/input/pexels/037afc83ad7f53cbd773012aabc1504d7560efac49026af76d9094abe2b633e1.jpeg",
    "TEMP/input/pexels/18592d12083c2fd41587d7436ff44ddabb17f8c56bfcadbbe7560c00e334d745.jpeg",
	"TEMP/input/pexels/0df33752620afdb5e8dc69541e96fe785982ee50046f563191131013005ac615.jpeg",
	"TEMP/input/pexels/0cc0680128765f61512b1e9dca4805b8bbe5cf95eef79cefb1b89903ab9149d7.jpeg",
    "TEMP/input/custom/mona.jpg",

    /*
    "TEMP/input/pexels/0bcb90087c59c54796ed680e5864c0182bf42baca6884ba5bd63d5c652369f0e.jpeg",
	"TEMP/input/pexels/0f4d00fc957efe49254e9db382a42e853f5716eff3e486bf32e91720eece3ec3.jpeg",
	"TEMP/input/pexels/16e419efdf21916cf6fedf8157050346564564e771b4d23908173b9541eb1ae2.jpeg",
	"TEMP/input/pexels/02bea757f29c8f9a3c3c4dd28c48bb875edab22a62a92c6193760a2d03977eb6.jpeg",
	"TEMP/input/pexels/022f34f6c1752bf2109bd6376a7e4fca1959fa73a39493383d60ec8047aa6c03.jpeg",
	"TEMP/input/pexels/09b8d0e83c23c9ed07259cae3ad5280901512c553d20e420fecc616f5a858421.jpeg",
	"TEMP/input/pexels/13cf844e4bab344ac68ff1db590595fc4eedcb9fd33767af9eff8895fb43e4e9.jpeg", 
	"TEMP/input/pexels/0955a45917e736aa80b15a1ae43d9a00dfc35f46af8a524d79899c81579706c0.jpeg",
	"TEMP/input/pexels/06d9da3ee8c8308b0f4d899d6392bc483bbd1a76d738b6bb5940e76cc871c3b9.jpeg",
	"TEMP/input/pexels/1cdae928afd6d8276bc26bfc32c8ffb210edcb6d3b9bc6d2a8064b15a44abda1.jpeg",
	"TEMP/input/pexels/0cf2db820f1b47bdbaba15c5dcb5eab3ed1a4915588791ecd0f1c2ecdbd4353a.jpeg",
	"TEMP/input/pexels/09a0ce7c2a46b99e2edb46457462ab2365a6439d31936b6b6ab33c3966f20bc1.jpeg",
	"TEMP/input/pexels/13aa5d4eec4f3dfb02e201cd42e7e189ad12ed25847284a6e3a8d0eeb839f362.jpeg",
    "TEMP/input/pexels/1332ec3beba5f0e24bd8e0b07015a188b21290251214c2f9956af5d4289d7767.jpeg",
    */
    
    /*
    "TEMP/input/pexels/0552b3a64120c96eb8b976638650d38632ca0d8f03ed9bfbdaee5920206194d9.jpeg",
    "TEMP/input/pexels/056bb2b73b5bd92de522114fd8bcfa3dedb2f9a8706837b89f336fc8a45587e7.jpeg",
    "TEMP/input/pexels/121b1aecef583a19672d687536e7df19998c6e50aad6affb461caae5b7927547.jpeg",
    "TEMP/input/pexels/1284005d85317a4c08203cf8ae5d4606e0f0c76ffcc91ea562fa40b9c5bcad0c.jpeg",
    

    
    "TEMP/input/habigimages/4a60da1064089dbc59cdef73390ee8086d63fbb3632b1166347c0590f1e3060d.jpg",
    "TEMP/input/habigimages/5e107b7f42b79dd65978c7385a0d6d47dee5d3772d44d67b72737c0b6748fb3d.jpg",
    "TEMP/input/habigimages/37af22b80648b2d16a2c38eff8a2f52629c3eea328127a528cd4fedf5d5c2b3c.jpg",
    "TEMP/input/habigimages/39b88c5b7a022cb732c34394d4e8975eb01f6712a2741b642714444069a8c1f3.jpg",
    "TEMP/input/habigimages/0092d30642a6837980ca0f0b6218544f41fa9a6c9f1f29098f6b230184d1e94e.jpg",
    "TEMP/input/habigimages/638cb6643eb0f6681d941c5705766157dc838095897762f5dc1ebdc65a5c1377.jpg",
    

    
    "TEMP/input/custom/halloween.jpg",
    "TEMP/input/custom/abraham.jpg",
    */
    
    
];

let defaultBiasUpdater = function(config, step, totalSteps){ 
    // 0 - 10%: totally random (initialBias = 0)
    // 10 - 75% : 95% from salient
    // 75% - 100% : 100% from salient
    let saliencyConfig = config.saliency;
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

let strictBiasUpdater = function(config, step, totalSteps){ 
    let saliencyConfig = config.saliency;
    saliencyConfig.bias = 1;
}

let looseBiasUpdater = function(config, step, totalSteps){ 
    let saliencyConfig = config.saliency;
    saliencyConfig.bias = 0;
}

let strictParameterUpdater = function(config, step, totalSteps){ 
    let saliencyConfig = config.saliency;
    saliencyConfig.bias = 1;
    config.mutations = 25;
    config.shapes = 1000;
}

let complexParameterUpdater = function(config, step, totalSteps){ 
    let saliencyConfig = config.saliency;
    // 0 - 10%: totally random (initialBias = 0)
    // 10 - 75% : 95% from salient
    // 75% - 100% : 100% from salient
    if( step == 0 ){
        saliencyConfig.bias = 0;
        // high amount of mutations and shapes for best results for the background
        config.mutations = 100;
        config.shapes = 1000;
        console.log("Setting initial saliency bias ", step, totalSteps, saliencyConfig.bias);
        console.log("Setting initial mutations and shapes ", step, totalSteps, config.mutations, config.shapes);
    }
    else if( step == ~~(0.1 * totalSteps) ){ 
        saliencyConfig.bias = 0.975;
        // less mutations to prevent going outside of the saliency area too much
        config.mutations = 30;
        config.shapes = 500;
        console.log("Updating saliency bias after 10% of steps ", step, totalSteps, saliencyConfig.bias);
        console.log("Updating mutations and shapesafter 10% of steps  ", step, totalSteps, config.mutations, config.shapes);
    }
    else if( step == ~~(0.75 * totalSteps) ){
        saliencyConfig.bias = 1;
        // less mutations to prevent going outside of the saliency area too much
        config.mutations = 25;
        config.shapes = 200;
        console.log("Updating saliency bias after 75% of steps ", step, totalSteps, saliencyConfig.bias);
        console.log("Updating mutations and shapesafter 75% of steps  ", step, totalSteps, config.mutations, config.shapes);
    }
};

config.configs = [
    /*
    { 
        name: "debugDemoLoose",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 500, 
        shapes: 200,
        mutations: 30,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            drawSalientRegions: false,
            enlargeBy: 0.25,
            tweakParameters: looseBiasUpdater
        }
    },
    */
   /*
    { 
        name: "debugDemoStrict",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 500, 
        shapes: 200,
        mutations: 25,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            drawSalientRegions: true,
            //enlargeBy: 0.25,
            tweakParameters: strictBiasUpdater
        }
    }
    */
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
            drawSalientRegions: true,
            enlargeBy: 0.25,
            tweakParameters: defaultBiasUpdater
        }
    },
    /*{ 
        name: "strict500",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 500, 
        shapes: 200,
        mutations: 25,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            enlargeBy: 0.25,
            tweakParameters: strictBiasUpdater
        }
    },*/
    /*{ 
        name: "focused500",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 500, 
        shapes: 200,
        mutations: 25,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            enlargeBy: 0,
            tweakParameters: strictParameterUpdater
        }
    }*/
    /*
    { 
        name: "loose500",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 500, 
        shapes: 200,
        mutations: 25,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            enlargeBy: 0.25,
            tweakParameters: looseBiasUpdater
        }
    },
    { 
        name: "complex500",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 500, 
        shapes: 200,
        mutations: 25,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            enlargeBy: 0.25,
            tweakParameters: complexParameterUpdater
        }
    },*//*{ 
        name: "complex750",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 750, 
        shapes: 200,
        mutations: 25,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            enlargeBy: 0.25,
            tweakParameters: complexParameterUpdater
        }
    },*//*,
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
            enlargeBy: 0.25,
            tweakParameters: defaultBiasUpdater
        }
    },*/
    /*
    { 
        name: "loose100",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 100, 
        shapes: 500,
        mutations: 50,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            enlargeBy: 0.25,
            tweakParameters: looseBiasUpdater
        }
    }*//*{ 
        name: "strict100",
        description: "",
        DEBUGGING: false,
        computeSize: 256, 
        viewSize: 512, 
        steps: 100, 
        shapes: 500,
        mutations: 25,
        alpha: 0.5,
        mutateAlpha: true,
        fill:"auto",
        shapeTypes: [Triangle, Ellipse],
        saliency: {
            enlargeBy: 0,
            tweakParameters: strictBiasUpdater
        }
    },*//*
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
            enlargeBy: 0.25,
            tweakParameters: defaultBiasUpdater
        }
    }*/
]


export default config;