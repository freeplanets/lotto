import XFunc from "../XFunc";
import {Happy8Sum, ISum} from "./Happy8Sum";

export interface ICounter {
  BigSmallS: number;
  OddEvenS: number;
}
export interface IHappy8Result {
  Nums: string[];
  Sum: ISum;
  Counter: ICounter;
  FiveElements: number;
  Total?: number;
  OddEven: string[];
  BigSmall: string[];
  TailOddEven: string[];
  TailBigSmall: string[];
  SpTail: number;
  Tail_1_5: number[];
  Tail_6_10: number[];
  Tail_11_15: number[];
  Tail_16_20: number[];
}
export class Happy8Result {
  private XF = new XFunc();
  private midNum = 41;
  private tieNum = 810;
  get Nums() {
    return this.NumSet;
  }
  private NumSet: IHappy8Result = {
    Nums: [],
    Sum: {
      BigSmall: 0,
      OddEven: 0,
      Total810: 0,
      Pass: 0
    },
    Counter: {
      BigSmallS: 0,
      OddEvenS: 0
    },
    FiveElements: 0,
    BigSmall: [],
    OddEven: [],
    TailBigSmall: [],
    TailOddEven: [],
    SpTail: 0,
    Tail_1_5: [],
    Tail_6_10: [],
    Tail_11_15: [],
    Tail_16_20: [],
  };
  constructor(nums: string) {
    const anums = nums.split(",");
    let Total: number = 0;
    anums.map((snum) => {
      this.NumSet.Nums.push(snum);
      Total = Total + this.parseToInt(snum);
    });
    this.NumSet.Sum = new Happy8Sum(Total, this.tieNum).Nums;
    this.NumSet.Counter = this.getCounter(anums);
    this.NumSet.FiveElements = this.getFiveElements(Total);
    this.NumSet.BigSmall = this.getBigSmall(anums);
    this.NumSet.OddEven = this.getOddEven(anums);
    this.NumSet.TailBigSmall = this.getTailBigSmall(anums);
    this.NumSet.TailOddEven = this.getTailOddEven(anums);
    this.NumSet.SpTail = this.XF.getTail(anums[anums.length - 1]);
    this.NumSet.Tail_1_5 = this.getPosTail([0, 1, 2, 3, 4], anums);
    this.NumSet.Tail_6_10 = this.getPosTail([5, 6, 7, 8, 9], anums);
    this.NumSet.Tail_11_15 = this.getPosTail([10, 11, 12, 13, 14], anums);
    this.NumSet.Tail_16_20 = this.getPosTail([15, 16, 17, 18, 19], anums);
  }
  private parseToInt(v: number|string): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    return v;
  }
  private getCounter(n: string[]) {
    const tmp: ICounter = {
      BigSmallS: 0,
      OddEvenS: 0
    };
    let small: number = 0;
    let even: number = 0;
    const midCount: number = n.length / 2;
    n.map((snum) => {
      const inum = parseInt(snum, 10);
      const isSmall = this.XF.getBigSmall(inum, this.midNum);
      const isEven = this.XF.getOddEven(inum);
      if (isSmall) { small++; }
      if (isEven) { even++; }
    });
    tmp.BigSmallS = small === midCount ? 2 : (small < midCount ? 1 : 0);
    tmp.OddEvenS = even === midCount ? 2 : (even < midCount ? 0 : 1);
    return tmp;
  }
  // 金（210～695）、木（696～763）、水（764～855）、火（856～923）和土（924～1410）
  private getFiveElements(t: number) {
    const steps: number[][] = [
      [210, 695], [696, 763], [764, 855], [856, 923], [924, 1410]
    ];
    return steps.findIndex( (itm) => itm[0] <= t && itm[1] >= t);
  }
  private getOddEven(nums: string[]) {
    return nums.map((num, idx) => `${idx + 1}${this.XF.getOddEven(num)}`);
  }
  private getBigSmall(nums: string[]) {
    return nums.map((num, idx) => `${idx + 1}${this.XF.getBigSmall(num, this.midNum)}`);
  }
  private getTailOddEven(nums: string[]) {
    return nums.map((num, idx) => `${idx + 1}${this.XF.getTailOE(num)}`);
  }
  private getTailBigSmall(nums: string[]) {
    return nums.map((num, idx) => `${idx + 1}${this.XF.getTailBS(num)}`);
  }
  private getPosTail(idxs: number[], nums: string[]) {
    const ans: number[] = [];
    idxs.map((idx) => {
      const t = this.XF.getTail(nums[idx]);
      const fIdx = ans.findIndex((itm) => itm === t);
      if (fIdx === -1) { ans.push(t); }
    });
    return ans;
  }
}

// const snum: string = "6,1,3";
// console.log(new C3DNum(snum).Nums);
