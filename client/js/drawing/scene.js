import { global } from "../global.js";

class Scene{
	constructor(canvas){
		if(canvas instanceof HTMLCanvasElement === false){
			throw new Error("Scenes require a canvas element. Got: ", canvas);
		}
		this.active = true;
		this.drawingDisabled = false;
		this.canvas = canvas;
		this.maxFps = 75;
		this.utilityFuncts = new Map();
		this.resizeFuncts = new Map();
		this.drawFuncts = new Map();
		this._ctx = this.canvas.getContext("2d");
		this._ctx.imageSmoothingEnabled = false;
		this._lastDraw = 0;
		this.resize();
	}
	resize(){
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.draw(true);
		for(let [resizeFunctLabel, resizeFunct] of this.resizeFuncts){
			if(global.debug === true){
				console.log(`[SCENE] Resizing ${resizeFunctLabel}...`)
			}
			resizeFunct({canvas: this.canvas, ctx: this._ctx})
		}
	}
	draw(ignoreFps = false){
		const drawTime = performance.now();
		const delta = Math.min(1, Math.max(0.05, ((drawTime - this._lastDraw)) / (1000 / this.maxFps)));
		for(let [utilityFunctLabel, utilityFunct] of this.utilityFuncts){
			if(global.debug === true){
				console.log(`[SCENE] Utilizing ${utilityFunctLabel}...`)
			}
			utilityFunct({canvas: this.canvas, ctx: this._ctx, delta: delta});
		}
		if(ignoreFps === true || delta >= 1){
			this._lastDraw = drawTime;
			if(this.drawingDisabled === true){
				if(global.debug === true){
					console.log(`[SCENE] Drawing disabled`)
				}
				return;
			}
			for(let [drawFunctLabel, drawFunct] of this.drawFuncts){
				if(global.debug === true){
					console.log(`[SCENE] Drawing ${drawFunctLabel} (${delta} delta)...`)
				}
				drawFunct({canvas: this.canvas, ctx: this._ctx, delta: delta})
			}
		}
	}
}

export { Scene }