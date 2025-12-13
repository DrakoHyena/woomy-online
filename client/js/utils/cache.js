import { global } from "../global.js";

class CanvasCache{
	constructor(label, lifetime){
		this.label = label||"";
		this.map = new Map();
		this.lifetime = lifetime||1000;
		this._clean()
	}
	_clean(){
		if(global.debug === true){
			console.log(`[CANVASCACHE] Cleaning "${this.label}" (${this.lifetime}ms)`)
		}
		for(let [k,v] of this.map){
			if(Date.now()-v.lastTouch>this.lifetime){
				this.map.delete(k);
			}
		}
		setTimeout(this._clean.bind(this), this.lifetime)
	}
	_genKey(iterable){
		let key = "";
		for(let value of iterable){
			key += value + "-";
		}
		return key;
	}
	get(){
		const key = this._genKey(arguments);
		let val = this.map.get(key);
		if(!val){
			return false
		}
		val.lastTouch = Date.now();
		return val;
	}
	new(){
		const key = this._genKey(arguments)
		const canvas = new OffscreenCanvas(0,0);
		canvas.ctx = canvas.getContext("2d");
		canvas.lastTouch = Date.now();
		this.map.set(key, canvas);
		return canvas;
	}
}

export { CanvasCache }