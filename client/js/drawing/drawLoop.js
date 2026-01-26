import { global } from "../global.js";

const drawLoop = {
	scenes: new Map(),
	_active: true,
	_lastFrameTime: null,
	fps: 75,
}
drawLoop.start = function(){
	drawLoop._active = true;
	drawLoop._lastFrameTime = null;
 	requestAnimationFrame(drawLoop.drawScenes);
}
drawLoop.stop = function(){
	drawLoop._active = false;
}

drawLoop.drawScenes = function(timestamp){
 	const now = (typeof timestamp === 'number') ? timestamp : performance.now();

 	if(drawLoop._active !== true){
 		if(global.debug === true) console.log('[DRAWLOOP] Not active');
 		return;
 	}

 	for(const [sceneLabel, scene] of drawLoop.scenes){
 		if(scene.active !== true){
 			if(global.debug === true) console.log(`[DRAWLOOP] Scene ${sceneLabel} Not active`);
 			continue;
 		}
 		if(global.debug === true) console.log(`[DRAWLOOP] Drawing scene ${sceneLabel}...`);
 		scene.draw();
 	}

 	if(drawLoop._lastFrameTime !== null){
 		const delta = now - drawLoop._lastFrameTime;
 		if(delta > 0) drawLoop.fps = Math.round(1000 / delta);
 	}

 	drawLoop._lastFrameTime = now;
 	requestAnimationFrame(drawLoop.drawScenes);
}
drawLoop.updateSceneSizes = function(){
	for(let [sceneLabel, scene] of drawLoop.scenes){
		if(global.debug === true) console.log(`[DRAWLOOP] Resizing scene ${sceneLabel}...`)
		scene.resize()
	}
}
window.addEventListener("resize", drawLoop.updateSceneSizes)

export { drawLoop } 