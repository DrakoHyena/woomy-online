const teams = (Math.random() * 3 | 0) + 2;
const mapType = (Math.random() * 4) | 0;
let map = {
    "MODE": "tdm",
    "serverName": `Cave RandTDM`,
    "TEAM_AMOUNT": teams,
    MAZE: {
        ENABLED: true,
        cellSize: 100,
        stepOneSpacing: 4,
        fillChance: 0.435,
        sparedChance: 0.2,
        cavey: true,
        lineAmount: 2,
        margin: 0,
        posMulti: 0.25
    },
    "WIDTH": 7500,
    "HEIGHT": 7500,
    "PLAYER_SPAWN_TILES": mapType===0?["nest", "roid"]:undefined,
    "ROOM_SETUP": (function() {
        const output = [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "roid", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "norm", "norm", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "norm", "norm", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "roid", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"]
        ]
        const bases = mapConfig.getBaseShuffling(teams);
        switch (mapType) {
            case 0: {
                output.isOpen = true;
            } break;
            case 1: {
                output[0][0] = mapConfig.id(bases[0], 0, 1);
                output[0][1] = output[1][0] = mapConfig.id(bases[0], 1, 1);
                output[0][17] = mapConfig.id(bases[1], 0, 1);
                output[0][17 - 1] = output[1][17] = mapConfig.id(bases[1], 1, 1);
                output[17][17] = mapConfig.id(bases[2], 0, 1);
                output[17][17 - 1] = output[17 - 1][17] = mapConfig.id(bases[2], 1, 1);
                output[17][0] = mapConfig.id(bases[3], 0, 1);
                output[17][1] = output[17 - 1][0] = mapConfig.id(bases[3], 1, 1);
            } break;
            case 2: {
                // Team 1
                output[6][0] = output[9][0] = mapConfig.id(bases[0], 0, 1);
                output[7][0] = output[8][0] = mapConfig.id(bases[0], 1, 1);
                // Team 2
                output[6][17] = output[9][17] = mapConfig.id(bases[1], 0, 1);
                output[7][17] = output[8][17] = mapConfig.id(bases[1], 1, 1);
                // Team 3
                output[0][6] = output[0][9] = mapConfig.id(bases[2], 0, 1);
                output[0][7] = output[0][8] = mapConfig.id(bases[2], 1, 1);
                // Team 4
                output[17][6] = output[17][9] = mapConfig.id(bases[3], 0, 1);
                output[17][7] = output[17][8] = mapConfig.id(bases[3], 1, 1);
            } break;
            case 3: {
                // Team 1
                output[3][4] = output[4][3] = output[4][4] = mapConfig.id(bases[0], 1, 1);
                output[3][3] = mapConfig.id(bases[0], 0, 1);
                // Team 2
                output[14][13] = output[13][14] = output[13][13] = mapConfig.id(bases[1], 1, 1);
                output[14][14] = mapConfig.id(bases[1], 0, 1);
                // Team 3
                output[3][13] = output[4][14] = output[4][13] = mapConfig.id(bases[2], 1, 1);
                output[3][14] = mapConfig.id(bases[2], 0, 1);
                // Team 4
                output[13][3] = output[14][4] = output[13][4] = mapConfig.id(bases[3], 1, 1);
                output[14][3] = mapConfig.id(bases[3], 0, 1);
            } break;
        }
        return output;
    })(),
    "X_GRID": 18,
    "Y_GRID": 18,
    "FOOD_AMOUNT": 0.0334
};
map