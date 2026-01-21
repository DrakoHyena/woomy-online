const roomState = {
	roomId: "Loading...",
	serverTargetMs: 30,
	width: 1,
	height: 1,
	mapType: 0,
	gridSize: 15,
	cells: [[]],
	cellSkins: {
		default: {
			assets: ["defaultCellSkin1", "defaultCellSkin2", "defaultCellSkin3", "defaultCellSkin4", "defaultCellSkin5"],
			frameInterval: 75,
			repeat: false,
			stretch: true
		}
	},
	blackout: false,
	propAnimations: new Map()
}

export { roomState };