function lerp(a, b, x, syncWithFps = false) {
	if (syncWithFps) {
		if (global._fps < 20) global._fps = 20;
		x /= global._fps / 120;
	}
	return a + x * (b - a);
}

const mixColorsCache = new Map()
function mixColors(primary, secondary, amount) {
	const key = `${primary}${secondary}${amount}`;
	const saved = mixColorsCache.get(key)
	if (saved !== undefined) return saved;
	const pr = parseInt(primary.slice(1), 16);
	const sr = parseInt(secondary.slice(1), 16);
	const hex = `#${(
		1 << 24
		| Math.floor(lerp((pr >> 16) & 255, (sr >> 16) & 255, amount)) << 16
		| Math.floor(lerp((pr >> 8) & 255, (sr >> 8) & 255, amount)) << 8
		| Math.floor(lerp(pr & 255, sr & 255, amount))
	).toString(16).slice(1)}`;
	mixColorsCache.set(key, hex);
	return hex;
}

export {mixColors}