import { ClientEntity } from "../../entity.js";

const playerState = {
	name: "",
	socketName: [],
	gameName: "",
	camera: {
		x: 0,
		y: 0,
		fov: 1,
	},
	gui: {
		minimap: [],
		leaderboard: [],
		upgrades: [],
		skills: {
			points: 0
		},
		disconnect: {
			title: "Disconnected For An Unknown Reason",
			subtitle: "Try rejoining or joining a different room."
		}
	},
	entity: new ClientEntity(),
	entityId: -1,
}

export { playerState }