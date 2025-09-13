import { global } from "./global.js";
import { PeerWrapper } from "./peer.js";

window.connectedToWRM = false

const WRM = window.location.host==="localhost"?"localhost":"woomy-2rbx.onrender.com"
const wsUrl = window.location.protocol === "http:" ? "ws://" : "wss://"
const httpUrl = window.location.protocol === "http:" ? "http://" : "https://"
const WRM_WS = `${wsUrl}${WRM}`
const WRM_HTTP = `${httpUrl}${WRM}`

const multiplayer = {
	roomWs: undefined,
	roomPeers: new Map(),
	hostRoomId: undefined,
	playerPeer: undefined,
	playerWs: undefined,
}
multiplayer.wrmHost = async function () {
	this.roomWs = new WebSocket(`${WRM_WS}/host`)
	let openPromise = new Promise((res, rej) => {
		this.roomWs.onopen = () => {
			console.log("Room socket opened with room manager")
			res()
		}
		this.roomWs.onerror = (err) => {
			console.log("Error opening room socket to room manager")
			rej(err)
		}
	})
	this.roomWs.onmessage = async (msg) => {
		try {
			const { type, data } = JSON.parse(msg.data)
			switch (type) {
				// Add timeout if its a fake request
				case "playerJoin":
					console.log("Accepting new peer connection")
					let peer = new PeerWrapper(await window.iceServers.fetchTurnCredentials())
					console.log("Initializing new peer connection")
					await peer.initialized;
					console.log("New peer connection initialized")
					peer.connectTo(data);
					console.log("Connecting to new peer")
					await peer.ready
					console.log("Connected to new peer")
					this.roomPeers.set(peer.id, peer)
					window.serverWorker.postMessage({ type: "playerJoin", playerId: peer.id })
					peer.onclose = () => {
						window.serverWorker.postMessage({ type: "playerDc", playerId: peer.id })
						this.roomPeers.delete(peer.id)
					}
					peer.onmessage = (msg) => {
						window.serverWorker.postMessage({ type: "serverMessage", data: [peer.id, msg] })
					}
					break;
				case "hostRoomId":
					this.hostRoomId = data
					break;
				case "ping":
					this.roomWs.send(JSON.stringify({ping:true}))
					break;
			}
		} catch (err) {
			console.error(err)
		}
	}
	this.roomWs.onclose = async () => {
		console.log("Room socket closed with room manager. Retrying in 5 seconds.")
		this.hostRoomId = undefined
		setTimeout(async ()=>{
			console.log("Retrying WRM connection...")
			await multiplayer.wrmHost();
			await multiplayer.getHostRoomId();
		}, 5000)
	}
	return openPromise
}
multiplayer.getHostRoomId = async function(){
	console.log("Waiting for host room id...")
	return new Promise((res, rej)=>{
		// I know it sucks
		// but its easier this way
		let interval = setInterval(()=>{
			if(!this.hostRoomId) return;
			res(this.hostRoomId)
			clearInterval(interval)
			console.log("...Got host room id")
			window.serverWorker.postMessage({
				type: "roomId",
				id: this.hostRoomId
			})
		})
	})
}
multiplayer.joinRoom = async function (roomId, socket) {
	this.playerPeer = new PeerWrapper(await window.iceServers.fetchTurnCredentials())
	window.loadingTextStatus = "Initalizing connection..."
    window.loadingTextTooltip = ""
	console.log("Initialzing player peer")
	await this.playerPeer.initialized;
	console.log("Player peer initalized")
    window.loadingTextStatus = "Establishing connection..."
    window.loadingTextTooltip = ""
	console.log("Sending join request...")
	let res = await fetch(`${WRM_HTTP}/api/join`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			roomId: roomId,
			peerId: this.playerPeer.id
		})
	})
	let resText = await res.text();
	if(!res.ok){
    	window.loadingTextStatus = "Connection Failed"
    	window.loadingTextTooltip = "Please reload your tab"
		alert(`${resText}\nYour tab will now reload`)
		window.location.href = window.location.href;
		return;
	}
	console.log("...Join request sent", res)
	await this.playerPeer.ready
	this.playerPeer.onmessage = (msg) => { 
		if(window.clientMessage) window.clientMessage(msg)
	}
	this.playerPeer.onclose = function(){
		global._disconnected = 1;
		global.message = global._disconnectReason = "The host has left the game"
	}
}
multiplayer.getRooms = async function (){
	let res = await fetch(`${WRM_HTTP}/api/list`)
	res = await res.json()
	return res;
}
multiplayer.startServerWorker = async function (gamemodeCode, displayNameOverride, displayDescOverride) {
	window.serverWorker.postMessage({
		type: "startServer",
		server: {
			suffix: gamemodeCode,
			displayName: displayNameOverride,
			displayDesc: displayDescOverride
		}
	});
	let startPromise = new Promise((res, rej) => {
		window.serverWorker.onmessage = function (msgEvent) {
			const data = msgEvent.data;
			switch (data.type) {
				case "serverStarted":
					res();
					break;
				case "clientMessage":
					let peer = multiplayer.roomPeers.get(data.playerId);
					if(!peer){
						console.error(`Peer ${data.playerId} does not exist`)
						return;
					}
					peer.send(data.data);
					break;

				case "updatePlayers":
					// WRM, RoomUpdatePlayers
					if(multiplayer.roomWs === undefined || multiplayer.roomWs.readyState !== 1) return
					multiplayer.roomWs.send(JSON.stringify({
						players: data.players,
						name:  data.name||gamemodeCode,
						desc: data.desc
					}))
					break;
				case "serverStartText":
					window.loadingTextStatus = data.text
					window.loadingTextTooltip = data.tip
					break;
			}
		};
	})
	return startPromise
}

export { multiplayer }
