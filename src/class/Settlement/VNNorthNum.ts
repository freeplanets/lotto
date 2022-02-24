import { NumProcess } from "./if";
import { getNumTailOrHeadInt } from "./SFunc";
import MainDish from "./VNMainDish";

const D3HeadPosition = [21, 22, 23];
const D2HeadPosition = [24, 25, 26, 27];
const SpiritPosition = 0;
const SpNoPosition = 1;
const P1stPosition = 2;

export interface VNNums {
	Nums: string[];
	Spirit: number;	// 財神
	SpiritHead: number; // 財神頭
	SpNo: number;	// 特碼
	SpNoHead: number;	// 特碼頭
	Set27: number[];	// 27碼
	Set27Head: number[];	// 27碼頭
	Set23: number[];		// 3D 23組
	De25con: number[];	// 主盤式 25 組
	De50con: number[];	// 主盤式 50 組
	De33con: number;	// 除３餘數
	Zodiac: number;		// 生肖
	D2Head: number[];	// 2D頭 7獎 4組
	D3Head: number[];	// 3D頭 6獎 3組
	D3Tail: number;	// 3D尾
	P1st: number;	// 頭獎
	P1stHead: number;	// 頭獎頭
	SumTail: number; // 合數尾
}

export default class VNNumsNorth implements NumProcess {
	private imsr: VNNums = {
		Nums: [],
		Spirit: 0,	// 財神
		SpiritHead: 0, // 財神頭
		SpNo: 0,	// 特碼
		SpNoHead: 0,	// 特碼頭
		Set27: [],	// 27碼
		Set27Head: [],	// 27碼頭
		Set23: [],		// 3D 23組
		De25con: [],	// 主盤式 25 組
		De50con: [],	// 主盤式 50 組
		De33con: 0,	// 除３餘數
		Zodiac: 0,		// 生肖
		D2Head: [],
		D3Head: [],	// 3D頭 6獎 3組
		D3Tail: 0,	// 3D尾
		P1st: 0,	// 頭獎
		P1stHead: 0,	// 頭獎頭
		SumTail: 0, // 合數尾
	};
	constructor(nums: string) {
		this.imsr.Nums = nums.split(",");
		const Spirit = this.imsr.Nums[SpiritPosition];
		this.imsr.Spirit = getNumTailOrHeadInt(Spirit);
		this.imsr.SpiritHead = getNumTailOrHeadInt(Spirit, 2, true);
		const SpNo = this.imsr.Nums[SpNoPosition];
		const MD = new MainDish(SpNo);	// 特碼相關玩法
		this.imsr.SpNo = MD.D2();
		this.imsr.SpNoHead = MD.D2Head();
		this.imsr.D3Tail = MD.D3();
		this.imsr.De50con = MD.De50con();
		this.imsr.De25con = MD.De25con();
		this.imsr.De33con = MD.De33con();
		this.imsr.Zodiac = MD.Zodiac();
		this.imsr.SumTail = MD.SumTail();
		const P1st = this.imsr.Nums[P1stPosition];
		this.imsr.P1st = getNumTailOrHeadInt(P1st);
		this.imsr.P1stHead = getNumTailOrHeadInt(P1st, 2, true);
		this.imsr.Set27 = this.getSet27();
		this.imsr.Set27Head = this.getSet27(true);
		this.imsr.Set23 = this.getSet23();
		this.imsr.D3Head = this.getPosNum(D3HeadPosition, 3);
		this.imsr.D2Head = this.getPosNum(D2HeadPosition);
	}
	get Nums() {
		return this.imsr;
	}
	private getSet27(getHead= false): number[] {
		const n = this.imsr.Nums.length;
		const ans: number[] = [];
		for (let i = 1; i < n; i += 1) {
			if (getHead) {
				ans.push(getNumTailOrHeadInt(this.imsr.Nums[i], 2 , true));
			} else {
				ans.push(getNumTailOrHeadInt(this.imsr.Nums[i]));
			}
		}
		return ans;
	}
	private getSet23(): number[] {
		const n = 24;
		const ans: number[] = [];
		for (let i = 1; i < n; i += 1) {
			ans.push(getNumTailOrHeadInt(this.imsr.Nums[i], 3));
		}
		return ans;
	}
	private getPosNum(pos: number[], digit = 2): number[] {
		return pos.map((v) => getNumTailOrHeadInt(this.imsr.Nums[v], digit));
	}
}
