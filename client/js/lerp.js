import { global } from "/js/global.js"

function lerp(a, b, x, syncWithFps = false) {
	return a + x * (b - a);
}

function lerpAngle(is, to, amount, syncWithFps) {
	var normal = {
		x: Math.cos(is),
		y: Math.sin(is)
	};
	var normal2 = {
		x: Math.cos(to),
		y: Math.sin(to)
	};
	var res = {
		x: lerp(normal.x, normal2.x, amount, syncWithFps),
		y: lerp(normal.y, normal2.y, amount, syncWithFps)
	};
	return Math.atan2(res.y, res.x);
}

const bounceyLerp = (() => {
	let b1 = 4 / 11,
		b2 = 6 / 11,
		b3 = 8 / 11,
		b4 = 3 / 4,
		b5 = 9 / 11,
		b6 = 10 / 11,
		b7 = 15 / 16,
		b8 = 21 / 22,
		b9 = 63 / 64,
		b0 = 1 / b1 / b1;

	function In(t) {
		return 1 - out(1 - t);
	}

	function out(t) {
		return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
	}

	function inOut(t) {
		return ((t *= 2) <= 1 ? 1 - out(1 - t) : out(t - 1) + 1) / 2;
	}

	return {
		in: In,
		out,
		inOut
	}
})()

const expLerp = (() => {
	function tpmt(x) {
		return (Math.pow(2, -10 * x) - 0.0009765625) * 1.0009775171065494;
	}
	function In(t) {
		return tpmt(1 - +t);
	}

	function out(t) {
		return 1 - tpmt(t);
	}

	function inOut(t) {
		return ((t *= 2) <= 1 ? tpmt(1 - t) : 2 - tpmt(t - 1)) / 2;
	}

	return {
		in: In,
		out,
		inOut
	}
})()

const quadLerp = (() => {
	function In(t) {
		return t * t;
	}

	function out(t) {
		return t * (2 - t);
	}

	function inOut(t) {
		return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
	}
	return {
		in: In,
		out,
		inOut
	}
})()

export { lerp, lerpAngle, expLerp, quadLerp, bounceyLerp }