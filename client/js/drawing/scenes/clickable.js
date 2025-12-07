import { mouse } from "../../controls/mouse.js";

function clickableActive(scene, x1, y1, x2, y2){
	const pos = mouse.posRelativeToScene(scene);
	if(pos.x >= x1 && pos.x <= x2 && pos.y >= y1 && pos.y <= y2){
		return mouse.buttons
	}
	return false;
}

export { clickableActive }