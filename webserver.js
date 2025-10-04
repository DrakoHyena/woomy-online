// =================================================================
// 1. DEPENDENCIES - All requires from both servers
// =================================================================
const http = require("http");
const wsLib = require("ws");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require('node:crypto'); // <<< ADDED for TURN credentials

const PORT = 80;

// =================================================================
// <<< ADDED: TURN Server Configuration >>>
// =================================================================
// IMPORTANT: This MUST be the same secret key you set as 'static-auth-secret' in your turnserver.conf
const TURN_SECRET = process.env.TURN_SECRET||"";

// IMPORTANT: Set this to the public IP or domain of your TURN server
const TURN_SERVER_URI = process.env.TURN_SERVER_URL||"turn:127.0.0.1:3048";

// Docker should auto fill process.env..
if(TURN_SECRET === "" || TURN_SERVER_URI === "turn:127.0.0.1:3048"){
	console.warn(`[CRITICAL WARNING] Invalid or missing TURN_SECRET (${TURN_SECRET}) or TURN_SERVER_URI (${TURN_SERVER_URI})`)
}

// =================================================================
// 2. SERVER A LOGIC - Room Management and WebSockets
// =================================================================

const rooms = new Map();

function genCode() {
	let str = `${Date.now()}`;
	str = str.substring(str.length - 5);
	str += Math.random() * 1000 | 0;
	str += "0".repeat(8 - str.length);
	return Number(str).toString(16);
}

class Room {
	constructor(ws) {
		this.ws = ws;
		this.id = genCode();
		this.gamemodeCode = "4tdm.json";
		this.players = 1;
		rooms.set(this.id, this);
	}
	removeFromRooms() {
		console.log(`Room ${this.id} closed.`);
		rooms.delete(this.id);
	}
}

// <<< ADDED: Function to generate temporary TURN credentials
function getTurnCredentials(username) {
  // Credentials will be valid for 1 hour (3600 seconds)
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const turnUsername = `${expiry}:${username}`;

  // Create the HMAC-SHA1 signature (the temporary password) using the shared secret
  const hmac = crypto.createHmac('sha1', TURN_SECRET);
  hmac.update(turnUsername);
  const password = hmac.digest('base64');

  return {
    username: turnUsername,
    password: password, // The client-side property is 'credential'
    urls: [TURN_SERVER_URI]
  };
}


// =================================================================
// 3. COMBINED SERVER CREATION
// =================================================================

// The main request handler that decides what to do with each request
const handleRequest = (req, res) => {
	const pathname = req.url?.split('?')[0] || '/';

	console.log(`[Request] ${req.method} ${pathname}`);

	// --- API ROUTING (from Server A) ---
	if (pathname.startsWith("/api/")) {
		// Set CORS headers for all API responses
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");

		if (req.method === "OPTIONS") {
			res.writeHead(204); // No Content
			res.end();
			return;
		}

		if (pathname === "/api/list") {
			res.writeHead(200, { "Content-Type": "application/json" });
			const list = [];
			for (let [id, room] of rooms) {
				list.push({ id: id, gamemodeCode: room.gamemodeCode, desc: room.desc||"", players: room.players });
			}
			res.end(JSON.stringify(list));
			return;

		} else if (pathname === "/api/join") {
			if (req.method !== "POST") {
				res.writeHead(405, { "Content-Type": "text/plain" });
				res.end("Invalid method. Use POST.");
				return;
			}
			let body = "";
			req.on("data", chunk => body += chunk);
			req.on("end", () => {
				try {
					const { roomId, peerId } = JSON.parse(body);
					if (!peerId) {
						res.writeHead(400, { "Content-Type": "text/plain" });
						res.end("You must include a peerID when joining");
						return;
					}
					const room = rooms.get(roomId);
					if (!room) {
						res.writeHead(404, { "Content-Type": "text/plain" });
						res.end("That room doesn't exist.");
						return;
					}
					room.ws.send(JSON.stringify({ type: "playerJoin", data: peerId }));
					res.writeHead(200, { "Content-Type": "text/plain" });
					res.end("Join request sent to host.");
				} catch (err) {
					console.error("Error in /api/join:", err);
					res.writeHead(500, { "Content-Type": "text/plain" });
					res.end("Internal server error.");
				}
			});
			return;

		} else if (pathname === "/api/status") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "Room Manager is running" }));
            return;

        // <<< ADDED: The new API endpoint for TURN credentials
		} else if (pathname === "/api/get-turn-credentials") {
            // Generate a temporary, random username for this session
            const username = 'user-' + crypto.randomBytes(6).toString('hex');
            const credentials = getTurnCredentials(username);
            
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(credentials));
            return;
        }
	}

	// --- STATIC FILE SERVING (from Server B) ---
	const requestedPath = pathname === '/' ? '/client/index.html' : pathname;
	const filePath = path.join(__dirname, requestedPath);

	if (!filePath.startsWith(__dirname)) {
		res.writeHead(403, { 'Content-Type': 'text/plain' });
		res.end('Forbidden');
		return;
	}

	fs.readFile(filePath, (err, data) => {
		if (err) {
			if (err.code === 'ENOENT') {
				const clientFilePath = path.join(__dirname, 'client', pathname);
				if (filePath !== clientFilePath) {
					fs.readFile(clientFilePath, (clientErr, clientData) => {
						if (clientErr) {
							res.writeHead(404, { 'Content-Type': 'text/plain' });
							res.end('Not Found');
						} else {
							sendFile(res, clientFilePath, clientData);
						}
					});
				} else {
					res.writeHead(404, { 'Content-Type': 'text/plain' });
					res.end('Not Found');
				}
			} else {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end(`Server Error: ${err.message}`);
			}
		} else {
			sendFile(res, filePath, data);
		}
	});
};

function sendFile(res, filePath, data) {
	const ext = path.extname(filePath);
	let contentType = 'text/plain';
	const mimeTypes = {
		'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
		'.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
		'.gif': 'image/gif', '.svg': 'image/svg+xml',
	};
	contentType = mimeTypes[ext] || contentType;
	res.writeHead(200, { 'Content-Type': contentType });
	res.end(data);
}

const server = http.createServer(handleRequest);


// =================================================================
// 4. WEBSOCKET SERVER ATTACHMENT
// =================================================================

const wss = new wsLib.WebSocketServer({ server, maxPayload: 1024 * 1024 });

wss.on('connection', function connection(ws, req) {
	const type = req.url.split("/")[1];
	console.log(`[WebSocket] Connection attempt for type: ${type}`);

	switch (type) {
		case "host":
			let room = new Room(ws);
			console.log(`New room hosted with ID: ${room.id}`);

			function sendHeartbeat(){
				if(ws.readyState !== 1){
					console.log(`Failed to send hearbeat to room ${room.id} (readyState = ${ws.readyState})`)
				}else{
					ws.send(JSON.stringify({type:"ping"}))
					setTimeout(sendHeartbeat, 30000)
				}
			}
			sendHeartbeat()


			ws.on("close", room.removeFromRooms.bind(room));
			ws.on("message", (msg) => {
				try {
					const { players, name, desc, ping } = JSON.parse(msg.toString());
					if (ping === true) return;
					if (players !== undefined) room.players = Number(players) || 0;
					if (name) room.gamemodeCode = `${name}`.substring(0, 25);
					if (desc) room.desc = `${desc}`.substring(0, 350);
				} catch (err) {
					console.log("Error updating room information:", err);
				}
			});

			ws.send(JSON.stringify({ type: "hostRoomId", data: room.id }));
			break;
		default:
			console.log(`[WebSocket] Unknown connection type "${type}". Terminating.`);
			ws.terminate();
			break;
	}
});


// =================================================================
// 5. START THE SERVER
// =================================================================

server.listen(PORT, () => {
	console.log(`🚀 Combined server running on ${PORT}`);
	console.log(`   - Serving static files from: ${path.join(__dirname, 'client')}`);
	console.log(`   - API endpoints available at /api/*`);
    console.log(`   - WebSocket connections available for hosts at /host`);
});