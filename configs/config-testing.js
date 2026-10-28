module.exports = {
    "maxPlayers": 30,
    "BETA": 1,
    "serverName": "Developer Server",
    "testingMode": true,
    "MODE": "tdm",
    "TEAM_AMOUNT": 2,
    "SPAWN_DOMINATORS": true,
    "WIDTH": 4500,
    "HEIGHT": 4500,
    "ROOM_SETUP": [
        ["por1", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "por2"],
        ["n_b1", "bad1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bad2", "n_b2"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["n_b2", "bad2", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bad1", "n_b1"],
        ["por2", "n_b2", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "n_b1", "por1"]
    ],
    "X_GRID": 20,
    "Y_GRID": 20,
    "PORTALS": {
        "ENABLED": true,
        "THRESHOLD": 500,
        "LAUNCH_FORCE": 500,
        "GRAVITY": 20000,
        "DIVIDER_1": {
            "ENABLED": false,
            "LEFT": 4860,
            "RIGHT": 5940
        },
        "DIVIDER_2": {
            "ENABLED": false,
            "LEFT": 4860,
            "RIGHT": 5940
        }
    },
    MAZE: {
        ENABLED: true,
        cellSize: 150,
        stepOneSpacing: 3,
        fillChance: 0.33,
        sparedChance: 0.65,
        cavey: false,
        lineAmount: false,
        margin: 0,
        posMulti: 0.25
    },
}
