import { global } from "../global.js";
import { currentSettings } from "../settings.js";

let canvas = undefined;
let ctx = undefined;
let lastScalar = 0;
let lastColor = "";
let lastStrength = 0;
let lastW = 0;
let lastH = 0;
function drawVignette(scalar=.85, fillStyle){
	if(canvas && !ctx){
		ctx = canvas.getContext("2d");
		return
	}else if(!canvas){
		canvas = global?._canvas?.vignetteCanvas;
		return;
	}else if(!ctx){
		return
	}
	
	let color = global.vignetteColorSocket||fillStyle||global._tankMenuColor||"#000000FF";
	scalar = global.vignetteScalarSocket??scalar
	const w = canvas.width;
	const h = canvas.height;
	if(color === lastColor && scalar === lastScalar && currentSettings.vignetteStrength.value.number === lastStrength && lastW === w && lastH === h) return;
	lastColor = color;
	lastScalar = scalar;
	lastStrength = currentSettings.vignetteStrength.value.number;
	lastW = w;
	lastH = h;
	console.log("Redrawing vignette")

	ctx.clearRect(0, 0, w, h);
	if (!scalar || scalar <= 0) return;

	const cx = w / 2;
	const cy = h / 2;
	const max = Math.sqrt(cx * cx + cy * cy);
	const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, max);

	grad.addColorStop(0, "#00000000");
	grad.addColorStop(scalar, "#00000000");
	grad.addColorStop(1, color);

	ctx.fillStyle = grad;
	ctx.globalAlpha = .25*(currentSettings.vignetteStrength.value.number??1)
	ctx.fillRect(0, 0, w, h);
}

export { drawVignette }