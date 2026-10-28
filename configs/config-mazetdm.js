const teams = (Math.random() * 3 | 0) + 2;
const mapType = (Math.random() * 4) | 0;
let map = {
    "MODE": "tdm",
    "serverName": `Maze RandTDM`,
    "TEAM_AMOUNT": teams,
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
    "ROOM_SETUP": (function() {
        const output = mapConfig.setup({
            width: 16,
            height: 16,
            rockScatter: 0
        });
        const bases = mapConfig.getBaseShuffling(teams);
        switch (mapType) {
            case 0: {
                output.isOpen = true;
            } break;
            case 1: {
                output[0][0] = mapConfig.id(bases[0], 0, 1);
                output[0][1] = output[1][0] = mapConfig.id(bases[0], 1, 1);
                output[0][15] = mapConfig.id(bases[1], 0, 1);
                output[0][15 - 1] = output[1][15] = mapConfig.id(bases[1], 1, 1);
                output[15][15] = mapConfig.id(bases[2], 0, 1);
                output[15][15 - 1] = output[15 - 1][15] = mapConfig.id(bases[2], 1, 1);
                output[15][0] = mapConfig.id(bases[3], 0, 1);
                output[15][1] = output[15 - 1][0] = mapConfig.id(bases[3], 1, 1);
            } break;
            case 2: {
                // Team 1
                output[6][0] = output[9][0] = mapConfig.id(bases[0], 0, 1);
                output[7][0] = output[8][0] = mapConfig.id(bases[0], 1, 1);
                // Team 2
                output[6][15] = output[9][15] = mapConfig.id(bases[1], 0, 1);
                output[7][15] = output[8][15] = mapConfig.id(bases[1], 1, 1);
                // Team 3
                output[0][6] = output[0][9] = mapConfig.id(bases[2], 0, 1);
                output[0][7] = output[0][8] = mapConfig.id(bases[2], 1, 1);
                // Team 4
                output[15][6] = output[15][9] = mapConfig.id(bases[3], 0, 1);
                output[15][7] = output[15][8] = mapConfig.id(bases[3], 1, 1);
            } break;
            case 3: {
                // Team 1
                output[3][4] = output[4][3] = output[4][4] = mapConfig.id(bases[0], 1, 1);
                output[3][3] = mapConfig.id(bases[0], 0, 1);
                // Team 2
                output[12][11] = output[11][12] = output[11][11] = mapConfig.id(bases[1], 1, 1);
                output[12][12] = mapConfig.id(bases[1], 0, 1);
                // Team 3
                output[3][11] = output[4][12] = output[4][11] = mapConfig.id(bases[2], 1, 1);
                output[3][12] = mapConfig.id(bases[2], 0, 1);
                // Team 4
                output[11][3] = output[12][4] = output[11][4] = mapConfig.id(bases[3], 1, 1);
                output[12][3] = mapConfig.id(bases[3], 0, 1);
            } break;
        }
        return output;
    })(),
    "X_GRID": 16,
    "Y_GRID": 16,
    "FOOD_AMOUNT": 0.0334
};
map