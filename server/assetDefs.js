import { setAsset } from "../shared/assets.js";

/*
// Here's some examples, they work in their intended places.
// These can be used for any data
// Suggest expanding this system in the discord

// Use getAsset("assetName") for certain values in defs


// For BODY or PROP.SHAPE
setAsset("arrowShape", "M16.153 19 21 12l-4.847-7H3l4.848 7L3 19h13.153Z", {path2d: true, path2dDiv: 12})

// For BODY
setAsset("ranImage", "https://picsum.photos/100", {
	image:true,
	p1:2,
	p2:2,
	p3:4,
	p4:4
})

// For COLOR
setAsset("pumpkinOrange", "#FF7518");
*/

// Built In Assets (Removal not recommended)
// Note, these go to https://woomy.online/resources/... therefore you cannot add anything in the same way
// You must find a service to make your assets available online
// Checkout https://www.jsdelivr.com/
setAsset("normCellSkin", "/resources/cellSkins/norm.png", { image: true })
setAsset("boundaryCellSkin", "/resources/cellSkins/boundary.png", { image: true })
setAsset("defaultCellSkin1", "/resources/cellSkins/default1.png", { image: true })
setAsset("defaultCellSkin2", "/resources/cellSkins/default2.png", { image: true })
setAsset("defaultCellSkin3", "/resources/cellSkins/default3.png", { image: true })
setAsset("defaultCellSkin4", "/resources/cellSkins/default4.png", { image: true })
setAsset("defaultCellSkin5", "/resources/cellSkins/default5.png", { image: true })