import { ASSET_MAGIC, loadAsset } from "../../shared/assets.js";
import { socket } from "./socket.js";

let mockups = {
	// Statistics
	totalMockups: 0,
	fetchedMockups: 0,

	// Data handling
	mockupData: new Map(),
	pendingMockupRequests: new Set(),
	get: (entityIndex, doExtraSeek = true) => {
		let entity = mockups.mockupData.get(entityIndex)
		if (entity) {// We have the entity
			return entity
		} else if (mockups.pendingMockupRequests.has(entityIndex)) {// We are getting the entity
			return mockups.defaults
		} else { // We need to queue the entity
			if (navigator?.connection?.downlink > 3.5 && doExtraSeek) {
				/* 
				Extra seek helps with animation tanks because not 100% of the frames are actually sent
				This also helps with loading stuff in general, however you are downloading 5x more data than you really need to.
				Because of that we should only do this if the user has better than 3.5mbs internet.
				Downlink is somewhat supported but its better to be safe than sorry.
				*/
				for (let i = -3; i < 3; i++) {
					mockups.get(entityIndex + i, false)
				}
			} else {
				mockups.pendingMockupRequests.add(entityIndex)
				socket.talk("mu", entityIndex)
			}
			return mockups.defaults
		}
	},
	set: (entityIndex, data) => {
		mockups.fetchedMockups++
		mockups.mockupData.set(entityIndex, mockups.applyDefaults(data))
	},

	// Defaults
	defaults: {
		isLoading: true,
		name: "Loading..",
		x: 0,
		y: 0,
		color: 16,
		shape: 0,
		size: 1,
		realSize: 1,
		facing: 0,
		layer: 0,
		statnames: 0,
		defaultArrayLength: 0,
		aspect: 1,
		skin: 0,
		colorUnmix: 0,
		angle: 0,
		position: {
			middle: {
				x: 0,
				y: 0,
			},
			axis: 0
		},
		guns: [],
		turrets: [],
		lasers: [],
		props: []
	},
	applyDefaults: (data) => {
		function cleanUpDefaults(rawMockup) {
			if(rawMockup.shape._assetMagic === ASSET_MAGIC){
				rawMockup.shape = loadAsset(ASSET_MAGIC, rawMockup.shape.id)
			}
			if (typeof rawMockup.shape === 'string') {
				try {
					// Store the Path2D object directly
					rawMockup.shape = new Path2D(rawMockup.shape);
				} catch (e) {
					console.error("Failed to parse Path2D string:", rawMockup.shape, e);
					// Fallback or mark as invalid shape
					rawMockup.shape = 0; // Default to circle or another safe shape
				}
			}
			// Recursively process guns and their shapes
			for(let i = 0; i < rawMockup.guns.length; i++){
				rawMockup.guns[i].color = rawMockup.guns[i].color?._assetMagic?loadAsset(rawMockup.guns[i].color._assetMagic, rawMockup.guns[i].color.id):rawMockup.guns[i].color
			}

			// Recursively process turrets and their shapes
			if (rawMockup.turrets) {
				rawMockup.turrets = rawMockup.turrets.map(cleanUpDefaults);
			}
			// Process prop shapes if they are strings
			if (rawMockup.props) {
				rawMockup.props = rawMockup.props.map(p => {
					if(p.color._assetMagic === ASSET_MAGIC){
						p.color = loadAsset(ASSET_MAGIC, p.color.id)
					}
					if (p.shape._assetMagic === ASSET_MAGIC){
						p.shape = loadAsset(ASSET_MAGIC, p.shape.id)
					}
					if (typeof p.shape === 'string') {
						try {
							p.shape = new Path2D(p.shape);
						} catch (e) {
							console.error("Failed to parse Prop Path2D string:", p.shape, e);
							p.shape = 0; // Fallback
						}
					}
					return p;
				});
			}
			return rawMockup;
		}
		data.turrets = (data.turrets || []).map(mockups.applyDefaults);
		for (const key in mockups.defaults) {
			if (data[key] == null) {
				data[key] = mockups.defaults[key];
			}
		}
		return cleanUpDefaults(data);
	},
};

window.sendMockupEdit = (code) => {
	if (socket === null) {
		throw new Error("You need to be in a game to edit mockups!")
	}
	socket.talk("muEdit", code)
}

function getEntityImageFromMockup(index, color) {
	let mockup = mockups.get(index);
	if (!mockup) throw new Error("Failed to find mockup " + index);
	color = mockup.color == null || mockup.color === 16 ? arguments[1] : mockup.color;
	return {
		time: 0,
		index: index,
		x: mockup.x,
		y: mockup.y,
		vx: 0,
		vy: 0,
		size: mockup.size,
		widthHeightRatio: [1, 1],
		realSize: mockup.realSize,
		color: color,
		render: {
			real: false,
			size: mockup.size,
			extra: [1.75, 0],
			status: {
				getFade: function () {
					return 1;
				},
				getColor: function () {
					return "#FFFFFF";
				},
				getBlend: function () {
					return 0;
				},
				health: {
					get: function () {
						return 1;
					}
				},
				shield: {
					get: function () {
						return 1;
					}
				}
			}
		},
		facing: mockup.facing,
		shape: mockup.shape,
		name: mockup.name,
		score: 0,
		tiggle: 0,
		layer: mockup.layer,
		guns: {
			length: mockup.guns.length,
			getPositions: function () {
				let a = [];
				mockup.guns.forEach(function () {
					return a.push(0);
				});
				return a;
			},
		},
		turrets: mockup.turrets.map(function (t) {
			let o = getEntityImageFromMockup(t.index);
			o.realSize = o.realSize / o.size * mockup.size * t.sizeFactor;
			o.size = mockup.size * t.sizeFactor;
			o.angle = t.angle;
			o.offset = t.offset;
			o.direction = t.direction;
			o.facing = t.direction + t.angle;
			return o;
		}),
		lasers: {
			length: mockup.lasers.length
		},
		props: {
			length: mockup.props.length
		}
	};
}

export { mockups, getEntityImageFromMockup }