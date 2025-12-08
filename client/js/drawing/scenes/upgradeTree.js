import { global } from "../../global.js";
import { getEntityImageFromMockup } from "../../mockups.js";
import { lerp } from "../../lerp.js";
import { drawLoop } from "../drawLoop.js";
import { Scene } from "../scene.js";
import { player } from "../../player.js";
import { mouse } from "../../controls/mouse.js";
import { keyboard } from "../../controls/keyboard.js";
import { drawEntity } from "../drawEntity.js";
import { clickableActive } from "./clickable.js";
import { drawText } from "../canvas.js";
import { socket } from "../../socket.js";

const upgradeTree = new Scene(document.getElementById("upgradeTreeCanvas"))
drawLoop.scenes.set("upgradeTree", upgradeTree)
upgradeTree.maxFps = 75;
upgradeTree.drawingDisabled = true;

// CLEARING
upgradeTree.drawFuncts.set("clear", ({canvas, ctx})=>{ctx.clearRect(0,0,canvas.width,canvas.height)})

// FADE
let fade = 0;
let fadeGoal = 0;
const fadeDebounce = 200;
let lastFadePress = performance.now();
function calcFade({ctx, canvas}){
	if((performance.now()-lastFadePress) > fadeDebounce && keyboard.keys["m"] === true && player.upgrades.length !== 0){
		lastFadePress = performance.now();
		if(fadeGoal === 0){
			fadeGoal = 1;
			upgradeTree.drawingDisabled = false;
		} else {
			fadeGoal = 0;
		}
	}
	fade = lerp(fade, fadeGoal, .3)
	if(fade < .001 && fadeGoal === 0){
		fade = 0;
		upgradeTree.drawingDisabled = true;
	}
}
upgradeTree.utilityFuncts.set("fade", calcFade)

// BACKGROUND RENDERING
let gradient = undefined;
function recreateBackground({canvas, ctx}){
	gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2);
	gradient.addColorStop(0, "rgba(255,255,255,.6)");
	gradient.addColorStop(.35, "rgba(255,255,255,.4)");
	gradient.addColorStop(1, "rgba(0,0,0,.4)")
}
upgradeTree.resizeFuncts.set("gradient", recreateBackground)

function drawBackground({canvas, ctx, delta}){
	if(gradient === undefined) recreateBackground({canvas: canvas, ctx: ctx});
	ctx.globalAlpha = fade;
	ctx.fillStyle = gradient;
	ctx.fillRect(0,0,canvas.width,canvas.height);
}
upgradeTree.drawFuncts.set("gradient", drawBackground)

// NODE RENDERING

let mainNode = undefined;
class UpgradeTreeNode{
	constructor(mockup, upgradeIndex){
		this.mockup = mockup.upgrades[upgradeIndex]?.index || mockup.upgrades[upgradeIndex];
		this.upgradeIndex = upgradeIndex;
		this.sizeMulti = .001;
		this.alphaMulti = .001;
		this.childrenNodes = [];
		this.upgradeNodes = [];
	}
}

let clickDebounce = performance.now();
const clickCooldown = 200;
const renderDistance = 2;
function renderNode(drawArgs, node, skipChildren, angleOffset, _angle = 0, _tier = 0, _index = 0){
	const angle = angleOffset + _angle * _index;
	let isHovered = false;

	if(_tier !== 0 || skipChildren === true){
		const {canvas, ctx, delta} = drawArgs;
		ctx.save();
		const nodeSize = 90;
		let size = (nodeSize / (1 + (_tier * .5))) * fade;
		let hsize = size / 2;
		const tierDistance = ((canvas.height / 3) / renderDistance);
		const distance = (tierDistance * _tier) * fade;
		let x = canvas.width / 2 - hsize + distance * Math.cos(angle);
		let y = canvas.height / 2 - hsize + distance * Math.sin(angle);
		
		if(_tier <= 1){
			const clickState = clickableActive(upgradeTree, x, y, x + size, y + size);
			if(clickState){
				isHovered = true;
				node.sizeMulti = lerp(node.sizeMulti, 1.25, 0.2);
				node.alphaMulti = lerp(node.alphaMulti, 1, 0.2);
				if(performance.now()-clickDebounce > clickCooldown && clickState.left){
					clickDebounce = performance.now()
					socket.talk("U", node.upgradeIndex)
				}
			} else {
				node.sizeMulti = lerp(node.sizeMulti, 1, 0.2);
				node.alphaMulti = lerp(node.alphaMulti, 0.75, 0.2);
			}
		} else {
			node.sizeMulti = lerp(node.sizeMulti, 1, 0.2);
			node.alphaMulti = lerp(node.alphaMulti, .25+.75/(_tier), 0.2);
		}

		size *= node.sizeMulti;
		hsize = size / 2;
		x = canvas.width / 2 - hsize + distance * Math.cos(angle);
		y = canvas.height / 2 - hsize + distance * Math.sin(angle);
		
		const image = getEntityImageFromMockup(node.mockup, global._tankMenuColor);
		const alpha = fade * node.alphaMulti;
		drawEntity(x + hsize, y + hsize, image, 1, alpha, 1, -Math.PI / 4, true, ctx, undefined, undefined, size);
		
		if(_tier > 0 && image.upgrades.length !== node.childrenNodes.length && _tier < renderDistance){
			for(let i = 0; i < image.upgrades.length; i++){
				const newNode = new UpgradeTreeNode(image, i);
				node.childrenNodes.push(newNode)
			}
		}

		if(skipChildren === true){
			drawText(image.name, x + hsize, y - hsize / 2, hsize, "white", "center", true, alpha, false, ctx);
		} else {
			let uprightAngle = angle;
			let textAlign = "left";
			let normAngle = angle % (Math.PI * 2);
			if (normAngle < 0) normAngle += Math.PI * 2;

			if(normAngle > Math.PI / 2 && normAngle < 3 * Math.PI / 2){
				uprightAngle = angle - Math.PI;
				textAlign = "right";
			}
			ctx.save();
			ctx.translate(x + hsize + hsize * Math.cos(angle), y + hsize + hsize * Math.sin(angle));
			ctx.rotate(uprightAngle);
			drawText(image.name, 0, 0, hsize/(_tier+1), "white", textAlign, true, alpha, false, ctx);
			ctx.restore();
		}
		
		ctx.restore();
	}
	
	// Recursively render child nodes
	if(skipChildren === true) return;
	if(_tier >= renderDistance) return;

	if (_tier === 0) {
		const image = getEntityImageFromMockup(node.mockup, global._tankMenuColor);
		if (image.upgrades.length !== node.upgradeNodes.length) {
			for(let i = 0; i < image.upgrades.length; i++){
				const newNode = new UpgradeTreeNode(image, i);
				node.upgradeNodes.push(newNode)
			}
		}

		const {canvas} = drawArgs;
		const nodeSize = 90;
		let size = (nodeSize / (1 + (_tier * .5))) * fade;
		let hsize = size / 2;
		let x = canvas.width / 2 - hsize;
		let y = canvas.height / 2 - hsize;
		const clickState = clickableActive(upgradeTree, x, y, x + size, y + size);
		if (clickState) isHovered = true;

		if (isHovered) {
			const childCount = node.upgradeNodes.length || 1;
			const childStep = (Math.PI * 2) / childCount;
			const childStartAngle = angle; 
			let childIndex = 0;
			for(let childNode of node.upgradeNodes){
				renderNode(drawArgs, childNode, skipChildren, childStartAngle, childStep, 2, childIndex++);
			}
		}

		const childCount = node.childrenNodes.length || 1;
		const childStep = (Math.PI * 2) / childCount;
		const childStartAngle = angle; 
		let childIndex = 0;
		for(let childNode of node.childrenNodes){
			renderNode(drawArgs, childNode, skipChildren, childStartAngle, childStep, 1, childIndex++);
		}
		return;
	}

	let shouldRenderChildren = false;
	if (_tier === 1) {
		if (isHovered) shouldRenderChildren = true;
	} else {
		shouldRenderChildren = true;
	}

	if (!shouldRenderChildren) return;

	let childStep, childStartAngle;
	const childCount = node.childrenNodes.length || 1;
	
	if (_tier === 0 || _tier === 1) {
		childStep = (Math.PI * 2) / childCount;
		childStartAngle = angle; 
	} else {
		const sweep = _angle/(_tier-1); 
		childStep = sweep / childCount;
		childStartAngle = angle - ((childCount - 1) / 2) * childStep;
	}

	let childIndex = 0;
	for(let childNode of node.childrenNodes){
		renderNode(drawArgs, childNode, skipChildren, childStartAngle, childStep, _tier + 1, childIndex++);
	}
}

function buildNode(mockup, node, renderDistance=0){
	if (renderDistance === 1) return;
}

function buildNodeTree(){
	if(global.debug === true){
		console.log(`[UPGRADETREE] Rebuilding Node Tree`)
	}
	mainNode = new UpgradeTreeNode(player, 0);
	for(let i = 1; i < player.upgrades.length; i++){
		mainNode.childrenNodes.push(new UpgradeTreeNode(player, i));
	}
}

let lastMockup = undefined;
let lastUpgrade = undefined;
let i = 0;
function renderAllNodes(drawArgs){
	if(player.mockup !== lastMockup || player.upgrades[player.upgrades.length-1] !== lastUpgrade){
		lastMockup = player.mockup;
		lastUpgrade = player.upgrades[player.upgrades.length-1]
		buildNodeTree();
	}
	if(player.upgrades.length === 0){
		fadeGoal = 0;
	}
	i += 0.0005
	renderNode(drawArgs, mainNode, false, i);
	renderNode(drawArgs, mainNode, true, 0)
}

upgradeTree.drawFuncts.set("nodes", renderAllNodes);