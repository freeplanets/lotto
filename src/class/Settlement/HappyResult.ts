import XFunc from "../XFunc";
import * as SFunc from "./SFunc";

export interface IHappyResult {
  Nums: string[];
  RGNums: number[];
  OddEven: number[];
  BigSmall: number[];
  SumOE: number[];
  TailBS: number[];
  DragonTiger: number[];
  Direction: number[];
  C3Dragon: number[];
}
export class HappyResult {
  private XF = new XFunc();
  private midNum = 11;
  get Nums() {
    return this.NumSet;
  }
  private NumSet: IHappyResult = {
    Nums: [],
    RGNums: [],
    OddEven: [],
    BigSmall: [],
    SumOE: [],
    TailBS: [],
    DragonTiger: [],
    Direction: [],
    C3Dragon: []
  };
  constructor(private nums: string) {
    nums.split(",").map((snum, idx) => {
      // if(!this.NumSet.RGNums) this.NumSet.RGNums=[];
      const HPre = (idx + 1) * 100;
      const TPre = (idx + 1) * 10;
      const iNum = parseInt(snum, 10);
      this.NumSet.RGNums.push(HPre + iNum);
      this.NumSet.Nums.push(snum);
      this.NumSet.OddEven.push(TPre + this.XF.getOddEven(iNum));
      this.NumSet.BigSmall.push(TPre + this.XF.getBigSmall(iNum, this.midNum));
      this.NumSet.SumOE.push(TPre + this.XF.getTotalOE(snum));
      this.NumSet.TailBS.push(TPre + this.XF.getTailBS(snum));
      this.NumSet.C3Dragon.push(TPre + this.getC3Dragon(iNum));
      this.NumSet.Direction.push(TPre + this.getDirection(iNum));
    });
  }
  private getC3Dragon(v: string|number): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    return Math.ceil(v / 3) - 1;
  }
  private getDirection(v: string|number): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    let a: number = (v % 4) - 1;
    a = a < 0 ? 3 : a;
    return a;
  }
}

// const snum: string = "6,1,3";
// console.log(new C3DNum(snum).Nums);
