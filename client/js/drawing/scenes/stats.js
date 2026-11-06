import { keyboard } from "../../controls/keyboard.js";
import { lerp } from "../../lerp.js";
import { currentSettings } from "../../settings.js";
import { playerState } from "../../state/player.js";
import { drawBar } from "../bar.js";
import { drawLoop } from "../drawLoop.js";
import { Scene } from "../scene.js";
import { renderText } from "../text.js";
import { clickableActive } from "./clickable.js";

const state = {
    padding: 3,
    margin: 10,
    fade: 0,
    active: true,
    x: 0,
    y: 0,
    width: 0,
    height: 0
};

const statBars = new Map();

function rebuildSortedBars() {
    const canonical = Object.keys(playerState.gui.skills).filter(k => k !== "points");
    const arr = [];
    for (let i = 0; i < canonical.length; i++) {
        const skillName = canonical[i];
        const bar = statBars.get(skillName);
        if (bar) {
            arr.push(bar);
            // assign hotkey only if not already set (preserve existing hotkeys)
            if (bar.hotkey === null || typeof bar.hotkey === "undefined") {
                bar.hotkey = (canonical.length - i) % 10;
            }
        }
    }
    // Append any remaining bars that didn't come from playerState (fallback)
    for (const [skillName, bar] of statBars) {
        if (!canonical.includes(skillName)) {
            arr.push(bar);
            if (bar.hotkey === null || typeof bar.hotkey === "undefined") {
                bar.hotkey = arr.length % 10;
            }
        }
    }
    sortedBars = arr;
}

function simNumberPress(num) {
    num = `${num}`;
    keyboard.keys[num] = true;
    setTimeout(() => {
        keyboard.keys[num] = false; // release the key after a short press
    }, 100);
}

class StatBar {
    constructor(label, current, max) {
        this.label = label;
        this.max = max;
        this.current = current;
        this.fillScalar = 0;
        this.hotkey = null; // assigned from server order when the bar is created
        this.scale = 1;
        this.targetScale = 1;
        this.clickPunch = 0;
        this.lastClickTime = 0;
    }

    tick(delta) {
        const speed = currentSettings.menuAnimSpeed.value.number * delta;
        this.scale = lerp(this.scale, this.targetScale, speed);
        this.clickPunch = lerp(this.clickPunch, 0, speed);
        this.fillScalar = lerp(this.fillScalar, state.fade * (this.current / this.max), speed)
    }
}

const stats = new Scene(30);
drawLoop.addScene("stats", stats);

function draw({ canvas, ctx, delta }) {
    const speed = currentSettings.menuAnimSpeed.value.number * delta;

    if (state.active) {
        state.fade = lerp(state.fade, 1, speed * .9);
    } else {
        state.fade = lerp(state.fade, 0, speed * .9);
        if (state.fade < 0.001) {
            stats.drawFuncts.delete("menu");
            return;
        }
    }

    // Config
    const scale = currentSettings.statsSize ? currentSettings.statsSize.value.number : 1;
    const borderMult = currentSettings.statsBorderSize ? currentSettings.statsBorderSize.value.number : 1;
    const borderBase = (canvas.width + canvas.height) / 2;

    // SHADOW     : black outline outset drawn around each coloured bar area
    // INNER_PAD  : gap between the inner panel border and the bar shadow edges (all sides)
    // BAR_GAP    : visible gap between adjacent bar shadow boxes
    // PANEL_BORDER: outer grey strip thickness (scaled)
    const BASE_BAR_HEIGHT = canvas.height / 75 * scale;
    const BAR_WIDTH = canvas.height / 4.5 * scale;
    const HOVER_SCALE = 1.175;
    const JIB_PADDING = 2;
    const SHADOW = state.padding / 2;  // shadow outset around coloured area
    const INNER_PAD = 6;             // inner panel border → bar shadow
    const BAR_GAP = 3;            // gap between bar shadow boxes
    const PANEL_BORDER = borderBase * 0.005 * borderMult * scale; // dependent on canvas & settings

    // Sync statBars with player skills
    let dirty = false;
    for (const skill in playerState.gui.skills) {
        if (skill === "points") continue;

        const skillData = playerState.gui.skills[skill];
        let bar = statBars.get(skill);

        if (!bar) {
            bar = new StatBar(skill, skillData.current, skillData.max);
            const canonical = Object.keys(playerState.gui.skills).filter(k => k !== "points");
            const idx = canonical.indexOf(skill);
            bar.hotkey = idx !== -1 ? (canonical.length - idx) % 10 : 0;
            statBars.set(skill, bar);
            dirty = true;

        } else {
            bar.max = skillData.max;
            bar.current = skillData.current;

        }
    }

    for (const [skill, bar] of statBars) {
        if (bar.max === 0 || !playerState.gui.skills[skill]) {
            statBars.delete(skill);
        }
    }

    if (dirty) rebuildSortedBars();

    for (const [k, bar] in statBars) {
        const barH = BASE_BAR_HEIGHT * bar.scale;
        const click = clickableActive(bar.x, bar.y, bar.x + BAR_WIDTH, bar.y + barH);
        bar.targetScale = click ? HOVER_SCALE : 1;
        if (click?.left) {
            const now = performance.now();
            if (now - bar.lastClickTime >= 200) {
                bar.lastClickTime = now;
                bar.clickPunch = 1;
                // use stable hotkey assigned to the StatBar; fall back to old index-based formula
                simNumberPress(typeof bar.hotkey !== 'undefined' && bar.hotkey !== null ? bar.hotkey : ((sortedBars.length - i) % 10));
            }
        }

    }

    // ── Panel sizing ────────────────────────────────────────────────────
    // Title bitmap (computed before layout so its height feeds into panel size)
    const TITLE = typeof playerState.gui.skills.points === "number" ? `Points Available: ${playerState.gui.skills.points}` : playerState.gui.skills.points;
    const titleSize = Math.round(BASE_BAR_HEIGHT * 0.85);
    const titleSpacing = Math.round(BASE_BAR_HEIGHT * 0.4);
    const titleBmp = renderText(TITLE, titleSize, { fillStyle: "#FFFFFF" }, true, BAR_WIDTH - 8);
    const titleH = titleBmp ? titleBmp.height : 0;

    // Sum bar heights including their shadow outset on both sides
    let barsH = 0;
    for (const bar of sortedBars) {
        barsH += BASE_BAR_HEIGHT * bar.scale + SHADOW * 2;
    }
    const gapsH = sortedBars.length > 1 ? BAR_GAP * (sortedBars.length - 1) : 0;

    // Full panel height: border + inner-pad + title + spacing + bars + gaps + inner-pad + border
    const fullPanelH = PANEL_BORDER * 2 + INNER_PAD * 2 + titleH + titleSpacing + barsH + gapsH;
    const maxPanelH = canvas.height - state.margin * 2;
    const panelH = Math.min(fullPanelH, maxPanelH);
    const heightRatio = fullPanelH > maxPanelH ? maxPanelH / fullPanelH : 1;

    // Panel width: border + inner-pad + shadow + bar + shadow + inner-pad + border
    let panelW = PANEL_BORDER * 2 + INNER_PAD * 2 + SHADOW * 2 + BAR_WIDTH;

    // Panel anchored to bottom-left, slides in from the left
    const outerX = state.margin - panelW * (1 - state.fade);
    const outerY = canvas.height - state.margin - panelH;

    // ── Layout pass ─────────────────────────────────────────────────────
    // Bar.x (coloured area left): inside border + inner-pad + shadow
    const barTargetX = outerX + PANEL_BORDER + INNER_PAD + SHADOW;

    // Start placing bars from the bottom of the inner panel, working upward.
    // shadowBottom tracks the bottom edge of the current bar's shadow box.
    let shadowBottom = outerY + panelH - PANEL_BORDER - INNER_PAD;

    for (const bar of sortedBars) {
        const scaledH = BASE_BAR_HEIGHT * bar.scale * heightRatio;
        // shadow box: top = shadowBottom - SHADOW*2 - scaledH, bottom = shadowBottom
        // bar coloured area top = shadowBottom - SHADOW - scaledH
        bar.targetX = barTargetX;
        bar.targetY = shadowBottom - SHADOW - scaledH;
        bar.tick(delta);
        shadowBottom -= SHADOW * 2 + scaledH + BAR_GAP;
    }

    // ── Draw panel ──────────────────────────────────────────────────────
    ctx.globalAlpha = state.fade * currentSettings.statsAlpha.value.number * currentSettings.statsBackgroundAlpha.value.number;
    ctx.fillStyle = "#777777";
    ctx.fillRect(outerX, outerY, panelW, panelH);
    ctx.fillStyle = "#444444";
    ctx.fillRect(
        outerX + PANEL_BORDER,
        outerY + PANEL_BORDER,
        panelW - PANEL_BORDER * 2,
        panelH - PANEL_BORDER * 2
    );

    state.x = outerX;
    state.y = outerY;
    state.width = panelW;
    state.height = panelH;

    // Title: positioned in the top inner-pad area
    ctx.globalAlpha = state.fade * currentSettings.statsAlpha.value.number;
    if (titleBmp) {
        ctx.drawImage(titleBmp, outerX + PANEL_BORDER + INNER_PAD, outerY + PANEL_BORDER + INNER_PAD);
    }

    // ── Draw bars ───────────────────────────────────────────────────────
    const cornerStyle = currentSettings.squareStatsBars.value.enabled ? "square" : "round";
    const colors = ["#D4826A", "#D8B94C", "#70CBB1", "#7EAF42", "#E1DE7C", "#C64247", "#A4D47C", "#389AC0", "#CE91B9", "#7B6FD2"].reverse();

    for (const [colorIndex, bar] of sortedBars.entries()) {
        const punchOffset = bar.clickPunch * 0.15;
        const barH = BASE_BAR_HEIGHT * bar.scale;
        const drawW = BAR_WIDTH * (1 - punchOffset);
        const drawH = barH * (1 - punchOffset);
        // Centre the punched bar within the original footprint
        const drawX = bar.x + (BAR_WIDTH - drawW) / 2 - drawW * (1 - state.fade);
        const drawY = bar.y + (barH - drawH) / 2;

        // Black shadow outline
        drawBar(ctx, drawX - SHADOW, drawY - SHADOW, drawW + SHADOW * 2, drawH + SHADOW * 2, 0, "black", "black", 1, cornerStyle);

        // Coloured jib segments
        const jibSize = drawW / bar.max;
        let jX = drawX;
        for (const jib of bar.jibs) {
            ctx.globalAlpha = jib * state.fade;
            drawBar(ctx, jX, drawY, jibSize, drawH, JIB_PADDING, colors[colorIndex], "black", jib, cornerStyle);
            jX += jibSize;
        }

        // Label + hotkey digit
        ctx.globalAlpha = state.fade * currentSettings.statsAlpha.value.number;
        const text = renderText(bar.label, drawH * 0.85);
        ctx.drawImage(text, drawX + drawW / 2 - text.width / 2, drawY + drawH / 2 - text.height / 2);
        if (bar.hotkey !== null && typeof bar.hotkey !== 'undefined') {
            const keyBmp = renderText(String(bar.hotkey), Math.round(drawH * 0.55));
            ctx.drawImage(keyBmp, drawX + 6, drawY + drawH / 2 - keyBmp.height / 2);
        }
    }

    // ── Fading-out (removed) bars ───────────────────────────────────────
    for (let i = REMOVING_statBars.length - 1; i >= 0; i--) {
        const bar = REMOVING_statBars[i];
        bar.tick(delta);
        const fade = (1 - bar.removingFade) * state.fade;
        ctx.globalAlpha = fade;
        const barH = BASE_BAR_HEIGHT * bar.scale;
        // slide left as it fades (keep Y unchanged)
        const slideX = bar.x - (1 - fade) * BAR_WIDTH;
        drawBar(ctx, slideX, bar.y, BAR_WIDTH, barH, 0, "black", "black", fade, cornerStyle);

        // show label + preserved hotkey while fading
        ctx.globalAlpha = fade;
        const labelBmp = renderText(bar.label, barH * 0.85);
        ctx.drawImage(labelBmp, slideX + BAR_WIDTH / 2 - labelBmp.width / 2, bar.y + barH / 2 - labelBmp.height / 2);
        if (bar.hotkey !== null && typeof bar.hotkey !== 'undefined') {
            const keyBmp = renderText(String(bar.hotkey), Math.round(barH * 0.55));
            ctx.drawImage(keyBmp, slideX + 6, bar.y + barH / 2 - keyBmp.height / 2);
        }

        if (bar.removingFade >= 0.99) REMOVING_statBars.splice(i, 1);
    }

    ctx.globalAlpha = 1;
}

stats.drawFuncts.set("menu", draw);

function openStatsMenu() {
    state.active = true;
    stats.drawFuncts.set("menu", draw);
}

function closeStatsMenu() {
    state.active = false;
}

function toggleStatsMenu() {
    if (state.active) {
        closeStatsMenu();
    } else {
        openStatsMenu();
    }
}

window.openStatsMenu = openStatsMenu;
window.closeStatsMenu = closeStatsMenu;

export { openStatsMenu, closeStatsMenu, toggleStatsMenu, state as statMenuState };
