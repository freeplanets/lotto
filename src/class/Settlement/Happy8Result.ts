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
}
export class Happy8Result {
  private XF = new XFunc();
  private midNum = 40;
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
    FiveElements: 0
  };
  constructor(nums: string) {
    const anums = nums.split(",");
    let Total: number = 0;
    anums.map((snum, idx) => {
      this.NumSet.Nums.push(snum);
      Total = Total + this.parseToInt(snum);
    });
    this.NumSet.Sum = new Happy8Sum(Total, this.midNum, this.tieNum).Nums;
    this.NumSet.Counter = this.getCounter(anums);
    this.NumSet.FiveElements = this.getFiveElements(Total);
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
    tmp.BigSmallS = small === midCount ? 2 : (small < midCount ? 0 : 1);
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
}

// const snum: string = "6,1,3";
// console.log(new C3DNum(snum).Nums);
