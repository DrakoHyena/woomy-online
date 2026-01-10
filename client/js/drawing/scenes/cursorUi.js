import { drawLoop } from "../drawLoop.js";
import { Scene } from "../scene.js";
import { mouse } from "../../controls/mouse.js";
import { lerp } from "../../lerp.js";

const cursorUi = new Scene(document.getElementById("cursorUiCanvas"));
drawLoop.scenes.set("cursorUi", cursorUi);

const state = {
	textbox: {
		active: false,
		fade: 0,
		width: 1,
		height: 1,
		title: "Title Text",
		description: "Description Text"
	}
}

cursorUi.utilityFuncts.set("fade", ({ canvas, ctx, delta }) => {
	if(state.textbox.active === false){
		state.textbox.fade = lerp(state.textbox.fade, 0, 0.02*delta)
		if(state.textbox.fade < 0.001){
			cursorUi.drawFuncts.delete("textbox");
		}
	}else{
		state.textbox.fade = lerp(state.textbox.fade, 1, 0.02*delta)
		cursorUi.drawFuncts.set("textbox", textbox)
	}
})

cursorUi.drawFuncts.set("clear", ({ canvas, ctx }) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function textbox({ canvas, ctx, delta}) {
	ctx.globalAlpha = 1 * state.textbox.fade;
	state.textbox.width = canvas.width/3;
	state.textbox.height = canvas.height/4;
	let x = mouse.x;
	let y = mouse.y;
	ctx.fillRect(x, y, state.textbox.width, state.textbox.height)
	let text = renderText(state.textbox.title, 24)
	ctx.drawImage(text, x, y);
	y += text.height;
	text = renderText(state.textbox.description, 12);
	ctx.drawImage(text, x, y);
}

function showTextBox(title, description){
	if(title !== undefined) state.textbox.title = title;
	if(description !== undefined) state.textbox.description = description;
	state.textbox.active = true;
}
function hideTextBox(){
	state.textbox.active = false;
}
function toggleTextBox(title, description){
	if(state.textbox.active === true){
		hideTextBox()
	}else{
		showTextBox(title, description)
	}
}

export { state as cursorUiState, showTextBox, hideTextBox, toggleTextBox}