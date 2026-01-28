import { drawLoop } from "../drawLoop.js";
import { Scene } from "../scene.js";
import { clickableActive } from "./clickable.js";
import { lerp } from "../../lerp.js";
import { playerState } from "../../state/player.js";

const state = {
	pannelSize: 1,
}

const buttons = [

]
function newButton(clickFunct, color, strokeColor){
	return {
		clickFunct: clickFunct,
		color: color,
		strokeColor: strokeColor,
		hoverMult: 1,
		lastClick: Date.now()
	}
}

const upgrades = new Scene(document.getElementById("upgradesCanvas"));
drawLoop.scenes.set("upgrades", upgrades);

upgrades.drawFuncts.set("clear", ({ canvas, ctx }) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function draw({canvas, ctx, delta}){
	console.log(playerState.gui.upgrades)
}
upgrades.drawFuncts.set("drawUpgradeTiles", draw)

function openTLButtonMenu(){}

function closeTLButtonMenu(){}

export {}