/* State: target canvas, current canvas and a distance value */
export default class State {
	constructor(target, canvas, distance = Infinity) {
		this.target = target; // the originalCanvas
		this.canvas = canvas; // the targetCanvas (used for SSIM calculations)
		this.distance = (distance == Infinity ? target.distance(canvas) : distance); // SSIM similarity metric 
	}
}
