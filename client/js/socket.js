import { global } from "./global.js";
import { util } from "./util.js"
import { logger } from "./debug.js"
import { rewardManager } from "./achievements.js"
import { color } from "./colors.js";
import { mixColors } from "../../shared/mix_colors.js";
import { mockups } from "./mockups.js";
import { Smoothbar } from "./util.js";
import { multiplayer } from "./multiplayer.js";
import { fasttalk } from "./fasttalk.js";
import { lerp } from "./lerp.js";
import { ASSET_MAGIC, loadAsset, setAsset } from "../../shared/assets.js";
import "./consoleCommands.js"
import { drawVignette } from "./drawing/vignette.js";
import { player } from "./player.js";
import { currentSettings } from "./settings.js";
import { loadingScreenState } from "./drawing/scenes/loadingScreen.js";
import { roomState } from "./state/room.js";
import { playerState } from "./state/player.js";

const entities = new Map();
const entitiesArr = [];
let socket;

// CONVERT //
const convert = {
	reader: {
		index: 0,
		crawlData: [],
		next: function () {
			if (convert.reader.index >= convert.reader.crawlData.length) {
				logger.norm(convert.reader.crawlData);
				throw new Error("Trying to crawl past the end of the provided data!");
			} else return convert.reader.crawlData[convert.reader.index++];
		},
		current: function () {
			if (convert.reader.index >= convert.reader.crawlData.length) {
				logger.norm(convert.reader.crawlData);
				throw new Error("Trying to crawl past the end of the provided data!");
			} else return convert.reader.crawlData[convert.reader.index - 1];
		},
		take: amount => {
			convert.reader.index += amount;
			if (convert.reader.index > convert.reader.crawlData.length) {
				console.error(convert.reader.crawlData);
				throw new Error("Trying to crawl past the end of the provided data!");
			}
		},
		set: function (data, offset) {
			convert.reader.crawlData = data;
			convert.reader.index = offset;
		}
	},

	lasers: convertLasers,
	entities: convertEntities,
	fastGui: convertFastGui,
	slowGui: convertSlowGui,
};

// CONVERT DATA // 
class RopePoint {
	constructor(x, y) {
		this.pos = { x: x, y: y };
		this.vel = { x: 0, y: 0 };
	}
	tick() {
		this.vel.x *= .7;
		this.vel.y *= .7;
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}
}

function convertLasers() {
	for (let i = 0, len = convert.reader.next(); i < len; i++) {
		const id = convert.reader.next();
		let laser = laserMap.get(id);
		if (!laser) {
			laser = {
				id: id,
				x: convert.reader.next(),
				_x: 0,
				y: convert.reader.next(),
				_y: 0,
				x2: convert.reader.next(),
				_x2: 0,
				y2: convert.reader.next(),
				_y2: 0,
				color: convert.reader.next(),
				width: 0,
				_width: convert.reader.next(),
				maxDur: convert.reader.next(),
				dur: convert.reader.next(),
				shouldDie: 0,
				fade: 1,
			}
		} else {
			laser._x = convert.reader.next();
			laser.x = lerp(laser.x, laser._x, window.movementSmoothing)
			laser._y = convert.reader.next();
			laser.y = lerp(laser.y, laser._y, window.movementSmoothing)
			laser._x2 = convert.reader.next();
			laser.x2 = lerp(laser.x2, laser._x2, window.movementSmoothing)
			laser._y2 = convert.reader.next();
			laser.y2 = lerp(laser.y2, laser._y2, window.movementSmoothing)
			laser.color = convert.reader.next();
			laser._width = convert.reader.next();
			laser.width = lerp(laser.width, laser._width, window.movementSmoothing)
			laser.maxDur = convert.reader.next();
			laser.dur = convert.reader.next();
		}
		laser.shouldDie = 0;
		laserMap.set(id, laser);
	}

	for (let [_, laser] of laserMap) {
		laser.shouldDie++;
		if (laser.shouldDie > 1) {
			laser.fade = lerp(laser.fade, 0, window.movementSmoothing)
			if (laser.fade < 0.01) {
				laserMap.delete(laser.id);
			}
		}
	}
}

class ClientGun{
	constructor(){
		this.motion = 0;
		this.position = 0;
		this.recoverRate = .25;
	}
	tick(){
		this.motion = lerp(this.motion, 0, this.recoverRate)
		this.position = lerp(this.position, 0, this.recoverRate/2)
	}
	fire(power) {
		this.motion += Math.sqrt(power) / 30;
	}
}

class ClientEntity{
	constructor(
	    id = -1,
		index = 0,
		name = "",
		x = 0,
		y = 0,
		size = 1,
		facing = 0,
		score = 0,
		layer = 1,
		color = 0,
		team = 0,
		health = 1,
		shield = 1,
		alpha = 1,
		seeInvisible = false,
		nameColor = "#FFFFFF",
		label = "",
		widthHeightRatio = [1, 1],
		hideHealth = false,
		hideName = false,
		leash = false,
	){
		this.id = id;
		this.index = index;
		this.name = name;
		this.x = x;
		this.y = y;
		this.size = size;
		this.facing = facing;
		this.score = score;
		this.layer = layer;
		this.color = color;
		this.team = team;
		this.health = health;
		this.shield = shield;
		this.alpha = alpha;
		this.seeInvisible = seeInvisible;
		this.nameColor = nameColor;
		this.label = label;
		this.widthHeightRatio = widthHeightRatio;
		this.hideName = hideName;
		this.hideHealth = hideHealth;

		this.leash = leash;
		if(typeof this.leash === "object"){
			this.leash = { x: this.leash.x, y: this.leash.y, points: [] };
			for (let i = 0; i < 10; i++) {
				entity.leash.points.push(new RopePoint((entity.x + entity.leash.x) / 2, (entity.y + entity.leash.y) / 2))
			}
		}

		this.guns = [];
		this.turrets = [];

		this.sizeFade = 0;
		this.hurtFade = 0;
	}

	setGun(index){
		this.guns[index] = new ClientGun();
	}

	setTurret(){
		this.turrets[index] = newEntity();
	}

	tick(){
		this.sizeFade = lerp(this.sizeFade, 1, 0.25);
		this.hurtFade = lerp(this.hurtFade, 0, 0.25);
		for(let gun of this.guns){
			gun.tick();
		}
	}
}

function newEntity(skipSpawnFade=false){
	let entity = new ClientEntity(
		convert.reader.next(), // id
		convert.reader.next(), // index
		convert.reader.next(), // name
		convert.reader.next(), // x
		convert.reader.next(), // y
		convert.reader.next(), // size
		convert.reader.next(), // facing
		convert.reader.next(), // score
		convert.reader.next(), // layer
		convert.reader.next(), // color
		convert.reader.next(), // team
		convert.reader.next(), // health
		convert.reader.next(), // shield
		convert.reader.next(), // alpha
		convert.reader.next(), // seeInvisible
		convert.reader.next(), // nameColor
		convert.reader.next(), // label
		convert.reader.next(), // widthHeightRatio
		convert.reader.next(), // hideHealth
		convert.reader.next(), // hideName
		convert.reader.next() ? { x: convert.reader.next(), y: convert.reader.next() } : convert.reader.current(), // leash
	)

	let gunAmount = convert.reader.next();
	for (let i = 0; i < gunAmount; i++) {
		entity.setGun(i);
	}

	let turretAmount = convert.reader.next();
	for (let i = 0; i < turretAmount; i++) {
		entity.setTurret(i);
	}

	if(skipSpawnFade === true){
		entity.sizeFade = 1;
	}

	entities.set(entity.id, entity)
	return entity;
}

function updateEntity(entityId, updateType){
	const entity = entities.get(entityId);
	if(updateType === -1){
		entity = newEntity(true);
		return entity;
	}
	if(updateType === 0){
		return entity;
	}
	if(convert.reader.next()){ // Leash
		entity.leash.x = convert.reader.next();
		entity.leash.y = convert.reader.next();
		for(let point of entity.leash.points){
			point.tick();
		}
	}else{
		entity.leash = false;
	}
	if(updateType >= 1){ // Position
		entity.x = convert.reader.next();
		entity.y = convert.reader.next();
		entity.facing = convert.reader.next();
	}
	if(updateType >= 2){ // Minimal
		entity.health = convert.reader.next();
		entity.shield = convert.reader.next();
		entity.score = convert.reader.next();
		entity.size = convert.reader.next();
		entity.alpha = convert.reader.next();
	}
	if(updateType >= 3){ // Visual Change
		entity.color = convert.reader.next();
		entity.team = convert.reader.next();
		entity.layer = convert.reader.next();
	}
	if(updateType >= 4){ // Text Change
		entity.name = convert.reader.next();
		entity.nameColor = convert.reader.next();
		entity.label = convert.reader.next();
	}
	return entity;
}

let newEntities = new Map();
let holdingVar = undefined;
function convertEntities() {
	for (let i = 0, newEntityAmount = convert.reader.next(); i < newEntityAmount; i++) {
		const entity = newEntity();
		newEntities.set(entity.id, entity);
	}
	for (let i = 0, updatedEntityAmount = convert.reader.next(); i < updatedEntityAmount; i++){
		const entity = updateEntity(convert.reader.next(), convert.reader.next());
		entityIdsInFrame.set(entity.id, entity);
	}
	
	entitiesArr.length = 0;
	const entitiesItr = newEntities.values();
	for(let entity of entitiesItr){
		entity.tick();
		entitiesArr.push(entity);
	}
	entityArr.sort((a, b) => {
		return a.layer - b.layer || b.id - a.id;
	});

	holdingVar = newEntities;
	newEntities = entities;
	entities = holdingVar;
	newEntities.clear();
};

// CONVERT GUI //
function convertFastGui() {
	playerState.gui.skills.points = convert.reader.next();
	const upgradeAmount = convert.reader.next();
	if(upgradeAmount > 0){
		playerState.gui.upgrades.length = 0;
		for(let i = 0; i < upgradeAmount; i++){
			playerState.gui.upgrades.push(convert.reader.next());
		}
	}

	const skillStatChanges = convert.reader.next();
	if(skillStatChanges){
		playerState.gui.skills = {};
		const skillCategoryAmount = convert.reader.next();
		for(let i = 0; i < skillCategoryAmount; i++){
			playerState.gui.skills[convert.reader.next()] = { current: convert.reader.next(), max: convert.reader.max() };
		}
	}
}

// CONVERT BROADCAST //
function convertSlowGui(data) {
	let i = 0;

	playerState.gui.minimap.length = 0;
	let minimapPoints = m[i++];
	for (let i = 0; i < minimapPoints; i++) {
		playerState.gui.minimap.push({
			x: m[i++],
			y: m[i++],
			color: m[i++],
			size: m[i++]
			// TODO: image support 
		})
	}
	
	playerState.gui.minimap.length = 0;
	let leaderboardEntries = m[i++];
	for (let i = 0; i < leaderboardEntries; i++) {
		playerState.gui.leaderboard.push({
			score: m[i++],
			name: m[i++],
			elabel: m[i++],
			color: m[i++],
			nameColor: m[i++],
		})
	}
}

// SOCKET // 
let socketInit = function () {
	return async function ag(roomId) {
		let url = "ws://localhost:3001/"
		await multiplayer.joinRoom(roomId, socket);

		let fakeWebsocket = (url, roomHost) => {
			return {
				set onmessage(v) {
					window.clientMessage = v
				},
				set onopen(v) {
					v()
				},
				send: (e) => {
					multiplayer.playerPeer.send(fasttalk.encode(e))
				}
			}
		}

		socket = fakeWebsocket(url);
		socket.binaryType = "arraybuffer";
		socket.open = 0;
		socket.controls = {
			commands: [0, 0, 0, 0, 0, 0, 0, 0],
			cache: { x: 0, y: 0, c: 0 },
			talk: function () {
				let o = 0;
				for (let i = 0; i < socket.controls.commands.length/*max 8*/; i++) if (socket.controls.commands[i]) o += Math.pow(2, i);
				let ratio = getRatio();
				let x = util._fixNumber(Math.round((global._target._x - global.player.rendershiftx) / ratio));
				let y = util._fixNumber(Math.round((global._target._y - global.player.rendershifty) / ratio));
				let c = util._fixNumber(o);
				if (socket.controls.cache.x !== x || socket.controls.cache.y !== y || socket.controls.cache.c !== c) {
					socket.controls.cache.x = x;
					socket.controls.cache.y = y;
					socket.controls.cache.c = c;
					socket.talk("C", x, y, c);
				}
			},
			reset: function () {
				socket.controls.commands = [0, 0, 0, 0, 0, 0, 0, 0];
				socket.controls.cache.x = 0;
				socket.controls.cache.y = 0;
				socket.controls.cache.c = 0;
			}
		};
		socket.talk = function (...message) {
			if (!socket.open) return 1;
			//message = Module.shuffle(message);
			global._sentPackets++
			socket.send(message);
			global._bandwidth._outbound += 1;
		};
		socket.onmessage = async function (message, parent) {
			global._bandwidth._inbound += 1;
			let m = fasttalk.decode(message);
			if (m === -1) throw new Error("Malformed packet!");
			global._receivedPackets++
			let packet = m.shift();
			let i = 0;
			switch (packet) {
				case "mu": {
					mockups.pendingMockupRequests.delete(m[0])
					if (m[1].length !== 2) {
						mockups.set(m[0], JSON.parse(m[1]))
					}
				}
					break;
				case "AA": { // Achievements and statistics
					if (m[0] === -1) {
						rewardManager.unlockAchievement(m[1]);
					} else {
						rewardManager.increaseStatistic(m[0], m[1]);
						switch (m[0]) {
							case 0:
								global._killTracker++;
								if (global._killTracker === 2) rewardManager.unlockAchievement("double_kill");
								if (global._killTracker === 3) rewardManager.unlockAchievement("triple_kill");
								if (global._killTracker === 5) rewardManager.unlockAchievement("mean_lean_killing_machine");
								setTimeout(() => global._killTracker--, 3000);
								switch (rewardManager._statistics[0]) {
									case 1: return void rewardManager.unlockAchievement("woo_you_killed_someone");
									case 5: return void rewardManager.unlockAchievement("still_single_digits");
									case 10: return void rewardManager.unlockAchievement("only_ten");
									case 50: return void rewardManager.unlockAchievement("okay_that_is_something");
									case 100: return void rewardManager.unlockAchievement("got_good");
									case 250: return void rewardManager.unlockAchievement("okay_you_are_scaring_me");
									case 500: return void rewardManager.unlockAchievement("genocide");
									case 1000: return void rewardManager.unlockAchievement("genocide_ii");
								};
								break;
							case 2:
								switch (rewardManager._statistics[2]) {
									case 1: return void rewardManager.unlockAchievement("that_was_tough");
									case 4: return void rewardManager.unlockAchievement("those_things_are_insane");
									case 15: return void rewardManager.unlockAchievement("what_in_the_world_is_a_celestial");
									case 50: return void rewardManager.unlockAchievement("boss_hunter");
									case 100: return void rewardManager.unlockAchievement("bosses_fear_me");
								};
								break;
							case 3:
								switch (rewardManager._statistics[3]) {
									case 1: return void rewardManager.unlockAchievement("polynotagon");
									case 250: return void rewardManager.unlockAchievement("polygon_hater");
									case 1000: return void rewardManager.unlockAchievement("these_polygons_gotta_go");
									case 1000000: return void rewardManager.unlockAchievement("polygont");
								};
								break;
						}
					}
				};
					break;
				case "pL": {
					global.party = m[0];
				} break;
				case "gm": {
					global.gamemodeAlteration = m[0];
				} break;
				case "R": {
					//	this.talk("R", room.width, room.height, JSON.stringify(c.ROOM_SETUP), JSON.stringify(c.CELL_SKINS), JSON.stringify(util.serverStartTime), this.player.body.label, room.speed, +c.ARENA_TYPE, c.BLACKOUT);
					window.gameStarted = true
					roomState.width = m[i++];
					roomState.height = m[i++];
					roomState.cells = JSON.parse(m[i++]);
					roomState.cellSkins = Object.assign(roomState.cellSkins, JSON.parse(m[i++]))
					serverStart = JSON.parse(m[i++]);
					i++
					i++
					//config.roomSpeed = m[5];
					roomState.mapType = m[i++] || 0;
					global._blackout = m[i++];
					logger.info("Room data recieved! Starting game...");
					global._gameStart = true;
					global.message = "";
				}
					break;
				case "r": {
					global._gameWidth = m[0];
					global._gameHeight = m[1];
					roomSetup = JSON.parse(m[2]);
					logger.info("Room data reset!");
					global._gameStart = true;
					global.message = "";
				}
					break;
				case "m": {
					global.messages.push({
						text: m[0],
						status: 2,
						alpha: 0,
						time: Date.now(),
						color: m[1] || color.black
					});
				}
					break;
				case "as":
					if (window.loadedAssets === undefined) window.loadedAssets = 0;
					window.loadingTextTooltip = `(${window.loadedAssets}/${m[0]})`
					if (m[0] !== 0) {
						await setAsset(m[1], m[2],
							{
								path2d: m[3],
								path2dDiv: m[4],
								image: m[5],
								p1: m[6],
								p2: m[7],
								p3: m[8],
								p4: m[9]
							})
						window.loadedAssets++;
						loadingScreenState.subtitle = `(${window.loadedAssets}/${m[0]})`
					}
					if (window.loadedAssets === m[0]) {
						window.assetLoadingPromise()
					}
					break;
				case "cs": {
					let arr = global.chatMessages.get(m[1])
					if (arr === undefined) {
						arr = [[m[0], performance.now()]]
						global.chatMessages.set(m[1], arr)
					} else {
						arr.push([m[0], performance.now()])
					}
					function removeChatMessage() {
						arr.shift();
						if (arr.length === 0) {
							global.chatMessages.delete(m[1])
						}
					}
					setTimeout(removeChatMessage, currentSettings.chatMessageDuration.value.number * 1000 - 50)
				}
					break;
				case "nrid": // new room id - happens bc host can dc from manager
					window.selectedRoomId = m[0]
					break;
				case "Z": {
					logger.norm(m[0]);
				}
					break;
				case "u": {
					let cam = {
						x: m[0],
						y: m[1],
						FoV: m[2]
					};
					convert.reader.set(m, 4);
					window.movementSmoothing = 1
					convert.fastGui();
					convert.lasers();
					convert.entities();
					// If the camera is slightly slower it gives the feeling that the player is moving more/faster
					// Its better if the camera is behind the real spot because it has to "react" which has a certain feel
					playerState.camera.x = lerp(playerState.camera.x, cam.x, window.movementSmoothing * .7);
					playerState.camera.y = lerp(playerState.camera.y, cam.y, window.movementSmoothing * .7);
					playerState.camera.fov = lerp(playerState.camera.fov, cam.FoV, window.movementSmoothing * .7)
					socket.controls.talk();
				}
					break;
				case "b": {
					convert.slowGui(m);
					//convert.begin(m);
					//convert.broadcast();
				}
					break;
				case "v":
					global.vignetteScalarSocket = m[0]
					global.vignetteColorSocket = m[1]
					break;
				case "closeSocket":
					multiplayer.playerPeer.destroy();
					console.log("Closed socket via packet")
					break;
				case "p": {
					doingPing = false;
					metrics._latency = global.time - lastPing;
					if (metrics._latency > 999) rewardManager.unlockAchievement("laaaaaag");
				}
					break;
				case "F": {
					let chatBox = document.getElementById("chatBox");
					if (chatBox) chatBox.remove();

					global.deathDate = new Date().toLocaleString();

					global._deathSplashChoice = Math.floor(Math.random() * global._deathSplash.length);
					let mockupname = (mockups.get(_gui._type).name || "").toLowerCase();
					if (!mockupname.includes("mothership") && !mockupname.includes("dominator")) {
						rewardManager.increaseStatistic(6, m[0]);
						if (rewardManager._statistics[6] >= 1_000_000) rewardManager.unlockAchievement("millionaire");
						if (rewardManager._statistics[6] >= 10_000_000) rewardManager.unlockAchievement("you_can_now_afford_a_lamborghini_veneno");
						if (rewardManager._statistics[6] >= 100_000_000) rewardManager.unlockAchievement("tax_collector");
						if (rewardManager._statistics[6] >= 1_000_000_000) rewardManager.unlockAchievement("billionaire");

						if (rewardManager._statistics[4] < m[0]) {
							if (m[0] >= 100_000) rewardManager.unlockAchievement("everybody_stars_somewhere");
							if (m[0] >= 750_000) rewardManager.unlockAchievement("250k_away");
							if (m[0] >= 1_000_000) rewardManager.unlockAchievement("one_million");
							if (m[0] >= 5_000_000) rewardManager.unlockAchievement("have_a_high_five");
							if (m[0] >= 10_000_000) rewardManager.unlockAchievement("10__9");
							rewardManager.increaseStatistic(4, m[0], true);
						}
						rewardManager.increaseStatistic(1, 1);
						switch (rewardManager._statistics[1]) {
							case 1:
								rewardManager.unlockAchievement("l_bozo");
								break;
							case 10:
								rewardManager.unlockAchievement("large_bozo_energy");
								break;
							case 50:
								rewardManager.unlockAchievement("okay_its_becoming_sad");
								break;
							case 100:
								rewardManager.unlockAchievement("it_became_sad");
								break;
						};
					}
					global.finalScore = Smoothbar(0);
					global.finalScore.set(m[0]);
					global.finalLifetime = Smoothbar(0);
					global.finalLifetime.set(m[1]);
					global.finalKills = [Smoothbar(0), Smoothbar(0), Smoothbar(0)];
					global.finalKills[0].set(m[2]);
					global.finalKills[1].set(m[3]);
					global.finalKills[2].set(m[4]);
					global.finalKillers = [];
					for (let i = 0; i < m[5]; i++) global.finalKillers.push(m[6 + i]);
					global._died = true;
					global._deathScreenState = 0
					global._diedAt = Date.now() + 3e3;
					if (mockups.get(_gui._type).name === "Basic") rewardManager.increaseStatistic(9, 1);
					if (rewardManager._statistics[9] > 49) rewardManager.unlockAchievement("there_are_other_classes_too");
				}
					break;
				case "P": {
					global._disconnectReason = m[0];
					if (m[0] === "The arena has closed. Please try again later once the server restarts.") {
						global._arenaClosed = true;
						rewardManager.unlockAchievement("the_end_of_time")
						global.closingSplash = m[1] || "";
					}
					socket.onclose({});
				}
					break;
				case "pepperspray":
					global.player.pepperspray.apply = m[0];
					global.player.pepperspray.blurMax = m[1];
					break;
				case "lsd":
					global.player.lsd = m[0];
					break;
				case "displayText": {
					global.displayTextUI.enabled = m[0];
					if (m[0]) {
						global.displayTextUI.text = m[1].toString()
						global.displayTextUI.color = m[2].toString()
					}
				}
					break;
				case "am":
					_anims.clear();
					while (i < m.length) {
						const prev = _anims.get(m[i]);
						const arr = prev || [];
						if (!prev) _anims.set(m[i], arr)
						i++;

						const readValue = () => {
							const val = m[i++];
							return val === ASSET_MAGIC ? loadAsset(ASSET_MAGIC, m[i++]) : val;
						};

						arr.push({
							index: m[i++],
							size: m[i++],
							x: m[i++],
							y: m[i++],
							angle: m[i++],
							layer: m[i++],
							shape: readValue(),
							color: readValue()
						})
					}
					break;
				case "da":
					metrics._serverCpuUsage = m[0]
					metrics._serverMemUsage = m[1]
					mockups.totalMockups = m[2]
					break;
				default:
					throw new Error("Unknown message index!" + packet);
			}
		};
		socket.onopen = function () {
			socket.open = 1;
			global.message = "Please wait while a connection attempt is being made.";
			socket.talk("k", currentSettings.networkProtocolVersion.value.number, document.getElementById("tokenInput").value || "", 0, "its local", false);
			logger.info("Token submitted to the server for validation.");
			socket.ping = function () {
				if (window.doingPing === true) return;
				socket.talk("p");
			};
			logger.info("Socket open.");
		};
		socket.onclose = function (e) {
			socket.open = 0;
			global._disconnected = 1;
			console.log("Socket closed.", `\n
                    REASON: ${e.reason}
                    WAS_CLEAN: ${e.wasClean}
                    CODE: ${e.code}
                `);
			global.message = global._disconnectReason;
		};
		socket.onerror = function (error) {
			console.error("Socket error:", `error`);
			global.message = "A socket error occurred. Maybe check your internet connection and reload?";
		};
		return socket;
	};
}();

const makeSocket = async (arg) => { return socket = await socketInit(arg) }

export { socket, makeSocket }