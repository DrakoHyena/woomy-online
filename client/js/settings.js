const SAVE_VER = 0;
const defaultProfile = ""; // hidden, used to reset
let currentProfile = "";

class Setting{
	constructor(category, uniqueLabel, type){
		this.label = uniqueLabel;
		this.id = `v${SAVE_VER}-${category}-${uniqueLabel}`;
		this.type = type;
	}
}
