
const teams = Math.random() > .575 ? 4 : 2;

const twoBrothers = teams === 2 && Math.random() > .9;

let map = {
    "MODE": "tdm",
    "serverName": teams + " TDM",
    "TEAM_AMOUNT": teams,
    "ROOM_SETUP": twoBrothers ? [
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "norm"],
        ["norm", "n_b1", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "n_b2", "norm"],
        ["norm", "n_b1", "n_b1", "norm", "norm", "norm", "norm", "norm", "norm", "n_b2", "n_b2", "norm"],
        ["norm", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"]
    ] : (function() {
            const base = mapConfig.setup({
            width: 12,
            height: 12,
            rockScatter: .3,
            nestWidth: 0,
            nestHeight: 0
        });
        // Draw nest
        for (let i = 4; i <= 7; i ++) {
            //base[i][4] = base[4][i] = base[8 - i][4] = base[4][8 - i] = "nest";
            base[4][i] = base[i][4] = base[7][i] = base[i][7] = "nest";
        }
            const bases = mapConfig.getBaseShuffling(teams);
        if (Math.random() > .667) {
            // Team 1
            base[0][4] = base[0][7] = mapConfig.id(bases[0], 0);
            base[0][2] = base[0][3] = base[0][5] = base[0][6] = base[0][8] = base[0][9] = mapConfig.id(bases[0], 1);
            // Team 2
            base[4][0] = base[7][0] = mapConfig.id(bases[1], 0);
            base[2][0] = base[3][0] = base[5][0] = base[6][0] = base[8][0] = base[9][0] = mapConfig.id(bases[1], 1);
            // Team 3
            base[11][4] = base[11][7] = mapConfig.id(bases[2], 0);
            base[11][2] = base[11][3] = base[11][5] = base[11][6] = base[11][8] = base[11][9] = mapConfig.id(bases[2], 1);
            // Team 4
            base[4][11] = base[7][11] = mapConfig.id(bases[3], 0);
            base[2][11] = base[3][11] = base[5][11] = base[6][11] = base[8][11] = base[9][11] = mapConfig.id(bases[3], 1);
        } else if (Math.random() > .5) {
            // Team 1
            base[0][0] = mapConfig.id(bases[0], 0);
            base[0][1] = base[0][2] = base[1][0] = base[2][0] = mapConfig.id(bases[0], 1);
            // Team 2
            base[11][0] = mapConfig.id(bases[1], 0);
            base[11][1] = base[11][2] = base[10][0] = base[9][0] = mapConfig.id(bases[1], 1);
            // Team 3
            base[11][11] = mapConfig.id(bases[2], 0);
            base[11][10] = base[11][9] = base[10][11] = base[9][11] = mapConfig.id(bases[2], 1);
            // Team 4
            base[0][11] = mapConfig.id(bases[3], 0);
            base[0][10] = base[0][9] = base[1][11] = base[2][11] = mapConfig.id(bases[3], 1);
        } else {
            // Team 1
            base[0][0] = mapConfig.id(bases[0], 0);
            base[0][1] = base[1][0] = base[1][1] = mapConfig.id(bases[0], 1);
            // Team 2
            base[11][11] = mapConfig.id(bases[1], 0);
            base[11][10] = base[10][11] = base[10][10] = mapConfig.id(bases[1], 1);
            // Team 3
            base[11][0] = mapConfig.id(bases[2], 0);
            base[11][1] = base[10][0] = base[10][1] = mapConfig.id(bases[2], 1);
            // Team 4
            base[0][11] = mapConfig.id(bases[3], 0);
            base[0][10] = base[1][11] = base[1][10] = mapConfig.id(bases[3], 1);
        }
        return base;
    })(),
    "X_GRID": 12,
    "Y_GRID": 12
}
map