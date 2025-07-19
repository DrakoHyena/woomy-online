import { ctx, drawBar, drawGUIPolygon, drawGuiCircle, drawGuiLine, drawGuiRect, drawGuiRoundRect, drawText, measureText, _clearScreen } from "./canvas.js"
import { mockups } from "../mockups.js";
import {
	color,
	setColor,
	themes,
	specialColors,
	mixColors,
	getColor,
	getColorDark,
	getZoneColor,
	setColors,
	setColorsUnmix,
	setColorsUnmixB,
	hslToColor
} from "../colors.js"
import { util } from "../util.js";
import { config } from "../config.js";
import { global } from "../global.js";

function drawHealth(x, y, instance, ratio, alpha) {
	let fade = instance.render.status.getFade(instance.size);
	ctx.globalAlpha = 1 * fade;
	let size = instance.render.size * ratio,
		m = mockups.get(instance.index),
		realSize = size / m.size * m.realSize;
	let health = instance.render.health.get(),
		shield = instance.render.shield.get();
	if (health < 1 || shield < 1) {
		let yy = y + 1.1 * realSize + 22;
		ctx.globalAlpha = alpha*fade*(health === 0?0:1);
		size *= 1.1;
		let mixc = config.coloredHealthBars ? mixColors(getColor(instance.color), color.guiwhite, .5) : config.tintedHealth ? mixColors(color.lgreen, color.red, 1 - health) : color.lgreen;
		if (config.shieldbars) {
			drawBar(x - size, x + size, yy, 6 + config.barChunk, color.black);
			if (shield) {
				if (health > 0.01) drawBar(x - size, x - size + 2 * size * health, yy + 1.5, 3, mixc);
				ctx.globalAlpha *= 0.7;
				if (shield > 0.01) drawBar(x - size, x - size + 2 * size * shield, yy - 1.5, 3, config.coloredHealthBars ? mixColors(getColor(instance.color), color.dgrey, .8) : color.dgrey);
			} else {
				if (health > 0.01) drawBar(x - size, x - size + 2 * size * health, yy, 4, mixc);
			}
		} else {
			drawBar(x - size, x + size, yy, 3 + config.barChunk, color.black);
			if (health > 0.01) drawBar(x - size, x - size + 2 * size * health, yy, 3, mixc);
			if (shield) {
				ctx.globalAlpha *= 0.7;
				if (shield > 0.01) drawBar(x - size, x - size + 2 * size * shield, yy, 3, config.coloredHealthBars ? mixColors(getColor(instance.color), color.dgrey, .8) : color.dgrey);
				ctx.globalAlpha = 1;
			}
		}
	}

	if (instance.nameplate) {
		let fill = instance.nameColor;
		let nameRatio = ((ratio * instance.size) / 20)*fade;
		let imageRatio = 1;
		let stroke = undefined;
		let font = undefined;
		ctx.globalAlpha = alpha * fade;
		drawText(instance.score > 0 ? util._handleLargeNumber(instance.score) : "", x, y - realSize - 16 * nameRatio, 8 * nameRatio, "#E4EBE7", "center", false, 1, stroke, ctx, font);
		switch (fill.charAt(0)) {
			case "!":
				let data = util._getSpecialNameInfoById(Number(instance.nameColor.substring(1)));
				fill = data[0];
				stroke = data[1];
				font = data[2];
				imageRatio = data[3];
				break;
		}

		drawText(instance.name, x, y - realSize - 30 * nameRatio, 16 * nameRatio, fill, "center", false, 1, stroke, ctx, font);
		ctx.globalAlpha = 1;
	}

	// draw chat messages
	let messages = global.chatMessages.get(instance.id)
	const msgFadeTime = config.chatMessageDuration*1000*.025
	if (messages) {
		let nameRatio = ((ratio * instance.size) / 20)*fade;
		let nameplateOffset = y - 6 - (instance.nameplate&&instance.name!==""?30 * nameRatio:0)
		let stroke = undefined;
		let font = undefined;
		ctx.globalAlpha = alpha;
		let offset = 1;
		let padding = 5
		let size = 20
		let height = size * nameRatio;
		let vspacing = padding + 3
		for (let i = 0; i < 3; i++ ) {
			if(i === messages.length) return;
			const msg = messages[messages.length-i-1]
			offset++
			const color = getColor(instance.color);
			const len = measureText(msg[0], (size * nameRatio) - padding);

			let msgFade = Date.now()-msg[1]
			if(msgFade < msgFadeTime){
				msgFade /= msgFadeTime
			}else if((config.chatMessageDuration*1000)-msgFade < msgFadeTime ){
				msgFade = ((config.chatMessageDuration*1000)-msgFade)/msgFadeTime
			}else{
				msgFade = 1
			}
			ctx.globalAlpha = 0.5*msgFade;
			let fill = color === "rainbow"
				? hslToColor((Date.now() % 2520) / 7, 100, 50)
				: color;
			let barY = ((-height - vspacing) * offset + nameplateOffset + vspacing)
			drawBar(x - len / 2, x + len / 2, barY, height, fill);
			ctx.globalAlpha = .15*msgFade
			drawBar(x - len / 2, x + len / 2, barY, height, "#000000");
			ctx.globalAlpha = 1*msgFade


			ctx.fillStyle = "#000000";
			drawText(msg[0], x, barY + ((height - padding) * 0.35), (size * nameRatio) - padding, "#E4EBE7", "center", false, 1, stroke, ctx, font);

			ctx.globalAlpha = 1;
		}
	}
}

export { drawHealth }