import { setAsset } from "../shared/assets.js";

for(let i = 0; i < 30; i++)setAsset("ranImage"+i, "https://picsum.photos/1000", {
	image:true,
	p1:2,
	p2:2,
	p3:4,
	p4:4
})