# primitive.js with support for saliency-driven generation

This is a fork of the original [Primitive.js project](https://ondras.github.io/primitive.js/).
That is in turn a port to JavaScript of the original [primitive.lol](http://primitive.lol/) application.

Our custom version adds support for saliency-driven generation of the SVG output (as opposed to fully random generation).
This is a very early version of the software, mainly to support an early report on this work.

For more details and example input images, see [https://placeholders.edm.uhasselt.be](https://placeholders.edm.uhasselt.be).

## Building

Written in client-side JavaScript, uses Rollup for JS bundling and LESS for CSS pre-processing.

  1. `git clone git@github.com:rmarx/primitive.js.git && cd primitive.js`
  2. `npm install`
  3. `npm start`
  4. either: open the index.html directly (if you host/upload the images somewhere else yourself)
  5. or: do `python -m SimpleHTTPServer 8080` (in the directory containing index.html) and go to http://localhost:8080

## License

[MIT](license.txt)