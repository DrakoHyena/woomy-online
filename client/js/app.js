import { global, resizeEvent } from "./global.js";
import { util, getWOSocketId } from "/js/util.js"
import { ctx, _clearScreen } from "./drawing/canvas.js"
import { rewardManager } from "/js/achievements.js"
import { initSettingsMenu } from "/js/settingsMenu.js"
import { mockups, } from "./mockups.js"
import { socket, makeSocket } from "./socket.js"
import { gameDrawDead, gameDrawDisconnected, gameDrawError, gameDrawServerStatusText, gameDrawLoadingMockups } from "./drawing/scenes.js"
import { gameDraw } from "./drawing/gameDraw.js"

import { multiplayer } from "./multiplayer.js";
import "./mainmenu.js";
import "./joinMenu.js";
import { config } from "./config.js";
import { drawVignette } from "./drawing/vignette.js";
import { drawLoop } from "./drawing/drawLoop.js";

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/js/offline.js')
			.then((reg) => console.log('Offline page registered:', reg))
			.catch((err) => console.error('Offline page registration failed:', err));
	});
}

// App.js
function RememberScriptingIsBannable() {
    initSettingsMenu();

    // MAIN MENUS //
    window.addEventListener("resize", resizeEvent);
    resizeEvent();

    util._retrieveFromLocalStorage("playerNameInput");

    document.addEventListener("keydown", function eh (e) {
        if (global._disconnected && global._gameStart) return;
        let key = e.which || e.keyCode;
        if (document.getElementById("gameJoinScreen").style.zIndex !== "-101") return;
        this.removeEventListener("keydown", eh)
        if (!global._disableEnter && key === global.KEY_ENTER && !global._gameStart) document.getElementById("startButton").click();
    })


    global.gameLoopSecond = function () {
        let time = 0;
        let i = 0;
        let func = function () {
            global._bandwidth._out = global._bandwidth._outbound;
            global._bandwidth._in = global._bandwidth._inbound;
            global._bandwidth._outbound = 0;
            global._bandwidth._inbound = 0;

            if (!global._gameStart || global.gameDrawDead || global._disconnected) {
                return time = 0
            } else {

            };
            if (rewardManager._statistics[5] < ++time) rewardManager.increaseStatistic(5, time, true);
            switch (time) {
                case 1800:
                    rewardManager.unlockAchievement("hope_you_are_having_fun");
                    break;
                case 3600:
                    rewardManager.unlockAchievement("i_mean_you_must_be_right");
                    break;
                case 7200:
                    rewardManager.unlockAchievement("hopefully_you_have_the_score_to_back_this_up");
                    break;
                case 14400:
                    rewardManager.unlockAchievement("no_way_you_didnt_go_afk");
                    break;
            }

            rewardManager.increaseStatistic(7, 1);
            switch (rewardManager._statistics[7]) {
                case 1800:
                    rewardManager.unlockAchievement("hourly_enjoyer");
                    break;
                case 14400:
                    rewardManager.unlockAchievement("fhourly_enjoyer");
                    break;
                case 36000:
                    rewardManager.unlockAchievement("okay_that_was_fun");
                    break;
                case 86400:
                    rewardManager.unlockAchievement("uh_are_you_okay");
                    break;
                case 259200:
                    rewardManager.unlockAchievement("you_need_something_else_to_do");
                    break;
                case 604800:
                    rewardManager.unlockAchievement("wake_up_wake_up_wake_up");
                    break;
            }

            if (time % 3 === 0) {
                if (_gui._skills[0].cap !== 0 && _gui._skills[0].amount === _gui._skills[0].cap) rewardManager.unlockAchievement("shielded_from_your_bs");
                if (_gui._skills[1].cap !== 0 && _gui._skills[1].amount === _gui._skills[1].cap) rewardManager.unlockAchievement("selfrepairing");
                if (_gui._skills[2].cap !== 0 && _gui._skills[2].amount === _gui._skills[2].cap) rewardManager.unlockAchievement("2fast4u");
                if (_gui._skills[3].cap !== 0 && _gui._skills[3].amount === _gui._skills[3].cap) rewardManager.unlockAchievement("ratatatatatatatata");
                if (_gui._skills[4].cap !== 0 && _gui._skills[4].amount === _gui._skills[4].cap) rewardManager.unlockAchievement("more_dangerous_than_it_looks");
                if (_gui._skills[5].cap !== 0 && _gui._skills[5].amount === _gui._skills[5].cap) rewardManager.unlockAchievement("theres_no_stopping_it");
                if (_gui._skills[6].cap !== 0 && _gui._skills[6].amount === _gui._skills[6].cap) rewardManager.unlockAchievement("indestructible_ii");
                if (_gui._skills[7].cap !== 0 && _gui._skills[7].amount === _gui._skills[7].cap) rewardManager.unlockAchievement("mach_4");
                if (_gui._skills[8].cap !== 0 && _gui._skills[8].amount === _gui._skills[8].cap) rewardManager.unlockAchievement("dont_touch_me");
                if (_gui._skills[9].cap !== 0 && _gui._skills[9].amount === _gui._skills[9].cap) rewardManager.unlockAchievement("indestructible");

                if (rewardManager._statistics[8] > 199) rewardManager.unlockAchievement("nuisance_exterminator");
                if (rewardManager._statistics[8] > 0) rewardManager.unlockAchievement("they_seek");

                if (rewardManager._statistics[10] > 99) rewardManager.unlockAchievement("drones_are_life");

                let max = _gui._leaderboard._display.length ? _gui._leaderboard._display[0].score : false;
                if (!global._died && time > 30 && Math.min(1, _gui._skill.getScore() / max) === 1) rewardManager.unlockAchievement("the_leader");
            }
        }
        setInterval(func, 1000);
    }();
}

util._retrieveFromLocalStorage("nameInput")
util._retrieveFromLocalStorage("tokenInput")
async function _startGame(gamemodeCode, joinRoomId, maxPlayers, maxBots) {
	drawLoop.start();
	document.getElementById("legalDisclaimer")?.remove?.()
    if (!global.animLoopHandle) _animloop();
    document.getElementById("mainWrapper").style.zIndex = -100;
    global.playerName = util._cleanString(document.getElementById("nameInput").value || "", 25)
    let socketOut = global.playerName.split('');
    for (let i = 0; i < socketOut.length; i++) socketOut[i] = socketOut[i].charCodeAt();

    if (window.creatingRoom === true) { // Create game
        window.loadingTextStatus = "Downloading server..."
        window.loadingTextTooltip = ""
        window.serverWorker = new Worker("./server/server.js", {type:"module"});
		window.serverWorker.onerror = function(err){
			window.loadingTextStatus = "Failed to start server"
			window.loadingTextTooltip = "Please reload the page and try again" 
			console.error(err)
		}
        window.loadingTextStatus = "Starting server..."
        window.loadingTextTooltip = ""
        console.log("Starting server...")
        await multiplayer.startServerWorker(gamemodeCode, undefined, undefined, maxPlayers, maxBots)
        console.log("...Server started!")
		window.serverWorker.onerror = undefined;
        await multiplayer.wrmHost()
		joinRoomId = await multiplayer.getHostRoomId();
        document.getElementById("entityEditor").style.display = "block" // enable editor for host
    }
    window.loadingTextStatus = "Joining server..."
    window.loadingTextTooltip = ""
    await makeSocket(joinRoomId).catch((err)=>{
		window.loadingTextStatus = "Connection Timed Out"
		window.loadingTextTooltip = "There was an issue connecting to this player. Try a different room or make your own and play alone for the time being."
		throw err;
	})
	window.loadingTextStatus = "Loading assets..."
	window.loadingTextTooltip = "(0/0)"
	await new Promise((res, rej)=>{
		window.assetLoadingPromise = res;
		socket.talk("as");
	})
    window.loadingTextStatus = "Loading room..."
    window.loadingTextTooltip = ""
    console.log(socket)
    socket.talk("s", global.party || 0, socketOut.toString(), 1, getWOSocketId());
    window.selectedRoomId = joinRoomId;
    //window.roomManager.send(window.addMetaData(1, 4, fasttalk.encode([window.selectedRoomId])))

    if (global.playerName === "") rewardManager.unlockAchievement("anonymous");
    if (document.getElementById("mainMenu")) {
        document.getElementById("mainMenu").remove();
    } else {
        document.getElementById("startMenuWrapper").remove();
    };
    //clearInterval(global.screenScale);
    //global.functionSociety.push([`${socket}`, canvas, "socket"]);
    document.getElementById("gameCanvas").focus();
}


let nextTime = 0;
function _animloop() {
    global.animLoopHandle = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame)(_animloop);
    if (nextTime < performance.now()) {
        try {
            global.player._renderv += (global.player._view - global.player._renderv) / 30;
            let ratio = getRatio();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            if (global._gameStart && !global._disconnected) {
                global.time = Date.now(); //getNow();
                if (global.time - lastPing > 1000) {
                    lastPing = global.time;
                    socket.ping();
					doingPing = true;
                    metrics._rendertime = renderTimes * (config.performanceMode ? 2 : 1);
                    renderTimes = 0;
                    metrics._updatetime = updateTimes;
                    updateTimes = 0;
                }
                if (global._debug > 3 && global.time - lastServerStat > 1000 + 150) {// make sure to update this on the server if you change the time
                    socket.talk("da")
                    lastServerStat = global.time
                }
                metrics._lag = global.time - global.player._time;
            }
            if (global._gameStart) {
                if (mockups.length === 0) {
                    gameDrawLoadingMockups();
                } else {
                    gameDraw(ratio);
                };
            } else if (!global._disconnected) {
                gameDrawServerStatusText();
            }
            gameDrawDead();
			if(!config.performanceMode&&!global._blackout) drawVignette();
            if (global._disconnected) gameDrawDisconnected();
        } catch (error) {
            gameDrawError(error)
        }
        nextTime += global._fpscap;
    }
};

let startInterval = setInterval(() => {
    if (!window.preloadsDoneCooking) {
        return
    }
    clearInterval(startInterval)
    RememberScriptingIsBannable()
})

export { _startGame, _animloop }