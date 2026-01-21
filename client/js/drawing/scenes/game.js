import { rewardManager } from "../../achievements.js";
import { lerp, lerpAngle } from "../../lerp.js";
import { multiplayer } from "../../multiplayer.js";
import { playerState } from "../../state/player.js";
import { connectClientSocket, socket } from "../../socket.js";
import { getWOSocketId, util } from "../../util.js";
import { drawLoop } from "../drawLoop.js";
import { Scene } from "../scene.js";
import { renderText } from "../text.js";
import { closeLoadingScreen, openLoadingScreen } from "./loadingScreen.js";
import { settingsState } from "./settings.js";
import { roomState } from "../../state/room.js";
import { ASSET_MAGIC, getAsset, loadAsset } from "../../../../shared/assets.js";
import { getEntityImage } from "../entity.js";
import { currentSettings } from "../../settings.js";
import { entitiesArr } from "../../socket.js";

const state = {
	renderingStarted: false,
	screenScale: 1,
	fovScale: 1,
	frame: 0,
}

const main = new Scene(document.getElementById("mainCanvas"));
drawLoop.scenes.set("main", main);

main.drawFuncts.set("clear", ({ canvas, ctx, delta }) => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
})

main.drawFuncts.set("background", ({ canvas, ctx, delta }) => {
	if (roomState.mapType !== 1) {
		const W = roomState.cells[0].length;
		const H = roomState.cells.length;
		const cellWidth = roomState.width / W;
		const cellHeight = roomState.height / H;
		const scaledCellWidth = state.screenScale * cellWidth;
		const scaledCellHeight = state.screenScale * cellHeight;
		const offsetX = canvas.width / 2 - state.screenScale * playerState.entity.x;
		const offsetY = canvas.height / 2 - state.screenScale * playerState.entity.y;

		state.frame++;

		for (let y = 0; y < H; y++) {
			const top = state.screenScale * y * cellHeight + offsetY;
			const bottom = top + scaledCellHeight;
			
			// Skip entire row if off-screen vertically
			if (bottom < 0 || top > canvas.height) continue;
			
			const row = roomState.cells[y];
			for (let x = 0; x < row.length; x++) {
				const cell = row[x];
				if (cell === "edge") continue;
				
				const left = state.screenScale * x * cellWidth + offsetX;
				const right = left + scaledCellWidth;
				
				// Skip cell if off-screen horizontally
				if (right < 0 || left > canvas.width) continue;
				
				const cellSkin = roomState.cellSkins[cell] || roomState.cellSkins["default"];
				const assetIndex = cellSkin.frameInterval === 0 ? 0 : Math.floor((state.frame % cellSkin.frameInterval) / cellSkin.frameInterval * cellSkin.assets.length);
				const asset = getAsset(cellSkin.assets[assetIndex]).data;

				if(cellSkin.repeat){
					ctx.save();
					ctx.fillStyle = ctx.createPattern(asset, "repeat");
					ctx.translate(offsetX, offsetY);
					ctx.scale(state.screenScale, state.screenScale);
					ctx.fillRect((left - 1 - offsetX) / state.screenScale, (top - 1 - offsetY) / state.screenScale, (scaledCellWidth + 2) / state.screenScale, (scaledCellHeight + 2) / state.screenScale);
					ctx.restore();
				}else if(cellSkin.stretch){
					ctx.drawImage(asset, left - 1, top - 1, scaledCellWidth + 2, scaledCellHeight + 2);
				}
			}
		}
	}
	// TODO: Circle Map
	// } else if (roomState.mapType === 1) {
	// 	const xx = -px + global._screenWidth / 2 + ratio * global._gameWidth / 2;
	// 	const yy = -py + global._screenHeight / 2 + ratio * global._gameHeight / 2;
	// 	const radius = ratio * global._gameWidth / 2;
	// 	ctx.fillStyle = color.white;
	// 	ctx.globalAlpha = 1;
	// 	ctx.beginPath();
	// 	ctx.arc(xx, yy, radius, 0, TAU);
	// 	ctx.closePath();
	// 	ctx.fill();
	// }
})

main.drawFuncts.set("entities", ({ canvas, ctx, delta }) => {
	for (let i = 0; i < entitiesArr.length; i++) {
		const entity = entitiesArr[i];

		if (entity.id === playerState.entityId) {
			playerState.entity = entity;
			playerState.gameName = entity.name == null ? mockups.get(entity.index).name : entity.name;
		}

		const render = getEntityImage(entity);
		console.log(render)
		ctx.drawImage(render, entity.x, entity.y)
		ctx.globalAlpha = 1;
	};
})

async function startGame(gamemodeCode, joinRoomId, maxPlayers, maxBots){
	drawLoop.start();

    document.getElementById("startMenuWrapper").remove();
	document.getElementById("legalDisclaimer").remove()
    document.getElementById("mainWrapper").remove()
    
	playerState.name = util._cleanString(document.getElementById("nameInput").value || "", 25)
    playerState.socketName = playerState.name.split('').map(x=>x.charCodeAt());
    if (playerState.name === "") rewardManager.unlockAchievement("anonymous");

    if (window.creatingRoom === true) { // Create game
		openLoadingScreen("Downloading Server...", "")
        window.serverWorker = new Worker("./server/server.js", {type:"module"});
		window.serverWorker.onerror = function(err){
			openLoadingScreen("Failed to Start Server", "Please reload the page and try again")
			console.error(err)
		}
		openLoadingScreen("Starting Server...", "")
        console.log("Starting server...")
        await multiplayer.startServerWorker(gamemodeCode, undefined, undefined, maxPlayers, maxBots)
        console.log("...Server started!")
		window.serverWorker.onerror = undefined;
        await multiplayer.wrmHost()
		joinRoomId = await multiplayer.getHostRoomId();
		settingsState.showEntityEditor = true;
	}

	openLoadingScreen("Joining Server...", "")
    await connectClientSocket(joinRoomId).catch((err)=>{
		openLoadingScreen("Connection Timed Out", "There was an issue connecting to this player. Try a different room or make your own and play alone for the time being.")
		throw err;
	})
	
	openLoadingScreen("Loading Assets...", "(0/0)")
	await new Promise((res, rej)=>{
		window.assetLoadingPromise = res;
		socket.send("as");
	})
	
	openLoadingScreen("Loading Room...", "")
    console.log(socket)
    socket.send("s", 0, playerState.socketName.toString(), 1, getWOSocketId());
    window.selectedRoomId = joinRoomId;

    document.getElementById("gameCanvas").focus();
	closeLoadingScreen("Have Fun", ":)")
	closeLoadingScreen()
}

export { startGame, state as gameState }