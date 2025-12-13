import { global } from "../global.js";

const mouse = {
	x: 0,
	y: 0,
	buttons: {
		left: false,
		middle: false,
		right: false
	}
}
mouse._updatePos = function(mouseMoveEvent){
	mouse.x = mouseMoveEvent.clientX;
	mouse.y = mouseMoveEvent.clientY;
}

mouse._updateButtons = function(mouseEvent){
	const isDown = mouseEvent.type === "mousedown";
	switch(mouseEvent.button){
		case 0:
			mouse.buttons.left = isDown;
			break;
		case 1:
			mouse.buttons.middle = isDown;
			break;
		case 2:
			mouse.buttons.right = isDown;
			break;
	}
}

mouse.posRelativeToScene = function(scene){
	const canvas = scene.canvas;
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	return {
		x: (mouse.x - rect.left) * scaleX,
		y: (mouse.y - rect.top) * scaleY
	};
}

window.addEventListener("mousemove", mouse._updatePos);
window.addEventListener("mousedown", mouse._updateButtons);
window.addEventListener("mouseup", mouse._updateButtons);

export { mouse }