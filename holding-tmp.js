// Shader presets lookup table
const SHADER_PRESETS = {
	"Disabled": { blur: 0, color: "rgba(0,0,0,0)", offsetX: 0, offsetY: 0, relativeColor: false },
	"Light Blur": { blur: 14, color: "#ebf5f0", offsetX: 0, offsetY: 0, relativeColor: false },
	"Dark Blur": { blur: 14, color: "#101211", offsetX: 0, offsetY: 0, relativeColor: false },
	"Colorful Blur": { blur: 18, color: null, offsetX: 0, offsetY: 0, relativeColor: true },
	"Light": { blur: 0, color: "#ebf5f0", offsetX: 8, offsetY: 8, relativeColor: false },
	"Dark": { blur: 0, color: "#101211", offsetX: 8, offsetY: 8, relativeColor: false },
	"Light Stroke": { blur: 0, color: "#ebf5f0", offsetX: 8, offsetY: 8, relativeColor: false },
	"Dark Stroke": { blur: 0, color: "#101211", offsetX: 8, offsetY: 8, relativeColor: false },
	"Colorful Dense": { blur: 10, color: null, offsetX: 0, offsetY: 0, relativeColor: true },
	"Dynamic Fake 3D": { blur: 0, color: null, offsetX: "dynamic", offsetY: "dynamic", relativeColor: true },
	"Fake 3D": { blur: 0, color: null, offsetX: 4, offsetY: 4, relativeColor: true },
};

function applyShaderSettings(context, shaderName, x, y) {
	const preset = SHADER_PRESETS[shaderName];
	if (!preset) return false;

	context.shadowBlur = preset.blur;
	context.shadowOffsetX = preset.offsetX === "dynamic" ? Math.max(-4, Math.min(4, x * 0.012)) : preset.offsetX;
	context.shadowOffsetY = preset.offsetY === "dynamic" ? Math.max(-4, Math.min(4, y * 0.012)) : preset.offsetY;
	if (preset.color) context.shadowColor = preset.color;

	return preset.relativeColor;
}



function renderLeash(context, instance, tankDrawX, tankDrawY, drawSize, fade, ratio) {
	const leash = instance.leash;
	if (!leash) return;

	const fadeValue = leash.fadeOverride !== 1 ? leash.fadeOverride : fade;
	const renderedAnchorX = instance.render?.x ?? instance.x;
	const renderedAnchorY = instance.render?.y ?? instance.y;

	context.save();
	context.strokeStyle = "black";
	context.lineWidth = drawSize * 0.45 * fadeValue;
	context.globalAlpha = 0.25 * fadeValue;

	// Update leash physics
	for (let i = 0; i < leash.points.length; i++) {
		const lastPoint = leash.points[i - 1];
		const currentPoint = leash.points[i];
		const nextPoint = leash.points[i + 1];

		if (lastPoint) {
			currentPoint.vel.x += (lastPoint.pos.x - currentPoint.pos.x) * 0.5;
			currentPoint.vel.y += (lastPoint.pos.y - currentPoint.pos.y) * 0.5;
		}
		if (nextPoint) {
			currentPoint.vel.x += (nextPoint.pos.x - currentPoint.pos.x) * 0.5;
			currentPoint.vel.y += (nextPoint.pos.y - currentPoint.pos.y) * 0.5;
		}
		if (i === 0) {
			currentPoint.vel.x = (renderedAnchorX - currentPoint.pos.x) * 0.75;
			currentPoint.vel.y = (renderedAnchorY - currentPoint.pos.y) * 0.75;
		}
		if (i === leash.points.length - 1) {
			currentPoint.vel.x += (leash.x - currentPoint.pos.x) * 0.75;
			currentPoint.vel.y += (leash.y - currentPoint.pos.y) * 0.75;
		}
	}

	// Draw leash
	context.beginPath();
	context.moveTo(tankDrawX, tankDrawY);
	for (let i = 0; i < leash.points.length; i++) {
		const canvasX = tankDrawX + ratio * (leash.points[i].pos.x - renderedAnchorX);
		const canvasY = tankDrawY + ratio * (leash.points[i].pos.y - renderedAnchorY);
		context.lineTo(canvasX, canvasY);
		context.moveTo(canvasX, canvasY);
		leash.points[i].tick();
	}
	context.closePath();
	context.stroke();
	context.restore();
}


/**
 * Core rendering logic - renders entity to the provided context.
 */

