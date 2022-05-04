import AlwaysPack from "./AlwaysPack";
import CarsPack from "./CarsPack";
import { HasGTypeAndOpenNums, IPack } from "./IFPack";

export default class Pack {
	constructor(private nums: string, g: HasGTypeAndOpenNums) {
		const anums = nums.split(",");
		if (g.OpenNums < anums.length && anums.length === 20) {
			switch (g.GType) {
				case "Always":
						this.nums = this.getNum(anums, new AlwaysPack());
					 break;
				case "Cars":
					 this.nums = this.getNum(anums, new CarsPack());
			}
		}
	}
	get Nums() {
		return this.nums;
	}
	private getNum(num: string[], pack: IPack): string {
		return pack.Pack(num);
	}
}
// const nums = '60,21,46,62,24,75,79,26,66,27,70,42,11,77,48,17,06,16,09,69';
// const nums = '38,48,45,62,69,58,9,18,77,22,23,51,56,27,29,8,11,63,80,3';
// console.log(new Pack(nums, {GType:'Always', OpenNums: 5}).Nums);
// console.log(new Pack(nums, {GType:'Cars', OpenNums: 10}).Nums);
