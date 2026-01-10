const SAVE_VER = 0;
const defaultSettings = {
	settingsVersion: SAVE_VER,
	networkProtocolVersion: 2,

	// Boolean settings
	neon: false,
	darkBorders: false,
	rgbBorders: false,
	glassMode: false,
	pointy: false,
	inverseBorderColor: false,
	noBorders: false,
	tintedDamage: true,
	tintedHealth: true,
	coloredHealthBars: false,
	deathAnimations: true,
	shieldbars: false,
	roundUpgrades: false,
	disableGameMessages: false,
	autoUpgrade: true,
	screenshotMode: false,
	hideMiniRenders: false,
	lerpSize: true,
	performanceMode: false,
	animatedLasers: true,
	clientSideAim: false,
	darkModeMenu: false,

	// Number settings
	chatMessageDuration: 5,
	uiScale: 1.2,
	fontStrokeRatio: 7,
	borderWidth: 5.5, // borderChunk
	barWidth: 4, // barChunk
	fontSizeBoost: 10,
	vignetteStrength: 1,
	fpsCap: 1000,

	// String/Dropdown settings
	barStyle: "Circle",
	resolutionScale: "High (100%)",
	fontFamily: "Ubuntu",
	theme: "normal",
	shaders: "Disabled",
	filter: "Disabled",


	// Input Elements
	debugInputElements: false,
	inputElementsCacheInterval: 1000,
}
const settingTypes = {
	settingsVersion: "number",
	networkProtocolVersion: "number",

	// Boolean settings
	neon: "checkbox",
	darkBorders: "checkbox",
	rgbBorders: "checkbox",
	glassMode: "checkbox",
	pointy: "checkbox",
	inverseBorderColor: "checkbox",
	noBorders: "checkbox",
	tintedDamage: "checkbox",
	tintedHealth: "checkbox",
	coloredHealthBars: "checkbox",
	deathAnimations: "checkbox",
	shieldbars: "checkbox",
	roundUpgrades: "checkbox",
	disableGameMessages: "checkbox",
	autoUpgrade: "checkbox",
	screenshotMode: "checkbox",
	hideMiniRenders: "checkbox",
	lerpSize: "checkbox",
	performanceMode: "checkbox",
	animatedLasers: "checkbox",
	clientSideAim: "checkbox",
	mainMenuStyle: "checkbox",

	// Number settings
	chatMessageDuration: "number",
	uiScale: "number",
	fontStrokeRatio: "number",
	borderWidth: "number",
	barWidth: "number",
	fontSizeBoost: "number",
	vignetteStrength: "number",
	fpsCap: "number",

	// Dropdown settings
	barStyle: "dropdown",
	resolutionScale: "dropdown",
	fontFamily: "dropdown",
	theme: "dropdown",
	shaders: "dropdown",
	filter: "dropdown",

	// Input Elements
	debugInputElements: "checkbox",
	inputElementsCacheInterval: "number",
}
const settingLimits = {
	settingsVersionMin: 0,
	settingsVersionMax: 99999,
	networkProtocolVersionMin: 0,
	networkProtocolVersionMax: 99999,

	// Number setting limits
	chatMessageDurationMin: 0,
	chatMessageDurationMax: 60,
	uiScaleMin: 0.5,
	uiScaleMax: 3,
	fontStrokeRatioMin: 0,
	fontStrokeRatioMax: 20,
	borderWidthMin: 0,
	borderWidthMax: 10,
	barWidthMin: 0,
	barWidthMax: 10,
	fontSizeBoostMin: 0,
	fontSizeBoostMax: 50,
	vignetteStrengthMin: 0,
	vignetteStrengthMax: 5,
	fpsCapMin: 1,
	fpsCapMax: 1000,

	// Dropdown setting options
	barStyleOptions: ["Circle", "Square", "Triangle"],
	resolutionScaleOptions: ["Very Low (35%)", "Low (50%)", "Medium (75%)", "High (100%)"],
	fontFamilyOptions: ["Ubuntu", "Alfa Slab One", "Bebas Neue", "Bungee", "Cutive Mono", "Dancing Script", "Fredoka One", "Indie Flower", "Nanum Brush Script", "Pacifico", "Passion One", "Permanent Marker", "Zen Dots", "Rampart One", "Roboto Mono", "Share Tech Mono", "Syne Mono", "wingdings", "serif", "sans-serif", "cursive", "system-ui"],
	themeOptions: ["todo: add themes"],
	shadersOptions: ["Disabled", "Light Blur", "Dark Blur", "Colorful Blur", "Light", "Dark", "Colorful Dense", "Fake 3D", "Dynamic Fake 3D"],
	filterOptions: ["Disabled", "Saturated", "Grayscale", "Dramatic", "Inverted", "Sepia"],

	// Input Elements
	inputElementsCacheIntervalMin: 1,
	inputElementsCacheIntervalMax: 10000,
}

let currentSettings = undefined;

function updateSettingsFromLocalStorage(){
	let settingsInfo = localStorage.getItem("settingsInfo");
	if(!settingsInfo){
		settingsInfo = {
			activeProfile: "Default Profile",
			profiles: {
				"Default Profile": defaultSettings
			}	
		}
	}else{
		settingsInfo = JSON.parse(settingsInfo);
	}
	currentSettings = convertSettings(settingsInfo.profiles[settingsInfo.activeProfile])
}

function convertSettings(obj){
	const newObj = {};
	let defaultSettingsEntries = Object.entries(defaultSettings);
	for(let [key, value] of defaultSettingsEntries){

		// Additive fixes based on version number can be placed here

		newObj[key] = new Setting(key, settingTypes[key], value)
	}
	let objEntries = Object.entries(obj);
	for(let [key, value] of objEntries){
		if(defaultSettings[key] === undefined){
			console.warn(`Setting "${key}" is not defined in the defaults, are your provided settings correct?`)
		}
		newObj[key] = new Setting(key, settingTypes[key], value)
	}
	return newObj;
}

class Setting{
	constructor(uniqueLabel, type, value){
		this.settingName = uniqueLabel;
		this.type = type;
		this.verifyType()
		this.value = this.verifyValue(value);
	}
	verifyType(){
		switch(this.type){
			case "text":
			case "number":
			case "checkbox":
			case "dropdown":
				return true;
			default:
				console.warn(`Setting "${this.type}" is not a valid type. See Settings.js > class Setting > verifyType for the valid setting types.`);
				return false;
		}
	}
	verifyValue(value){
		let obj = undefined;
		switch(this.type){
			case "text":
				obj = {
					text: value,
					lengthLimit: settingLimits[this.settingName+"LengthLimit"]
				}
				if(obj.lengthLimit === undefined){
					console.warn(`Text length limits for setting "${this.settingName}" are undefined`);
				}
				return obj;

			case "number":
				obj = {
					min: settingLimits[this.settingName+"Min"],
					max: settingLimits[this.settingName+"Max"]
				}
				obj.number = Math.min(obj.max, Math.max(obj.min, value));
				if(obj.min === undefined || obj.max === undefined){
					console.warn(`Number limits for setting "${this.settingName}" are undefined`);
				}
				return obj;
			case "checkbox":
				obj = {
					enabled: !!value
				}
				return obj;
			case "dropdown":
				obj = {
					options: settingLimits[this.settingName+"Options"] || [],
					selected: value
				}
				if(obj.options.length > 0 && !obj.options.includes(value)){
					console.warn(`Dropdown value "${value}" is not in the options list for setting "${this.settingName}". Using first option.`);
					obj.selected = obj.options[0];
				}
				if(obj.options.length === 0){
					console.warn(`Dropdown options for setting "${this.settingName}" are undefined or empty`);
				}
				return obj;
			default:
				console.warn(`Setting "${this.type}" is not a valid type. See Settings.js > class Setting > verifyValue for the valid setting types.`);
				return {
					text: "undefined",
					lengthLimit: Infinity, 
					enabled: false,
					min: 1,
					max: 2,
					number: 1,
					percent: 1,
					options: [],
					selected: "",
				};
		}
	}
}

updateSettingsFromLocalStorage();

export {currentSettings};