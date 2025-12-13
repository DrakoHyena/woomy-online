import { global } from "../../global.js";
import { getEntityImageFromMockup } from "../../mockups.js";
import { lerp } from "../../lerp.js";
import { drawLoop } from "../drawLoop.js";
import { Scene } from "../scene.js";
import { player } from "../../player.js";
import { keyboard } from "../../controls/keyboard.js";
import { drawEntity } from "../drawEntity.js";
import { drawText } from "../canvas.js";
import { socket } from "../../socket.js";
import { CanvasCache } from "../../utils/cache.js";
import { mouse } from "../../controls/mouse.js";

// CONFIGURATION
const CONFIG = {
	// Timing
	FADE_DEBOUNCE_MS: 200,          // Delay between fade toggle presses
	CLICK_COOLDOWN_MS: 200,         // Delay between upgrade clicks
	MAX_FPS: 75,                    // Max framerate for the upgrade tree

	// Rendering
	RENDER_TIER_DEPTH: 2,           // How many tiers deep to render children
	NODE_SIZE_MULT: 0.08,            // Base node size as fraction of canvas width
	DISTANCE_DIVISOR: 3,            // Controls spacing between tiers (higher = closer)

	// Interaction
	HOVER_SIZE_MULT: 1.25,          // Scale multiplier when hovering a node
	BASE_ALPHA: 0.85,               // Default opacity for nodes
	HOVERED_ALPHA: 1.0,             // Opacity when hovering

	// Animation
	SIZE_LERP_FACTOR: 0.2,          // How fast size changes (0-1, higher = faster)
	ALPHA_LERP_FACTOR: 0.2,         // How fast alpha changes (0-1, higher = faster)
	FADE_LERP_FACTOR: 0.3,          // How fast menu fades in/out
	ROTATION_SPEED: 0.001,          // Speed of tier rotation (radians per frame)
	TIER_SPIN_MULTIPLIER: 0.85,     // How much faster each tier spins

	// Fade-in for new/reappearing nodes
	INITIAL_SIZE_MULT: 1,       // Starting size multiplier for fade-in
	INITIAL_ALPHA_MULT: 0.001,      // Starting alpha multiplier for fade-in

	// Labels
	LABEL_OFFSET_MULT: 0.38,        // Label distance from node center
	LABEL_SIZE_MULT: 0.35,          // Label size relative to node
	CENTER_LABEL_SIZE_MULT: 0.35,   // Center node label size
	CENTER_LABEL_OFFSET_MULT: 0.45, // Center label vertical offset

	// Gradient background
	GRADIENT_STOPS: [
		{ pos: 0,    color: "rgba(100,100,100,0.5)" },
		{ pos: .35,  color: "rgba(0,0,0,0.4)" },
		{ pos: 1, 	 color: "rgba(0,0,0,0.75)" },
	],

	// Input
	TOGGLE_KEY: "m",                // Key to toggle upgrade tree visibility

	// Cache
	CACHE_SIZE: 1000                // Max cached tank images
};

// PRECOMPUTED CONSTANTS (do not modify)
const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;
const THREE_HALF_PI = Math.PI * 1.5;
const NEG_QUARTER_PI = -Math.PI * 0.25;

// RUNTIME STATE
const frameCache = {
	cx: 0,
	cy: 0,
	baseDist: 0,
	baseNodeSize: 0,
	mx: 0,
	my: 0,
	hasMousePos: false
};

const state = {
	fade: 0,
	fadeGoal: 0,
	lastFadePress: 0,
	lastClickTime: 0,
	gradient: null,
	mainNode: null,
	lastMockup: null,
	lastUpgrade: null,
	rotationAngle: 0,
	hoveredNode: null,
	closestNodeDistSq: Infinity
};

// INITIALIZATION
const tankImgCache = new CanvasCache("upgradeIcons", CONFIG.CACHE_SIZE);
const upgradeTree = new Scene(document.getElementById("upgradeTreeCanvas"));
drawLoop.scenes.set("upgradeTree", upgradeTree);
upgradeTree.maxFps = CONFIG.MAX_FPS;
upgradeTree.drawingDisabled = true;

// UPGRADE TREE NODE CLASS
class UpgradeTreeNode {
	constructor(mockup, upgradeIndex) {
		this.mockup = mockup.upgrades[upgradeIndex]?.index ?? mockup.upgrades[upgradeIndex];
		this.upgradeIndex = upgradeIndex;
		this.sizeMulti = CONFIG.INITIAL_SIZE_MULT;
		this.alphaMulti = CONFIG.INITIAL_ALPHA_MULT;
		this.childrenNodes = [];
		this.upgradeNodes = [];
		this.x = 0;
		this.y = 0;
		this.size = 0;
		this.tier = 0;
		this.angle = 0;
		this.baseAlpha = CONFIG.BASE_ALPHA;
		this.image = null;
		this.flip = false;
		this.wasVisible = false; // Track visibility for fade-in reset
	}

	resetFadeIn() {
		this.sizeMulti = this.tier <= 1 ? CONFIG.INITIAL_SIZE_MULT : 1;
		this.alphaMulti = CONFIG.INITIAL_ALPHA_MULT;
	}

	syncChildren(targetList) {
		const count = this.image.upgrades?.length ?? 0;
		if (count === targetList.length) return;
		if (count < targetList.length) {
			targetList.length = count;
		} else {
			for (let i = targetList.length; i < count; i++) {
				const node = new UpgradeTreeNode(this.image, i);
				targetList.push(node);
			}
		}
	}

	checkInteraction(radiusSq) {
		if (!frameCache.hasMousePos) return;
		const dx = frameCache.mx - this.x;
		const dy = frameCache.my - this.y;
		const distSq = dx * dx + dy * dy;
		if (distSq > radiusSq) return;
		const normalizedDistSq = distSq / radiusSq;
		if (normalizedDistSq < state.closestNodeDistSq) {
			state.hoveredNode = this;
			state.closestNodeDistSq = normalizedDistSq;
		}
	}

	prepare(angle, tier) {
		this.tier = tier;
		this.angle = angle;
		this.image = getEntityImageFromMockup(this.mockup, global._tankMenuColor);
		this.baseAlpha = tier > 1 ? 0.25 + 0.75 / tier : CONFIG.BASE_ALPHA;

		const dist = frameCache.baseDist * tier;
		this.x = frameCache.cx + dist * Math.cos(angle);
		this.y = frameCache.cy + dist * Math.sin(angle);

		const tierScale = tier > 0 ? 1 / (1 + tier * 0.1) : 1;
		this.size = frameCache.baseNodeSize * tierScale;

		const radiusSq = this.size * this.size * 0.25;
		this.checkInteraction(radiusSq);

		// Normalize angle for flip detection
		let norm = angle % TWO_PI;
		if (norm < 0) norm += TWO_PI;
		this.flip = norm > HALF_PI && norm < THREE_HALF_PI;

		if (tier < CONFIG.RENDER_TIER_DEPTH) {
			this.syncChildren(this.childrenNodes);
		}
	}

	prepareCenter() {
		this.tier = 0;
		this.image = getEntityImageFromMockup(this.mockup, global._tankMenuColor);
		this.syncChildren(this.upgradeNodes);

		this.x = frameCache.cx;
		this.y = frameCache.cy;
		this.size = frameCache.baseNodeSize;

		const radiusSq = frameCache.baseNodeSize * frameCache.baseNodeSize * 0.25;
		this.checkInteraction(radiusSq);
	}

	draw(ctx, isVisible = true) {
		// Reset fade-in when becoming visible again
		if (isVisible && !this.wasVisible) {
			this.resetFadeIn();
		}
		this.wasVisible = isVisible;

		const isHovered = state.hoveredNode === this;
		const targetSize = (this.tier <= 1 && isHovered) ? CONFIG.HOVER_SIZE_MULT : 1;
		const targetAlpha = isHovered ? CONFIG.HOVERED_ALPHA : this.baseAlpha;

		this.sizeMulti = lerp(this.sizeMulti, targetSize, CONFIG.SIZE_LERP_FACTOR);
		this.alphaMulti = lerp(this.alphaMulti, targetAlpha, CONFIG.ALPHA_LERP_FACTOR);

		const drawAlpha = state.fade * this.alphaMulti;

		const cached = tankImgCache.get(this.image.name, this.image.index, this.image.color, this.size);
		if (cached) {
			ctx.globalAlpha = drawAlpha;
			const ox = cached.tankCenterX ?? cached.width * 0.5;
			const oy = cached.tankCenterY ?? cached.height * 0.5;
			ctx.setTransform(this.sizeMulti, 0, 0, this.sizeMulti, this.x, this.y);
			ctx.drawImage(cached, -ox, -oy);
		} else {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			drawEntity(
				this.x, this.y, this.image, 1, drawAlpha, 1,
				NEG_QUARTER_PI, true, ctx, undefined, undefined, this.size,
				tankImgCache.new(this.image.name, this.image.index, this.image.color, this.size)
			);
		}
	}

	drawLabel(ctx) {
		const drawSize = this.size * this.sizeMulti;
		const drawAlpha = state.fade * this.alphaMulti;
		const labelOffset = drawSize * CONFIG.LABEL_OFFSET_MULT;
		const labelX = this.x + labelOffset * Math.cos(this.angle);
		const labelY = this.y + labelOffset * Math.sin(this.angle);
		const rotation = this.flip ? this.angle - Math.PI : this.angle;

		ctx.setTransform(1, 0, 0, 1, labelX, labelY);
		ctx.rotate(rotation);
		drawText(
			this.image.name, 0, 0,
			drawSize * CONFIG.LABEL_SIZE_MULT / (this.tier + 1),
			"white", this.flip ? "right" : "left", true, drawAlpha, false, ctx
		);
	}

	drawCenterLabel(ctx) {
		const drawSize = this.size * this.sizeMulti;
		const drawAlpha = state.fade * this.alphaMulti;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		drawText(
			this.image.name, this.x, this.y - drawSize * CONFIG.CENTER_LABEL_OFFSET_MULT,
			drawSize * CONFIG.CENTER_LABEL_SIZE_MULT,
			"white", "center", true, drawAlpha, false, ctx
		);
	}
}

// RING PREPARATION & DRAWING
function prepareRing(nodes, baseAngle, angleSpan, tier, centered) {
	const len = nodes.length;
	if (!len || tier > CONFIG.RENDER_TIER_DEPTH) return;

	const step = angleSpan / len;
	const startAngle = centered
		? baseAngle - ((len - 1) * 0.5) * step
		: baseAngle * (CONFIG.TIER_SPIN_MULTIPLIER * tier);

	for (let i = 0; i < len; i++) {
		const node = nodes[i];
		const angle = startAngle + step * i;
		node.prepare(angle, tier);

		const nextSpan = tier <= 1 ? TWO_PI : step / Math.max(1, tier - 1);
		prepareRing(node.childrenNodes, angle, nextSpan, tier + 1, tier > 1);
	}
}

function resetChildrenFadeIn(nodes) {
	for (let i = 0, len = nodes.length; i < len; i++) {
		const node = nodes[i];
		node.resetFadeIn();
		resetChildrenFadeIn(node.childrenNodes);
	}
}

function drawRing(ctx, nodes, tier, parentHovered = false) {
	const len = nodes.length;
	if (!len || tier > CONFIG.RENDER_TIER_DEPTH) return;

	for (let i = 0; i < len; i++) {
		const node = nodes[i];
		const isHovered = state.hoveredNode === node;
		const shouldDrawChildren = tier !== 1 || isHovered;

		// Mark visibility for fade-in tracking
		node.draw(ctx, true);
		node.drawLabel(ctx);

		if (shouldDrawChildren) {
			// Reset children fade when they become visible
			if (tier === 1 && isHovered && !node.wasVisible) {
				resetChildrenFadeIn(node.childrenNodes);
			}
			drawRing(ctx, node.childrenNodes, tier + 1, isHovered);
		} else {
			// Mark hidden children as not visible so they fade in next time
			markChildrenHidden(node.childrenNodes);
		}
	}
}

function markChildrenHidden(nodes) {
	for (let i = 0, len = nodes.length; i < len; i++) {
		nodes[i].wasVisible = false;
		markChildrenHidden(nodes[i].childrenNodes);
	}
}

// NODE TREE MANAGEMENT
function rebuildNodeTree() {
	if (global.debug) console.log("[UPGRADETREE] Rebuilding Node Tree");
	state.mainNode = new UpgradeTreeNode(player, 0);
	const upgradeLen = player.upgrades.length;
	for (let i = 1; i < upgradeLen; i++) {
		state.mainNode.childrenNodes.push(new UpgradeTreeNode(player, i));
	}
	state.lastMockup = player.mockup;
	state.lastUpgrade = player.upgrades[upgradeLen - 1];
}

// SCENE SETUP
upgradeTree.drawFuncts.set("clear", ({ canvas, ctx }) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
});

upgradeTree.utilityFuncts.set("fade", () => {
	const now = performance.now();
	if (now - state.lastFadePress > CONFIG.FADE_DEBOUNCE_MS &&
		keyboard.keys[CONFIG.TOGGLE_KEY] &&
		player.upgrades.length) {
		state.lastFadePress = now;
		state.fadeGoal = state.fadeGoal ? 0 : 1;
		if (state.fadeGoal) upgradeTree.drawingDisabled = false;
	}
	state.fade = lerp(state.fade, state.fadeGoal, CONFIG.FADE_LERP_FACTOR);
	if (state.fade < 0.001 && !state.fadeGoal) {
		state.fade = 0;
		upgradeTree.drawingDisabled = true;
	}
});

upgradeTree.resizeFuncts.set("gradient", ({ canvas, ctx }) => {
	const cx = canvas.width * 0.5;
	const cy = canvas.height * 0.5;
	const r = Math.max(canvas.width, canvas.height) * 0.5;
	const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
	for (const stop of CONFIG.GRADIENT_STOPS) {
		g.addColorStop(stop.pos, stop.color);
	}
	state.gradient = g;
});

upgradeTree.drawFuncts.set("gradient", ({ canvas, ctx }) => {
	if (!state.gradient) {
		upgradeTree.resizeFuncts.get("gradient")({ canvas, ctx });
	}
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = state.fade;
	ctx.fillStyle = state.gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
});

upgradeTree.drawFuncts.set("nodes", ({ canvas, ctx }) => {
	const upgradeLen = player.upgrades.length;

	// Rebuild tree if mockup or upgrades changed
	if (player.mockup !== state.lastMockup ||
		player.upgrades[upgradeLen - 1] !== state.lastUpgrade) {
		rebuildNodeTree();
	}

	if (!upgradeLen) {
		state.fadeGoal = 0;
		return;
	}

	state.rotationAngle += CONFIG.ROTATION_SPEED;
	state.hoveredNode = null;
	state.closestNodeDistSq = Infinity;

	// Update frame cache once per frame
	const w = canvas.width;
	const h = canvas.height;
	frameCache.cx = w * 0.5;
	frameCache.cy = h * 0.5;
	frameCache.baseDist = (h / CONFIG.DISTANCE_DIVISOR / CONFIG.RENDER_TIER_DEPTH) * state.fade;
	frameCache.baseNodeSize = h * CONFIG.NODE_SIZE_MULT * state.fade;

	const mousePos = mouse.posRelativeToScene(upgradeTree);
	frameCache.mx = mousePos.x;
	frameCache.my = mousePos.y;
	frameCache.hasMousePos = true;

	// Prepare pass: calculate positions and detect hover
	state.mainNode.prepareCenter();
	prepareRing(state.mainNode.childrenNodes, state.rotationAngle, TWO_PI, 1, false);

	const centerHovered = state.hoveredNode === state.mainNode;
	if (centerHovered) {
		prepareRing(state.mainNode.upgradeNodes, state.rotationAngle, TWO_PI, 2, false);
	}

	// Draw pass: render all visible nodes
	drawRing(ctx, state.mainNode.childrenNodes, 1);
	if (centerHovered) {
		drawRing(ctx, state.mainNode.upgradeNodes, 2);
	}

	// Handle upgrade click
	if (state.hoveredNode && mouse.buttons.left) {
		const now = performance.now();
		if (now - state.lastClickTime > CONFIG.CLICK_COOLDOWN_MS) {
			state.lastClickTime = now;
			socket.talk("U", state.hoveredNode.upgradeIndex);
		}
	}

	// Draw center node last (on top)
	state.mainNode.draw(ctx, true);
	state.mainNode.drawCenterLabel(ctx);

	// Reset transform
	ctx.setTransform(1, 0, 0, 1, 0, 0);
});