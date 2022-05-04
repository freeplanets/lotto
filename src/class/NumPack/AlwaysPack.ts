import { IPack } from "./IFPack";
// 賓果時時彩，賓果賽車，用台灣賓果的號碼產生

// 賓果時時彩
// 前五號尾數
export default class AlwaysPack implements IPack {
	private len = 5;
	public Pack(num: string[]): string {
			const anum = num.slice(0, this.len);
			return anum.map((no) => no.split("").pop()).join(",");
	}
}
