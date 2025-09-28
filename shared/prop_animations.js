class PropAnimation{
	constructor(prop, index){
		if(typeof index !== "number") throw new Error("You must define a valid index for PropAnimations") 
		this.index = index
		this.size = prop.size
		this.x = prop.x
		this.y = prop.y
		this.angle = prop.angle
		this.layer = prop.layer
		this.shape = prop.shape
		this.color = prop.color
		this.active = false;
		this.lastUpdate = 0;
		for(let val of this.toArray()){
			if(val === undefined) throw new Error("Props must have all PropAnimation properties to be animated")
		}
	}
	toArray(){
		return [this.index, this.size, this.x, this.y, this.angle, this.layer, Array.isArray(this.shape)?JSON.stringify(this.shape):this.shape, this.color]
	}
}

export { PropAnimation }