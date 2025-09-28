import { global } from "./global.js"
import { config } from "/js/config.js"
import { lerp } from "/js/lerp.js"
import { imageCache } from "./assets.js";
import { util } from "./util.js";
import { mixColors } from "../shared/mix_colors.js"

let color = {
	"teal": "#7ADBBC",
	"lgreen": "#B9E87E",
	"orange": "#E7896D",
	"yellow": "#FDF380",
	"lavender": "#B58EFD",
	"pink": "#EF99C3",
	"vlgrey": "#E8EBF7",
	"lgrey": "#AA9F9E",
	"guiwhite": "#FFFFFF",
	"black": "#484848",
	"blue": "#3CA4CB",
	"green": "#8ABC3F",
	"red": "#E03E41",
	"gold": "#EFC74B",
	"purple": "#8D6ADF",
	"magenta": "#CC669C",
	"grey": "#A7A7AF",
	"dgrey": "#726F6F",
	"white": "#DBDBDB",
	"guiblack": "#000000",
	"paletteSize": 10,
	"border": 0.65
};
function setColor(obj) {
	color = obj
}
let themes = {
	"normal": {
		"teal": "#7ADBBC",
		"lgreen": "#B9E87E",
		"orange": "#E7896D",
		"yellow": "#FDF380",
		"lavender": "#B58EFD",
		"pink": "#EF99C3",
		"vlgrey": "#E8EBF7",
		"lgrey": "#AA9F9E",
		"guiwhite": "#FFFFFF",
		"black": "#484848",
		"blue": "#3CA4CB",
		"green": "#8ABC3F",
		"red": "#E03E41",
		"gold": "#EFC74B",
		"purple": "#8D6ADF",
		"magenta": "#CC669C",
		"grey": "#A7A7AF",
		"dgrey": "#726F6F",
		"white": "#DBDBDB",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.65
	},
	"classic": {
		"teal": "#8EFFFB",
		"lgreen": "#85E37D",
		"orange": "#FC7676",
		"yellow": "#FFEB8E",
		"lavender": "#B58EFF",
		"pink": "#F177DD",
		"vlgrey": "#CDCDCD",
		"lgrey": "#999999",
		"guiwhite": "#FFFFFF",
		"black": "#525252",
		"blue": "#00B0E1",
		"green": "#00E06C",
		"red": "#F04F54",
		"gold": "#FFE46B",
		"purple": "#768CFC",
		"magenta": "#BE7FF5",
		"grey": "#999999",
		"dgrey": "#545454",
		"white": "#C0C0C0",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.5
	},
	"dark": {
		"teal": "#8975B7",
		"lgreen": "#1BA01F",
		"orange": "#C46748",
		"yellow": "#B2B224",
		"lavender": "#7D56C5",
		"pink": "#B24FAE",
		"vlgrey": "#1E1E1E",
		"lgrey": "#3C3A3A",
		"guiwhite": "#000000",
		"black": "#E5E5E5",
		"blue": "#379FC6",
		"green": "#30B53B",
		"red": "#FF6C6E",
		"gold": "#FFC665",
		"purple": "#9673E8",
		"magenta": "#C8679B",
		"grey": "#635F5F",
		"dgrey": "#73747A",
		"white": "#11110F",
		"guiblack": "#FFFFFF",
		"paletteSize": 10,
		"border": 0.15
	},
	"natural": {
		"teal": "#76C1BB",
		"lgreen": "#AAD35D",
		"orange": "#E09545",
		"yellow": "#FFD993",
		"lavender": "#939FFF",
		"pink": "#D87FB2",
		"vlgrey": "#C4B6B6",
		"lgrey": "#7F7F7F",
		"guiwhite": "#FFFFFF",
		"black": "#373834",
		"blue": "#4F93B5",
		"green": "#00B659",
		"red": "#E14F65",
		"gold": "#E5BF42",
		"purple": "#8053A0",
		"magenta": "#B67CAA",
		"grey": "#998F8F",
		"dgrey": "#494954",
		"white": "#A5B2A5",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.2
	},
	"ayu": {
		"teal": "#7ADBBC",
		"lgreen": "#B9E87E",
		"orange": "#E7896D",
		"yellow": "#FDF380",
		"lavender": "#B58EFD",
		"pink": "#EF99C3",
		"vlgrey": "#01060e",
		"lgrey": "#AA9F9E",
		"guiwhite": "#FFFFFF",
		"black": "#0a0e14",
		"blue": "#72674f",
		"green": "#8ABC3F",
		"red": "#626a73",
		"gold": "#EFC74B",
		"purple": "#8D6ADF",
		"magenta": "#ae81ff",
		"grey": "#ffffff",
		"dgrey": "#726F6F",
		"white": "#0a0e14",
		"guiblack": "#FFFFFF",
		"paletteSize": 10,
		"border": 0.5
	},
	"forest": {
		"teal": "#884AA5",
		"lgreen": "#8C9B3E",
		"orange": "#D16A80",
		"yellow": "#97596D",
		"lavender": "#499855",
		"pink": "#60294F",
		"vlgrey": "#DDC6B8",
		"lgrey": "#7E949E",
		"guiwhite": "#FFFFE8",
		"black": "#665750",
		"blue": "#807BB6",
		"green": "#A1BE55",
		"red": "#E5B05B",
		"gold": "#FF4747",
		"purple": "#BAC674",
		"magenta": "#BA78D1",
		"grey": "#998866",
		"dgrey": "#529758",
		"white": "#7DA060",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.7
	},
	"boreal": {
		"teal": "#c342ff",
		"lgreen": "#4ee92f",
		"orange": "#bb687a",
		"yellow": "#97596D",
		"lavender": "#499855",
		"pink": "#e8e3e6",
		"vlgrey": "#dfcbbf",
		"lgrey": "#7E949E",
		"guiwhite": "#FFFFE8",
		"black": "#6f584d",
		"blue": "#9c98c3",
		"green": "#bbd57c",
		"red": "#eac180",
		"gold": "#f48080",
		"purple": "#ccdb7b",
		"magenta": "#ca98dd",
		"grey": "#b7946c",
		"dgrey": "#529758",
		"white": "#ecf4f2",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.5
	},
	"midnight": {
		"teal": "#2B9098",
		"lgreen": "#4BAA5D",
		"orange": "#345678",
		"yellow": "#CDC684",
		"lavender": "#89778E",
		"pink": "#A85C90",
		"vlgrey": "#CCCCCC",
		"lgrey": "#A7B2B7",
		"guiwhite": "#BAC6FF",
		"black": "#091F28",
		"blue": "#123455",
		"green": "#098765",
		"red": "#000013",
		"gold": "#566381",
		"purple": "#743784",
		"magenta": "#B29098",
		"grey": "#555555",
		"dgrey": "#649EB7",
		"white": "#444444",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.6
	},
	"pastel": {
		"teal": "#89BFBA",
		"lgreen": "#B5D17D",
		"orange": "#E5E0E0",
		"yellow": "#B5BBE5",
		"lavender": "#939FFF",
		"pink": "#646DE5",
		"vlgrey": "#B2B2B2",
		"lgrey": "#7F7F7F",
		"guiwhite": "#FFFFFF",
		"black": "#383835",
		"blue": "#AEAEFF",
		"green": "#AEFFAE",
		"red": "#FFAEAE",
		"gold": "#FFFFFF",
		"purple": "#C3C3D8",
		"magenta": "#FFB5FF",
		"grey": "#CCCCCC",
		"dgrey": "#A0A0B2",
		"white": "#F2F2F2",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.35
	},
	"space": {
		"teal": "#4788F3",
		"lgreen": "#AF1010",
		"orange": "#FF0000",
		"yellow": "#82F850",
		"lavender": "#FFFFFF",
		"pink": "#57006C",
		"vlgrey": "#FFFFFF",
		"lgrey": "#272727",
		"guiwhite": "#000000",
		"black": "#7F7F7F",
		"blue": "#0E1B92",
		"green": "#0AEB80",
		"red": "#C2B90A",
		"gold": "#3E7E8C",
		"purple": "#285911",
		"magenta": "#A9707E",
		"grey": "#6F6A68",
		"dgrey": "#2D0738",
		"white": "#000000",
		"guiblack": "#FFFFFF",
		"paletteSize": 10,
		"border": 0.25
	},
	"factory": {
		"teal": "#8686ab",
		"lgreen": "#e4ca49",
		"orange": "#c8b5b8",
		"yellow": "#FDF380",
		"lavender": "#8585ab",
		"pink": "#b2b2cc",
		"vlgrey": "#676480",
		"lgrey": "#AA9F9E",
		"guiwhite": "#a3a38e",
		"black": "#3c3b4a",
		"blue": "#36c6e2",
		"green": "#36e28f",
		"red": "#e45548",
		"gold": "#ccccb2",
		"purple": "#b2b2cc",
		"magenta": "#c4addb",
		"grey": "#8e8ca5",
		"dgrey": "#535b5f",
		"white": "#8a9195",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.75
	},
	"nebula": {
		"teal": "#38B06E",
		"lgreen": "#22882E",
		"orange": "#D28E7F",
		"yellow": "#D5D879",
		"lavender": "#E084EB",
		"pink": "#DF3E3E",
		"vlgrey": "#F0F2CC",
		"lgrey": "#7D7D7D",
		"guiwhite": "#C2C5EF",
		"black": "#161616",
		"blue": "#9274E6",
		"green": "#89F470",
		"red": "#E08E5D",
		"gold": "#ECDC58",
		"purple": "#58CBEC",
		"magenta": "#EA58EC",
		"grey": "#7E5713",
		"dgrey": "#303030",
		"white": "#555555",
		"guiblack": "#EAEAEA",
		"paletteSize": 10,
		"border": 0.5
	},
	"bleach": {
		"teal": "#00FFFF",
		"lgreen": "#00FF00",
		"orange": "#FF3200",
		"yellow": "#FFEC00",
		"lavender": "#FF24A7",
		"pink": "#FF3CBD",
		"vlgrey": "#FFF186",
		"lgrey": "#918181",
		"guiwhite": "#F1F1F1",
		"black": "#5F5F5F",
		"blue": "#0025FF",
		"green": "#00FF00",
		"red": "#FF0000",
		"gold": "#FFFA23",
		"purple": "#3100FF",
		"magenta": "#D4D3D3",
		"grey": "#838383",
		"dgrey": "#4C4C4C",
		"white": "#FFFEFE",
		"guiblack": "#080808",
		"paletteSize": 10,
		"border": 0.4
	},
	"ocean": {
		"teal": "#76EEC6",
		"lgreen": "#41AA78",
		"orange": "#FF7F50",
		"yellow": "#FFD250",
		"lavender": "#DC3388",
		"pink": "#FA8072",
		"vlgrey": "#8B8886",
		"lgrey": "#BFC1C2",
		"guiwhite": "#FFFFFF",
		"black": "#12466B",
		"blue": "#4200AE",
		"green": "#0D6338",
		"red": "#DC4333",
		"gold": "#FEA904",
		"purple": "#7B4BAB",
		"magenta": "#5C246E",
		"grey": "#656884",
		"dgrey": "#D4D7D9",
		"white": "#3283BC",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.3
	},
	"mariana": {
		"teal": "#e02e1a",
		"lgreen": "#abfe10",
		"orange": "#49a437",
		"yellow": "#FFD250",
		"lavender": "#DC3388",
		"pink": "#e16d60",
		"vlgrey": "#878482",
		"lgrey": "#BFC1C2",
		"guiwhite": "#99d8ff",
		"black": "#3856f0",
		"blue": "#576dc1",
		"green": "#1daa63",
		"red": "#bf703b",
		"gold": "#b65449",
		"purple": "#6e642b",
		"magenta": "#9c47b8",
		"grey": "#4d4d6a",
		"dgrey": "#D4D7D9",
		"white": "#0c3755",
		"guiblack": "#FFFFFF",
		"paletteSize": 10,
		"border": 0.5
	},
	"badlands": {
		"teal": "#F9CB9C",
		"lgreen": "#F1C232",
		"orange": "#38761D",
		"yellow": "#E69138",
		"lavender": "#B7B7B7",
		"pink": "#78866B",
		"vlgrey": "#6AA84F",
		"lgrey": "#B7B7B7",
		"guiwhite": "#A4C2F4",
		"black": "#000000",
		"blue": "#0C5A9E",
		"green": "#6E8922",
		"red": "#5B0000",
		"gold": "#783F04",
		"purple": "#591C77",
		"magenta": "#20124D",
		"grey": "#2F1C16",
		"dgrey": "#999999",
		"white": "#543517",
		"guiblack": "#CFE2F3",
		"paletteSize": 10,
		"border": 0.4
	},
	"beta_arras": {
		"teal": "#1F3D80",
		"lgreen": "#39A016",
		"orange": "#760D10",
		"yellow": "#DBA015",
		"lavender": "#820A66",
		"pink": "#820A66",
		"vlgrey": "#888888",
		"lgrey": "#888888",
		"guiwhite": "#FFFFFF",
		"black": "#484848",
		"blue": "#3762D1",
		"green": "#22600D",
		"red": "#C4151B",
		"gold": "#83600D",
		"purple": "#4E063D",
		"magenta": "#CC669C",
		"grey": "#A7A7AF",
		"dgrey": "#525252",
		"white": "#DBDBDB",
		"guiblack": "#525252",
		"paletteSize": 10,
		"border": 0.65
	},
	"neon": {
		"teal": "#00FFF2",
		"lgreen": "#04FF00",
		"orange": "#FF9D00",
		"yellow": "#FFFA00",
		"lavender": "#7D56C5",
		"pink": "#FF89D7",
		"vlgrey": "#161616",
		"lgrey": "#3d3d3d",
		"guiwhite": "#000000",
		"black": "#E5E5E5",
		"blue": "#0090FF",
		"green": "#26D100",
		"red": "#FF0000",
		"gold": "#FFD400",
		"purple": "#7b00ff",
		"magenta": " #ff00e1",
		"grey": "#635F5F",
		"dgrey": "#73747A",
		"white": "#000000",
		"guiblack": "#FFFFFF",
		"paletteSize": 10,
		"border": 0.15
	},
	"haunted_house": {
		"teal": "#000000",
		"lgreen": "#841c93",
		"orange": "#963518",
		"yellow": "#cdbe03",
		"lavender": "#9d5ffc",
		"pink": "#f3b6d5",
		"vlgrey": "#ffffff",
		"lgrey": "#aa9f9e",
		"guiwhite": "#ffffff",
		"black": "#484848",
		"blue": "#647aa4",
		"green": "#81a259",
		"red": "#9e031f",
		"gold": "#b48b10",
		"purple": "#351a75",
		"magenta": "#b77b9a",
		"grey": "#dcccdd",
		"dgrey": "#77067d",
		"white": "#020202",
		"guiblack": "#ffffff",
		"paletteSize": 10,
		"border": 0.6
	},
	"pumpkin_theme": {
		"teal": "#721970",
		"lgreen": "#ff6347",
		"orange": "#1b713a",
		"yellow": "#fdf380",
		"lavender": "#941100",
		"pink": "#194417",
		"vlgrey": "#1b713a",
		"lgrey": "#aa9f9e",
		"guiwhite": "#fed8b1",
		"black": "#484848",
		"blue": "#3ca4cb",
		"green": "#8abc3f",
		"red": "#e03e41",
		"gold": "#1b713a",
		"purple": "#1b713a",
		"magenta": "#cc669c",
		"grey": "#ffffff",
		"dgrey": "#726f6f",
		"white": "#ff9b58",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 3
	},
	"solarized_dark": {
		"teal": "#B58900",
		"lgreen": "#2AA198",
		"orange": "#CB4B16",
		"yellow": "#657B83",
		"lavender": "#EEE8D5",
		"pink": "#D33682",
		"vlgrey": "#E0E2E4",
		"lgrey": "#073642",
		"guiwhite": "#ffffff",
		"black": "#000000",
		"blue": "#268BD2",
		"green": "#869600",
		"red": "#DC322F",
		"gold": "#B58900",
		"purple": "#678CB1",
		"magenta": "#A082BD",
		"grey": "#839496",
		"dgrey": "#073642",
		"white": "#002B36",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.5
	},
	"christmas": {
		"teal": "#00d200",
		"lgreen": "#ce0000",
		"orange": "#d94d24",
		"yellow": "#f3e103",
		"lavender": "#5004dd",
		"pink": "#e86aa9",
		"vlgrey": "#ff0000",
		"lgrey": "#00ae00",
		"guiwhite": "#00f400",
		"black": "#484848",
		"blue": "#f2f200",
		"green": "#8abc3f",
		"red": "#e03e41",
		"gold": "#ffff28",
		"purple": "#6c3fd6",
		"magenta": "#ffffff",
		"grey": "#c0c0c0",
		"dgrey": "#008000",
		"white": "#00b300",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.5
	},
	"bubblegum": {
		"teal": "#7adbbc",
		"lgreen": "#b9e87e",
		"orange": "#e7896d",
		"yellow": "#fdf380",
		"lavender": "#b58efd",
		"pink": "#ef99c3",
		"vlgrey": "#e8ebf7",
		"lgrey": "#e761a4",
		"guiwhite": "#ffffff",
		"black": "#7d1348",
		"blue": "#3ca4cb",
		"green": "#8abc3f",
		"red": "#e03e41",
		"gold": "#efc74b",
		"purple": "#8d6adf",
		"magenta": "#cc669c",
		"grey": "#e96dab",
		"dgrey": "#c21f71",
		"white": "#f5c0db",
		"guiblack": "#000000",
		"paletteSize": 10,
		"border": 0.5
	},
	"amethyst": {
		"teal": "#467b7c", "lgreen": "#79a05a", "orange": "#8a5b42", "yellow": "#FDF380", "lavender": "#B58EFD", "pink": "#a66e8e", "vlgrey": "#888891", "lgrey": "#AA9F9E", "guiwhite": "#a48ec2", "black": "#000000", "blue": "#254b74", "green": "#417e2a", "red": "#7e2525", "gold": "#8e862e", "purple": "#5c4186", "magenta": "#3d1764", "grey": "#58575b", "dgrey": "#726F6F", "white": "#665a87", "guiblack": "#000000", "paletteSize": 10, "border": 0.5
	},
	"fantasy": {
		"teal": "#e43939", "lgreen": "#77ec6c", "orange": "#ed657a", "yellow": "#fdf380", "lavender": "#8c00ff", "pink": "#ff8bff", "vlgrey": "#f2f4fd", "lgrey": "#000000", "guiwhite": "#ffffff", "black": "#191919", "blue": "#3e67f4", "green": "#02cf05", "red": "#ca0020", "gold": "#fdef75", "purple": "#7a8bf4", "magenta": "#d952ff", "grey": "#4e4d50", "dgrey": "#353535", "white": "#646262", "guiblack": "#000000", "border": 0.5
	}
};

const specialColors = {}
function getColor(colorID) {
	switch (colorID) {
		case -2: // suck my dick, props
			return color.teal;
		case -1: // Only used for shinies to detect the achievement
			return color.teal;
		case 0:
			return color.teal;
		case 1:
			return color.lgreen;
		case 2:
			return color.orange;
		case 3:
			return color.yellow;
		case 4:
			return color.lavender;
		case 5:
			return color.pink;
		case 6:
			return color.vlgrey;
		case 7:
			return color.lgrey;
		case 8:
			return color.guiwhite;
		case 9:
			return color.black;
		case 10:
			return color.blue;
		case 11:
			return color.green;
		case 12:
			return color.red;
		case 13:
			return color.gold;
		case 14:
			return color.purple;
		case 15:
			return color.magenta;
		case 16:
			return color.grey;
		case 17:
			return color.dgrey;
		case 18:
			return color.white;
		case 19:
			return color.guiblack;
		case 20:
			return "#307A76";
		case 21:
			return "#47F51E";
		case 22:
			return "#9264EF";
		case 23:
			return "#1D00FF";
		case 24:
			return "#B35ED8";
		case 25:
			return "#0531CB";
		case 26:
			return "#FDA54D";
		case 27:
			return "#3761D1";
		case 28:
			return "#AB1515";
		case 29:
			return "#44AA34";
		case 30:
			return "#EEF5A7";
		case 31:
			return "#8BFE6A";
		case 32:
			return "#FAC577";
		case 33:
			return "#8AFF8A";
		case 34:
			return "#666666";
		case 35:
			return "#F37C20";
		case 36:
			return "#E85DDF";
		case 37:
			return "#FFFF00";
		case 38:
			return "#FF9900";
		case 39:
			return "#FFBF00";
		case 40:
			return "#57C8C2";
		case 41:
			return "#A6E1DE";
		case 42:
			return "#BF0731";
		case 43:
			return "#F80A41";
		case 44: // Tellurium color
			return "#00EEA4";
		case 45: // Red team trench warfare door color (closed)
			return mixColors(color.red, color.grey, .8);
		case 46: // Red team trench warfare door color (open) and sporulator colors
			return mixColors(color.green, color.grey, .8);
		// Rainbow Colors
		case 100:
			return "#FF0000";
		case 101:
			return "#FF1A00";
		case 102:
			return "#FF2A00";
		case 103:
			return "#FF4300";
		case 104:
			return "#FF5D00";
		case 105:
			return "#FF7200";
		case 106:
			return "#FF7700";
		case 107:
			return "#FF9400";
		case 108:
			return "#FF9900";
		case 109:
			return "#FFA500";
		case 110:
			return "#FFBB00";
		case 111:
			return "#FFCC00";
		case 112:
			return "#FFDD00";
		case 113:
			return "#FFE900";
		case 114:
			return "#FFFA00";
		case 115:
			return "#EEFF00";
		case 116:
			return "#DDFF00";
		case 117:
			return "#D0FF00";
		case 118:
			return "#B6FF00";
		case 119:
			return "#AAFF00";
		case 120:
			return "#88FF00";
		case 121:
			return "#6EFF00";
		case 122:
			return "#54FF00";
		case 123:
			return "#32FF00";
		case 124:
			return "#19FF00";
		case 125:
			return "#04FF00";
		case 126:
			return "#00FF15";
		case 127:
			return "#00FF26";
		case 128:
			return "#00FF3F";
		case 129:
			return "#00FF55";
		case 130:
			return "#00FF6E";
		case 131:
			return "#00FF7F";
		case 132:
			return "#00FF99";
		case 133:
			return "#00FFA5";
		case 134:
			return "#00FFBB";
		case 135:
			return "#00FFCB";
		case 136:
			return "#00FFD8";
		case 137:
			return "#00FFED";
		case 138:
			return "#00FFFA";
		case 139:
			return "#00E9FF";
		case 140:
			return "#00D8FF";
		case 141:
			return "#00C3FF";
		case 142:
			return "#00BBFF";
		case 143:
			return "#00AEFF";
		case 144:
			return "#00A1FF";
		case 145:
			return "#0090FF";
		case 146:
			return "#007FFF";
		case 147:
			return "#0077FF";
		case 148:
			return "#006EFF";
		case 149:
			return "#005DFF";
		case 150:
			return "#0048FF";
		case 151:
			return "#0037FF";
		case 152:
			return "#0026FF";
		case 153:
			return "#0019FF";
		case 154:
			return "#0004FF";
		case 155:
			return "#0C00FF";
		case 156:
			return "#2200FF";
		case 157:
			return "#2E00FF";
		case 158:
			return "#3B00FF";
		case 159:
			return "#5400FF";
		case 160:
			return "#6A00FF";
		case 161:
			return "#7F00FF";
		case 162:
			return "#9000FF";
		case 163:
			return "#A100FF";
		case 164:
			return "#B600FF";
		case 165:
			return "#BF00FF";
		case 166:
			return "#D000FF";
		case 167:
			return "#DC00FF";
		case 168:
			return "#E900FF";
		case 169:
			return "#FA00FF";
		case 170:
			return "#FF00F6";
		case 171:
			return "#FF00E1";
		case 172:
			return "#FF00CB";
		case 173:
			return "#FF00B6";
		case 174:
			return "#FF00AA";
		case 175:
			return "#FF00A5";
		case 176:
			return "#FF0090";
		case 177:
			return "#FF007B";
		case 178:
			return "#FF006E";
		case 179:
			return "#FF005D";
		case 180:
			return "#FF0059";
		case 181:
			return "#FF0043";
		case 182:
			return "#FF003B";
		case 183:
			return "#FF0026";
		case 184:
			return "#FF001D";
		case 185:
			return "#FF000C";
		// Railgun Colors
		case 186:
			return "#AA8A8B";
		case 187:
			return "#BC7B7D";
		case 188:
			return "#CD6D70";
		case 189:
			return "#DF5E62";
		case 190:
			return "#CB6F3C";
		case 191:
			return "#00D2FF";
		case 192:
			return "#003399";
		case 193:
			return "#BDBDBD";
		case 194:
			return "#B7410E";
		case 195:
			return "#65F0EC";
		case 196:
			return "#EAB57A";
		case 197:
			return "#E6E600";
		case 198:
			return "#E69138";
		case 199:
			return "#EA9999";
		case 200:
			return "#CCFF00";
		case 201:
			return "#800000";
		case 202:
			return "#F7EB73";
		case 203: // Atlantis barrel color
			return "#9A5BAB";
		case 204: // Redditeer eye color
			return "#ED7332";
		case 205:
			return "#FDA2A2";
		case 206:
			return "#00428B";
		case 207:
			return "#FF8000";
		case 208:
			return "#FFB66C";
		case 209:
			return "#C0C0C0";
		case 210:
			return "#FFFF80";
		case 211:
			return "#9B59D0";
		case 212:
			return "#996B6D";
		case 213:
			return "#FE9774";
		case 214:
			return "#77E2FB";
		case 215:
			return "#EFA900";
		case 216:
			return "#FC8208";
		case 217:
			return "#6CF1EE";
		case 218:
			return "#FFD900";
		case 219:
			return "#FFAE40";
		case 220:
			return "#FFA600";
		case 221:
			return "#FF0080";
		case 222:
			return "#00FFFF";
		case 223:
			return "#00BFFF";
		case 224:
			return "#99D9EA";
		case 225:
			return "#6DB5C9";
		case 226:
			return "#EFC74B";
		case 227:
			return "#D5095B";
		case 228:
			return "#FF7F00";
		case 229:
			return "#A277FB";
		case 230:
			return "#BA8939";
		case 231:
			return "#5AE3E3";
		case 232:
			return "#FF6600";
		case 233:
			return "#FF9955";
		case 234:
			return "#D4AF37";
		case 235:
			return "#990000";
		case 236:
			return "#CC0000";
		case 237:
			return "#434343";
		case 238:
			return "#D16161";
		case 239:
			return "#F0A900";
		case 240:
			return "#15CD2D";
		case 241:
			return "#56E012";
		case 242:
			return "#A177FC";
		case 243:
			return util._HSL2COLOR((Date.now() % 2520) / 7, 100, 50);
		case 244:
			return "#3D79EF";
		case 245:
			return "#000CF2";
		case 246:
			return "#080CEB";
		case 247:
			return "#100BE3";
		case 248:
			return "#170BDC";
		case 249:
			return "#1F0AD5";
		case 250:
			return "#270ACE";
		case 251:
			return "#2F0AC6";
		case 252:
			return "#3709BF";
		case 253:
			return "#3E09B8";
		case 254:
			return "#4609B0";
		case 255:
			return "#4E08A9";
		case 256:
			return "#5608A2";
		case 257:
			return "#5E079B";
		case 258:
			return "#650793";
		case 259:
			return "#6D078C";
		case 260:
			return "#750685";
		case 261:
			return "#7D067D";
		case 262:
			return "#850576";
		case 263:
			return "#8D056F";
		case 264:
			return "#940567";
		case 265:
			return "#9C0460";
		case 266:
			return "#A40459";
		case 267:
			return "#AC0352";
		case 268:
			return "#B4034A";
		case 269:
			return "#BB0343";
		case 270:
			return "#C3023C";
		case 271:
			return "#CB0234";
		case 272:
			return "#D3022D";
		case 273:
			return "#DB0126";
		case 274:
			return "#E2011F";
		case 275:
			return "#EA0017";
		case 276:
			return "#F20010";
		// Surge colors
		case 277:
			return "#B29272";
		case 278:
			return "#CA9765";
		case 279:
			return "#E49649";
		case 280:
			return "#EB9742";
		case 281:
			return "#EB9142";
		case 282:
			return "#EB7B42";
		case 283:
			return "#E97439";
		case 284:
			return "#E96839";
		case 285:
			return "#E95B38";
		case 286:
			return "#E94F38";
		case 287:
			return "#E93838";
		case 288:
			return "#E63232";
		case 289:
			return "#EF2A2A";
		case 290:
			return "#F22424";
		case 291:
			return "#F61E1E";
		case 292:
			return "#F71515";
		case 293:
			return "#FF1010";
		case 294:
			return "#FF0000";
		case 295:
			return "#FF004D";
		case 296:
			return "#101930";
		case 297:
			return "#00F6FF";
		case 298:
			return "#806CC3";
		case 299:
			return "#00FFCC";
		case 300:
			return "#E456fB";
		case 301:
			return "#B0B8FF";
		case 302:
			return "#7CF8AC";
		case 303:
			return "#1304E3";
		case 304:
			return "#777777";
		case 305:
			return "#80B0FF";
		case 306:
			return "#A2C5FF";
		case 307:
			return "#bed9f5";
		case 308:
			return "#e0e2fe";
		case 309:
			return "#9495f7";
		case 310:
			return "#f5b900";
		case 311:
			return "#f08b00";
		case 312:
			return "#df3b00";
		case 313:
			return "#474574";
		case 314:
			return "#615DAA";
		case 315:
			return "#8782DB";
		case 316: //Enraged Kamikaze
			return "#ff3232";
		case 317: //Steel-String
			return "#979797";
		case 318: // Oppressors
			return "#a5bdd7";
		case 319: // Sorcerer Drone
			return "#c6d9ef";
		case 320: // Enchantress Drone
			return "#c65f51";
		case 321: // the excorcist
			return "#956db0";
		case 322: // Scorched
			return "#fe5f00";
		case 323: // viviyellow
			return "#f6e338";
		case 324: // vivired
			return "#f63838";
		case 325: // viviblue
			return "#3897f6";
		case 326: // vivigreen
			return "#53f638";
		case 327: // forestizer 1
			return "#046c10";
		case 328: // forestizer 2
			return "#4cb02f";
		case 329: // forestizer 3
			return "#9fcc8c";
		case 330: // forestizer 4
			return "#052f08";
		case 331: // forestizer wood
			return "#e8cb8e";
		case 332: // forestizer 6
			return "#2d9133";
		case 327.5: // forestizer red 1
			return "#cf0116";
		case 328.5: // forestizer red 2
			return "#d50028";
		case 329.5: // forestizer red 3
			return "#e7406f";
		case 330.5: // forestizer red 4
			return "#5b0001";
		case 332.5: // forestizer red 5
			return "#d60014";
		case 333: // forestizer red 3
			return "#e7406f";
		case 334: // forestizer red 4
			return "#5b0001";
		case 335: // #PATRIOTISM
			return "#194187";
		case 336: // #PATRIOTISM
			return "#6cbbc2";
		// Misc
		case "rainbow":
			return "#" + Math.floor(Math.random() * 16777215).toString(16);
		case "FFA_RED":
			return color.red;
		case 337: // Lavender
			return "#AB6AB5";
		case 338:
			return "#A39EFF";
		case 339:
			return "#FF7E67";
		case 340:
			return "#CD004C";
		case 341:
			return "#5BCEF5";
		case 342:
			return "#feb940";
		case 343:
			return "#a8b3c6";
		case 344:
			return "#9fc1dc";
		case 345:
			return "#8dd1eb";
		case 346:
			return "#78e1f2";
		case 347: // Clone Strike
			return "#8adea0";
		case 1000: // Star background
			if (specialColors[1000] === undefined) {
				specialColors[1000] = function (ctx, instance) {
					if (!imageCache.starbackground || !imageCache.starbackground.ready) return;
					const pattern = ctx.createPattern(imageCache.starbackground, "repeat");
					const screenWorldOriginX = -global.player._renderx * global._ratio + global._screenWidth / 2;
					const screenWorldOriginY = -global.player._rendery * global._ratio + global._screenHeight / 2;
					pattern.setTransform(new DOMMatrix().translate(screenWorldOriginX, screenWorldOriginY));
					ctx.fillStyle = pattern;
					ctx.fill()
				}
			}
			return "#000000"
			break;
		case 1001: // Inverted Star background
			if (specialColors[1001] === undefined) {
				specialColors[1001] = function (ctx, instance) {
					if (!imageCache.starbackgroundInverted || !imageCache.starbackgroundInverted.ready) return;
					const pattern = ctx.createPattern(imageCache.starbackgroundInverted, "repeat");
					const screenWorldOriginX = -global.player._renderx * global._ratio + global._screenWidth / 2;
					const screenWorldOriginY = -global.player._rendery * global._ratio + global._screenHeight / 2;
					pattern.setTransform(new DOMMatrix().translate(screenWorldOriginX, screenWorldOriginY));
					ctx.fillStyle = pattern;
					ctx.fill()
				}
			}
			return "#FFFFFF"
			break;
		default:
			if (typeof colorID == "string") {
				if (colorID.length !== 7) {
					return "#F00000"//else it would break undefined colorID entities
					throw new Error("Colors should be a 6 number hexcode (i.e. #000000), got:\"" + colorID + "\"")
				}
				return colorID
			} else {
				return "#F00000";//colorID;
			}
	}
}

function getColorDark(givenColor) {
	if (config.noBorders) return givenColor;
	if (config.rgbBorders) return getColor(global._tankMenuColor);
	let dark = (config.neon | config.inverseBorderColor) ? color.white : color.black;
	return config.darkBorders ? dark : mixColors(givenColor, dark, color.border);
}

function getZoneColor(cell, real, seed = 1) {
	if (cell.slice(0, -1) === "por") {
		switch (+cell.slice(3)) {
			case 1:
				return mixColors(color.blue, color.guiwhite, 1 / 3);
			case 2:
				return mixColors(color.red, color.guiwhite, 1 / 3);
			case 3:
				return mixColors(color.green, color.guiwhite, 1 / 3);
			case 4:
				return mixColors(color.pink, color.guiwhite, 1 / 3);
		}
	}
	switch (cell) {
		case "n_b1":
		case "bas1":
		case "bad1":
		case "dom1":
			return color.blue;
		case "n_b2":
		case "bas2":
		case "bad2":
		case "dom2":
		case "boss":
			return color.red;
		case "n_b3":
		case "bas3":
		case "bad3":
		case "dom3":
			return color.green;
		case "n_b4":
		case "bas4":
		case "bad4":
		case "dom4":
			return color.pink;
		case "n_b5":
		case "bas5":
		case "bad5":
		case "dom5":
			return color.yellow;
		case "n_b6":
		case "bas6":
		case "bad6":
		case "dom6":
			return color.orange;
		case "n_b7":
		case "bas7":
		case "bad7":
		case "dom7":
			return "#F700FF";
		case "n_b8":
		case "bas8":
		case "bad8":
		case "dom8":
			return color.teal;
		case "domi":
			return color.gold;
		case "edge":
			return mixColors(color.white, color.guiblack, 1 / 3);
		case "port":
			return color.guiblack;
		case "spn1":
			return mixColors(color.blue, color.guiwhite, 2 / 3);
		case "spn2":
			return mixColors(color.red, color.guiwhite, 2 / 3);
		// KEEP NEST AT THE BOTTOM
		case "nest":
			return real ? color.purple : color.lavender;
		default:
			if (cell.startsWith("#")) { return cell } else { return real ? (color.white) : (color.guiwhite); }
	}
}

function setColors(context, givenColor) {
	if (config.neon) {
		context.fillStyle = getColorDark(givenColor);
		context.strokeStyle = givenColor;
	} else {
		context.fillStyle = givenColor;
		context.strokeStyle = getColorDark(givenColor);
	}
}

function setColorsUnmix(context, givenColor) {
	context.fillStyle = givenColor;
	context.strokeStyle = "rgba(0,0,0,0)";
}

function setColorsUnmixB(context, givenColor) {
	context.fillStyle = "rgba(0,0,0,0)";
	context.strokeStyle = getColorDark(givenColor);
}

const hslToColor = (function () {
	return function (h, s, l) {
		l /= 100;
		const a = s * Math.min(l, 1 - l) / 100;
		const f = n => {
			const k = (n + h / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	};
})();

export {
	color,
	setColor,
	themes,
	specialColors,
	getColor,
	getColorDark,
	getZoneColor,
	setColors,
	setColorsUnmix,
	setColorsUnmixB,
	hslToColor
};