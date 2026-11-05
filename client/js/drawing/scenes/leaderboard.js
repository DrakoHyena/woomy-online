import { drawLoop } from "../drawLoop.js";
import { Scene } from "../scene.js";
import { lerp } from "../../lerp.js";
import { playerState } from "../../state/player.js";
import { mockups } from "../../mockups.js";
import { getEntityImage } from "../entity.js";
import { renderText, suffixNum } from "../text.js";
import { currentSettings } from "../../settings.js";
import { getColor } from "../../colors.js";
import { drawBar } from "../bar.js";

// --- Config ---
const ROW_HEIGHT_MULT = 0.028;
const ROW_MARGIN = 2.5;
const BAR_WIDTH_MULT = 0.22; // fraction of canvas height used for bar width
const BASE_MARGIN = 5;
const BASE_PADDING = 5;
const ANIM_SPEED = 0.5;

export const leaderboardState = {
    active: true,
    fade: 1,

    // Config
    animSpeed: 1,
    scale: 1,
    borderSizeMult: 1,
    alpha: 1,
    bgAlpha: 1,
    squareBars: false,

    // Elements
    contentH: 0,
    rowHeight: 1,
    barWidth: 1,

};

function updateState(delta) {
    leaderboardState.animSpeed = currentSettings.menuAnimSpeed.value.number * ANIM_SPEED * delta;
    leaderboardState.scale = currentSettings.leaderboardSize?.value.number ?? 1;
    leaderboardState.borderMult = currentSettings.leaderboardBorderSize?.value.number ?? 1;
    leaderboardState.alpha = currentSettings.leaderboardAlpha?.value.number ?? 1;
    leaderboardState.bgAlpha = currentSettings.leaderboardBackgroundAlpha?.value.number ?? 1;
    leaderboardState.squareBars = currentSettings.squareLeaderboardBars.value.enabled;
}

const leaderboard = new Scene(30);
drawLoop.addScene("leaderboard", leaderboard);

// name|label|entityIndex
const leaderboardTiles = new Map();

function drawBars({ canvas, ctx, delta }) {
    updateState(delta);

    // Fade 
    if (leaderboardState.active) {
        leaderboardState.fade = lerp(leaderboardState.fade, 1, leaderboardState.animSpeed);
    } else {
        leaderboardState.fade = lerp(leaderboardState.fade, 0, leaderboardState.animSpeed);
        if (leaderboardState.fade < 0.01) {
            leaderboardState.fade = 0;
            leaderboard.drawFuncts.delete("drawBars");
            return; // Prevent invisible rendering execution
        }
    }

    // Config
    const rowHeight = Math.round(canvas.height * ROW_HEIGHT_MULT * leaderboardState.scale);
    const barWidth = Math.round(canvas.height * BAR_WIDTH_MULT * leaderboardState.scale);

    const titleText = playerState.gui?.leaderboard?.title || "";
    const titleSize = titleText ? Math.round(rowHeight * 0.85) : 0;
    const titleSpacing = titleText ? Math.round(rowHeight * 0.25) : 0;

    const margin = BASE_MARGIN * leaderboardState.scale;
    const padding = BASE_PADDING * leaderboardState.scale;

    const borderSize = ((canvas.width + canvas.height) / 2) * 0.005 * leaderboardState.borderMult * leaderboardState.scale;

    const rootX = Math.round(canvas.width - margin - borderSize - barWidth - 2 * padding);
    const top = margin + borderSize + 2 * padding + titleSize + titleSpacing;

    const entries = playerState.gui?.leaderboard?.entries || [];

    const desiredContentH = titleSize + titleSpacing * 2 + padding * 2 + (leaderboardTiles.size * rowHeight);

    leaderboardState.contentH = lerp(leaderboardState.contentH, desiredContentH, leaderboardState.animSpeed);

    // Update Tiles
    const currentRootX = rootX + (barWidth * (1 - leaderboardState.fade));

    // Flag all existing tiles for removal
    let topScore = 1;
    for (const tile of leaderboardTiles.values()) {
        if (tile.score > topScore) topScore = tile.score;
        tile.removing = true;
    }

    // Update and unflag all relevant tiles
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const entryKey = `${entry.name || ""}|${entry.label || ""}|${entry.index}`;

        let existing = leaderboardTiles.get(entryKey);
        if (existing) {
            existing.removing = false;
            existing.score = lerp(existing.score, entry.score, leaderboardState.animSpeed * .2);
            existing.scoreScalar = lerp(existing.scoreScalar, entry.score / topScore, leaderboardState.animSpeed);
            existing.name = entry.name;
            existing.label = entry.label;
            existing.nameColor = entry.nameColor || "#FFFFFF";
            existing.color = entry.color ?? 10;
            existing.entityIndex = entry.index;
            existing.rank = lerp(existing.rank, i, leaderboardState.animSpeed);
        } else {
            leaderboardTiles.set(entryKey, {
                key: entryKey,
                entityIndex: entry.index,
                score: entry.score,
                scoreScalar: 0.1,
                name: entry.name,
                label: entry.label,
                nameColor: entry.nameColor || "#FFFFFF",
                color: entry.color ?? 10,
                alpha: 0,
                removing: false,
                rank: i
            });
        }
    }

    for (const [key, tile] of leaderboardTiles) {
        if (tile.removing) {
            tile.alpha = lerp(tile.alpha, 0, leaderboardState.animSpeed);
            if (tile.alpha < 0.01) {
                leaderboardTiles.delete(key);
                continue;
            }
        } else {
            tile.alpha = lerp(tile.alpha, 1, leaderboardState.animSpeed);
        }
    }

    // Rendering
    ctx.save();

    // Render Background
    const outerX = currentRootX - 2 * padding - borderSize;
    const outerY = margin;
    const outerW = barWidth + 4 * padding + 2 * borderSize;
    const outerH = leaderboardState.contentH + 4 * padding + 2 * borderSize;

    ctx.globalAlpha = leaderboardState.fade * leaderboardState.alpha * leaderboardState.bgAlpha;
    ctx.fillStyle = "#777777";
    ctx.fillRect(outerX, outerY, outerW, outerH);

    ctx.fillStyle = "#444444";
    ctx.fillRect(
        outerX + borderSize + padding,
        outerY + borderSize + padding,
        barWidth + 2 * padding,
        leaderboardState.contentH + 2 * padding
    );

    // Render Tiles
    ctx.globalAlpha = leaderboardState.fade * leaderboardState.alpha;
    if (titleText) {
        const bmp = renderText(titleText, titleSize, { fillStyle: "#FFFFFF" }, true, barWidth - 8);
        ctx.drawImage(
            bmp,
            currentRootX + Math.round((barWidth - bmp.width) / 2),
            margin + borderSize + 2 * padding
        );
    }

    for (let [key, tile] of leaderboardTiles) {
        const tileAlpha = tile.alpha * leaderboardState.fade * leaderboardState.alpha;
        if (tileAlpha <= 0) return;

        ctx.globalAlpha = tileAlpha;

        const pad = Math.max(6, Math.round(rowHeight * 0.12));
        const color = typeof tile.color === "string" ? tile.color : getColor(tile.color);

        const tileX = currentRootX + barWidth * (1 - tile.alpha)
        const tileY = top + tile.rank * (rowHeight + ROW_MARGIN);

        drawBar(ctx, tileX, tileY, barWidth, rowHeight, 4, color, "black", tile.scoreScalar, leaderboardState.squareBars ? "square" : "round");

        // Mockup Icon
        if (tile.entityIndex !== undefined) {
            const mockup = mockups.get(tile.entityIndex);
            if (mockup) {
                mockup.color = color;
                const img = getEntityImage(mockup, false, 1.25);
                if (img) {
                    const maxSize = rowHeight;
                    const imgScale = maxSize / Math.max(img.width, img.height);

                    ctx.save();
                    ctx.translate(tileX + Math.round(rowHeight / 2), tileY + Math.round(rowHeight / 2));
                    ctx.scale(imgScale, imgScale);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);
                    ctx.restore();
                }
            }
        }

        // Name and label
        const nameX = tileX + rowHeight + pad;
        if (currentSettings.compactLeaderboard.value.enabled) {
            const nameBmp = renderText(tile.name || "", rowHeight * 0.6, { fillStyle: tile.nameColor });

            if (tile.label) {
                const labelPad = 25;
                const labelBmp = renderText(tile.label, rowHeight * 0.6, { fillStyle: "#CCCCCC" });
                const nameW = (barWidth * .65 - labelBmp.width) || 1
                ctx.drawImage(nameBmp, 0, 0, nameW - labelPad, nameBmp.height, nameX, Math.round(tileY + (rowHeight - nameBmp.height) / 2), (nameW - labelPad), nameBmp.height);
                ctx.drawImage(labelBmp, nameX + nameW, Math.round(tileY + (rowHeight - labelBmp.height) / 2));
            } else {
                ctx.drawImage(nameBmp, 0, 0, nameX, nameBmp.height, nameX, Math.round(tileY + (rowHeight - nameBmp.height) / 2));
            }
        } else {
            const nameBmp = renderText(tile.name || "", rowHeight * 0.4, { fillStyle: tile.nameColor });
            if (tile.label) {
                const labelBmp = renderText(tile.label, rowHeight * 0.3, { fillStyle: "#CCCCCC" });
                const spacing = Math.max(2, Math.round(rowHeight * 0.015));
                const combinedH = nameBmp.height + spacing + labelBmp.height;
                const baseY = Math.round(tileY + (rowHeight - combinedH) / 2);

                ctx.drawImage(nameBmp, nameX, baseY);
                ctx.drawImage(labelBmp, nameX, baseY + nameBmp.height);
            } else {
                ctx.drawImage(nameBmp, nameX, Math.round(tileY + (rowHeight - nameBmp.height) / 2));
            }
        }

        // Target Score
        const scoreBmp = renderText(currentSettings.leaderboardRawScores.value.enabled ? `${Math.round(tile.score)}` : suffixNum(tile.score), rowHeight * 0.45, { fillStyle: "#FFFFFF" });

        ctx.drawImage(
            scoreBmp,
            Math.round(tileX + barWidth - scoreBmp.width - pad),
            Math.round(tileY + (rowHeight - scoreBmp.height) / 2)
        );

    }

    ctx.restore();
}

leaderboard.drawFuncts.set("drawBars", drawBars);

export function openLeaderboard() {
    leaderboardState.active = true;
    leaderboard.drawFuncts.set("drawBars", drawBars);
}

export function closeLeaderboard() {
    leaderboardState.active = false;
}

export function toggleLeaderboard() {
    leaderboardState.active ? closeLeaderboard() : openLeaderboard();
}
