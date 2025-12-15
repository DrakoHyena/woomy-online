import { drawLoop } from "../drawLoop.js";
import { Scene } from "../scene.js";

const settings = new Scene(document.getElementById("settingsCanvas"));
drawLoop.scenes.set("settings", settings);
settings.drawingDisabled = true;

settings.drawFuncts.set("clear", ({ canvas, ctx }) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
});
