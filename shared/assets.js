const ASSET_MAGIC = 4294967296 // U32 max int
let id = 0; 
const assets = {

}

function loadAsset(magic, id){
	if(magic !== ASSET_MAGIC) return;
	return assets[id]?assets[id].data:undefined
}

function getAsset(id){
	return assets[id];
}

async function setAsset(key, data, info={}){
	const obj = assets[info.id||++id] = assets[key] = {
		_assetMagic: ASSET_MAGIC,
		id: info.id||id,
		data: data,
		info: {
			path2d: !!info.path2d,
			path2dDiv: info.path2dDiv||1,
			image: !!info.image,
			p1: info.p1||1,
			p2: info.p2||1,
			p3: info.p3||1,
			p4: info.p4||1
		}
	}

	if(globalThis.window){
		if(obj.info.path2d === true){
			obj.data = new Path2D(obj.data);
			obj.data.path2dDiv = obj.info.path2dDiv
		}else if(obj.info.image === true){
			const img = new Image();
			img.src = obj.data
			await new Promise((res)=>img.onload=res)
			obj.data = await createImageBitmap(img)
			obj.data.p1 = obj.info.p1
			obj.data.p2 = obj.info.p2
			obj.data.p3 = obj.info.p3
			obj.data.p4 = obj.info.p4
		}
	}else{
		obj.data = data
	}
	return obj;
}

export { loadAsset, getAsset, setAsset, assets, ASSET_MAGIC }