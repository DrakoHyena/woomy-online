import { global } from "../global.js";

const drawLoop = {
	scenes: new Map(),
	_active: true,
}
drawLoop.start = function(){
	drawLoop._active = true;
	drawLoop.drawScenes()
}
drawLoop.stop = function(){
	drawLoop._active = false;
}
drawLoop.drawScenes = function(){
	if(drawLoop._active !== true){
		if(global.debug === true){
			console.log(`[DRAWLOOP] Not active`)
		}
		return;
	}
	requestAnimationFrame(drawLoop.drawScenes)
	for(let [sceneLabel, scene] of drawLoop.scenes){
		if(scene.active !== true){
			if(global.debug === true) console.log(`[DRAWLOOP] Scene ${sceneLabel} Not active`)
			continue;
		}
		if(global.debug === true) console.log(`[DRAWLOOP] Drawing scene ${sceneLabel}...`)
		scene.draw()
	}
}
drawLoop.updateSceneSizes = function(){
	for(let [sceneLabel, scene] of drawLoop.scenes){
		if(global.debug === true) console.log(`[DRAWLOOP] Resizing scene ${sceneLabel}...`)
		scene.resize()
	}
}
window.addEventListener("resize", drawLoop.updateSceneSizes)

export { drawLoop } 