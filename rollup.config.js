import includePaths from "rollup-plugin-includepaths";
//import resolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
//import alias from 'rollup-plugin-alias';
//import path from "path";

export default {
    input: "js/src/app.js",
    output: {
        file: "js/app.js",
        format : "iife"
    },
    plugins: [ 
        /*
        alias({
            jszip: path.join(__dirname, './node_modules/jszip/dist/jszip.min.js')
        }),
        resolve({

            // the fields to scan in a package.json to determine the entry point
            // if this list contains "browser", overrides specified in "pkg.browser"
            // will be used
            mainFields: ['module', 'main'], // Default: ['module', 'main']),
        }),
        commonjs({
            include: [
                './node_modules/jszip/**'
            ]
        }),*/
        includePaths()
    ]
};
