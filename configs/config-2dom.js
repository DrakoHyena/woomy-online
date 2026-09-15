const catch22 = 21 / 27;
const maps = [{
    "mapName": "Standard",
    "WIDTH": 5750,
    "HEIGHT": 5750,
    "MODE": "tdm",
    "serverName": "2 TDM Domination",
    "TEAM_AMOUNT": 2,
    "SPAWN_DOMINATORS": true,
    "ROOM_SETUP": [
        ["bas1", "n_b1", "norm", "norm", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "rock"],
        ["n_b1", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "roid", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "domi", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "domi", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "rock", "nest", "rock", "roid", "rock", "nest", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "rock", "nest", "rock", "norm", "rock", "nest", "rock", "norm", "norm", "norm", "norm"],
        ["roid", "norm", "roid", "norm", "roid", "nest", "norm", "domi", "norm", "nest", "roid", "norm", "roid", "norm", "roid"],
        ["norm", "norm", "norm", "norm", "rock", "nest", "rock", "norm", "rock", "nest", "rock", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "rock", "nest", "rock", "roid", "rock", "nest", "rock", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "domi", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "domi", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "roid", "n_b2"],
        ["rock", "norm", "norm", "norm", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "norm", "norm", "n_b2", "bas2"]
    ],
    "X_GRID": 15,
    "Y_GRID": 15,
    "BOTS": 25
}, {
    "mapName": "Frontline - Fourche7",
    "WIDTH": 5750,
    "HEIGHT": 5750,
    "MODE": "tdm",
    "serverName": "2 TDM Domination",
    "TEAM_AMOUNT": 2,
    "SPAWN_DOMINATORS": true,
    "ROOM_SETUP": [
        ["n_b1", "norm", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "norm", "n_b2"],
        ["bas1", "norm", "norm", "norm", "rock", "domi", "rock", "norm", "norm", "norm", "bas2"],
        ["n_b1", "norm", "norm", "rock", "rock", "roid", "rock", "rock", "norm", "norm", "n_b2"],
        ["n_b1", "norm", "rock", "rock", "rock", "nest", "rock", "rock", "rock", "norm", "n_b2"],
        ["n_b1", "rock", "rock", "rock", "rock", "roid", "rock", "rock", "rock", "rock", "n_b2"],
        ["bas1", "rock", "rock", "rock", "rock", "domi", "rock", "rock", "rock", "rock", "bas2"],
        ["n_b1", "rock", "rock", "rock", "rock", "roid", "rock", "rock", "rock", "rock", "n_b2"],
        ["n_b1", "norm", "rock", "rock", "rock", "nest", "rock", "rock", "rock", "norm", "n_b2"],
        ["n_b1", "norm", "norm", "rock", "rock", "roid", "rock", "rock", "norm", "norm", "n_b2"],
        ["bas1", "norm", "norm", "norm", "rock", "domi", "rock", "norm", "norm", "norm", "bas2"],
        ["n_b1", "norm", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "norm", "n_b2"]
    ],
    "X_GRID": 11,
    "Y_GRID": 11,
    "BOTS": 25
}, {
    "mapName": "Catch22 - Fourche7",
    "WIDTH": 8750,
    "HEIGHT": 8750 * catch22,
    "MODE": "tdm",
    "serverName": "2 TDM Domination",
    "TEAM_AMOUNT": 2,
    "SPAWN_DOMINATORS": true,
    "PORTALS": {
        "ENABLED": true,
        "THRESHOLD": 500,
        "LAUNCH_FORCE": 500,
        "GRAVITY": 20000,
        "DIVIDER_1": {
            "ENABLED": false
        },
        "DIVIDER_2": {
            "ENABLED": false
        }
    },
    "ROOM_SETUP": [
        ["port", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "port"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "domi", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "domi", "norm", "norm", "norm", "norm", "norm", "bas1", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "bas2", "norm", "norm", "norm", "norm", "norm", "domi", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "domi", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["port", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "port"]
    ],
    "X_GRID": 27,
    "Y_GRID": 21,
    "BOTS": 25
}];
maps[Math.random() * maps.length | 0];