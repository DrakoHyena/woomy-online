const bas = [1, 2, 3, 4].sort(() => .5 - Math.random()).map(e => `bad${e}`);
module.exports = {
    "MODE": "tdm",
    "serverName": "fak u",
    "connectionLimit": 100,
    "TEAM_AMOUNT": 4,
    "ROOM_SETUP": [
        [bas[0], "norm", "norm", "norm", "norm", "norm", "norm", "norm", bas[3]],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "nest", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm"],
        ["norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm"],
        ["norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "nest", "norm", "norm", "norm", "norm"],
        ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        [bas[1], "norm", "norm", "norm", "norm", "norm", "norm", "norm", bas[2]]
    ],
    "WIDTH": 4750,
    "HEIGHT": 4750,
    "X_GRID": 9,
    "Y_GRID": 9,
    "FOOD_AMOUNT": .2
};