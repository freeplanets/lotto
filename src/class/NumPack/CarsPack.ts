import { IPack } from "./IFPack";
// 賓果時時彩，賓果賽車，用台灣賓果的號碼產生

// 賓果賽車
// 以前往10個號為1-10車，以號碼小到大排列為各車到逹終點順序
export default class CarsPack implements IPack {
	private len = 10;
	public Pack(num: string[]): string {
			const anum = num.slice(0, this.len);
			const asort = anum.map((v) => parseInt(v, 10)).sort((a, b) => a - b).map((i) => String(i));
			return asort.map((v) => anum.findIndex((s) => s === v) + 1).join(",");
	}
}
