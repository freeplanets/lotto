import { AnyObject } from "../../DataSchema/if";
import {IHNums, INumSet} from "./if";
import {OeBsP} from "./OeBsP";
import * as SFunc from "./SFunc";
export interface IBTCHashResult {
  Nums: number[];
  RGNums: IHNums[];
  Sum: INumSet;
  SumT3: INumSet;
  SumM3: INumSet;
  SumL3: INumSet;
  TwoNums: string[];
  TwoNumsT3: string[];
  TwoNumsM3: string[];
  TwoNumsL3: string[];
  D3NotPos: string[];
  D3NotPosT3: string;
  D3NotPosM3: string;
  D3NotPosL3: string;
  D4NotPos: string[];
  D5NotPos: string;
  MixedT3: number;
  MixedM3: number;
  MixedL3: number;
  GoldenFlower: number;
  PASS: string[];
}
export class BTCHashNum {
  get Nums() {
    return this.NumSet;
  }
  private NumSet: IBTCHashResult = {
    Nums: [],
    RGNums: [],
    Sum: {Num: 0, BigSmall: 0, OddEven: 0},
    SumT3: {Num: 0, BigSmall: 0, OddEven: 0},
    SumM3: {Num: 0, BigSmall: 0, OddEven: 0},
    SumL3: {Num: 0, BigSmall: 0, OddEven: 0},
    TwoNums: [],
    TwoNumsT3: [],
    TwoNumsM3: [],
    TwoNumsL3: [],
    D3NotPos: [],
    D3NotPosT3: "",
    D3NotPosM3: "",
    D3NotPosL3: "",
    D4NotPos: [],
    D5NotPos: "",
    MixedT3: 0,
    MixedM3: 0,
    MixedL3: 0,
    GoldenFlower: 0,
    PASS: []
  };
  private nums: string[];
  // private getSet3All = SFunc.D3Set3All;
  private Combi = SFunc.C;
  private Same3OrPair = SFunc.chkSame3OrPair;
  constructor(num: string|string[]) {
    // let nums:string[]=[];
    if (typeof(num) === "string") {
      if (num.indexOf(",") !== -1) {
        this.nums = num.split(",");
      } else {
        this.nums = num.split("");
      }
    } else { this.nums = num; }
    this.nums.map((s) => {
      // if(!this.NumSet.RGNums) this.NumSet.RGNums=[];
      // const tmp = new D3OneNum(snum).Nums;
      const n = parseInt(s, 10);
      this.NumSet.RGNums.push(new OeBsP([s]).Nums);
      this.NumSet.Nums.push(n);
      return n;
      // this.NumSet.Sum += tmp.Num;
    });

    this.NumSet.Sum = new OeBsP(this.nums).Nums;
    this.NumSet.SumT3 = new OeBsP(this.Top3).Nums;
    this.NumSet.SumM3 = new OeBsP(this.Mid3).Nums;
    this.NumSet.SumL3 = new OeBsP(this.Last3).Nums;
    this.NumSet.TwoNums = this.Combi(this.nums, 2);
    this.NumSet.TwoNumsT3 = this.Combi(this.Top3, 2);
    this.NumSet.TwoNumsM3 = this.Combi(this.Mid3, 2);
    this.NumSet.TwoNumsL3 = this.Combi(this.Last3, 2);
    this.NumSet.D3NotPos = this.Combi(this.nums, 3);
    this.NumSet.D3NotPosT3 = this.Combi(this.Top3, 3)[0];
    this.NumSet.D3NotPosM3 = this.Combi(this.Mid3, 3)[0];
    this.NumSet.D3NotPosL3 = this.Combi(this.Last3, 3)[0];
    this.NumSet.D4NotPos = this.Combi(this.nums, 4);
    this.NumSet.D5NotPos = this.Combi(this.nums, 5)[0];
    this.NumSet.MixedT3 = this.chkMiscellaneous(this.Top3);
    this.NumSet.MixedM3 = this.chkMiscellaneous(this.Mid3);
    this.NumSet.MixedL3 = this.chkMiscellaneous(this.Last3);
    this.NumSet.PASS = this.getPass();
    this.NumSet.GoldenFlower = this.getGoldenFlower(this.nums);
    // this.NumSet.Set3All = this.getSet3All(nums) as number;
    // const cc = SFunc.Combs(anum);
  }
  private getPass() {
    const tmp: string[] = [];
    this.NumSet.RGNums.map((itm, k) => {
      tmp.push(`${k + 1}${itm.OddEven}`);
      tmp.push(`${k + 6}${itm.BigSmall}`);
      tmp.push(`${k + 11}${itm.Prime}`);
    });
    return tmp;
  }
  private chkMiscellaneous(nums: string[]) {
    const ans = this.Same3OrPair(nums);
    if (ans === 1) { return 0; }
    if (ans === 2) { return 2; }
    let isSH = this.chkStraightOrHalf(nums, this.isStra);
    if (isSH) { return 1; }
    isSH = this.chkStraightOrHalf(nums, this.isStraHalf);
    if (isSH) { return 3; }
    return 4;
  }
  private chkStraightOrHalf(nums: string[], func: (n: number[]) => boolean) {
    const arr: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "1", "2", "3"];
    const ar1: number[] = [];
    const ar2: number[] = [];
    let chk2: boolean = false;
    nums.map((num) => {
      const idx1 = arr.indexOf(num);
      const idx2 = arr.indexOf(num, 2);
      ar1.push(idx1);
      ar2.push(idx2);
      if (idx2 !== idx1) { chk2 = true; }
    });
    const isStra = func(ar1);
    if (isStra) { return true; }
    if (chk2) { return func(ar2); }
    return false;
  }
  private isStra(nums: number[]) {
    const snum = nums.sort(function sortab(a, b) { return a - b; });
    for (let i = 0, n = snum.length; i < n - 1; i++) {
      console.log(typeof snum[i]);
      console.log(snum[i + 1], "-", snum[i], "=", snum[i + 1] - snum[i]);
      if (snum[i + 1] - snum[i] !== 1) { return false; }
    }
    return true;
  }
  private isStraHalf(nums: number[]) {
    if (nums.length !== 3) { return false; }
    const snum = nums.sort(function sortab(a, b) { return a - b; });
    const chk1 = (snum[1] - snum[0]) === 1 ? 1 : 0;
    const chk2 = (snum[2] - snum[1]) === 1 ? 1 : 0;
    return !!(chk1 ^ chk2);
  }
  private getGoldenFlower(nums: string[]) {
    let ans = this.chkSameNum(nums);
    if (ans === 6) {
      const b = this.chkStraightOrHalf(nums, this.isStra);
      if (b) { ans = 3; }
    }
    return ans;
  }
  private chkSameNum(nums: string[]) {
    const ans: AnyObject = {};
    nums.map((n) => {
      if (ans[n]) { ans[n] += 1; } else { ans[n] = 1; }
    });
    const arr: number[] = [];
    Object.keys(ans).map((key) => {
      arr.push(ans[key]);
    });
    switch (arr.length) {
      case 1:	// 五同
        return 0;
      case 2:	// (4,1),(3,2)
        if (arr.indexOf(4) === -1) {
          // (3,2)
          return 2;
        } else {
          // (4,1)
          return 1;
        }
      case 3: // (3,1,1) (2,2,1)
        if (arr.indexOf(3) === -1) {
          // (2,2,1)
          return 5;
        } else {
          // (3,1,1)
          return 4;
        }
      default:	// 順，對或沒有
        return 6;
    }
  }
  private chkStraightPart(n: string) {
    const aNum = n.split(",").sort();
    const chk1 = parseInt(aNum[1], 10) - parseInt(aNum[0], 10);
    const chk2 = parseInt(aNum[2], 10) - parseInt(aNum[1], 10);
    const b1: number = chk1 === 1 ? 1 : 0;
    const b2: number = chk2 === 1 ? 1 : 0;
    if (b1 ^ b2) { return 0; }
    return 1;
  }
  private getPairsNum(n: string) {
    let fcnt: number = 0;
    let fnum: number = -1;
    const arr: string[] = [];
    const aNum = n.split(",");
    aNum.map((nn) => {
      const f = arr.find((itm) => itm === nn);
      if (f) {
         fnum = parseInt(f, 10);
         fcnt++;
      } else { arr.push(nn); }
    });
    if (fcnt === 1) { return fnum; }
    return -1;
  }
  get Top3() {
    return [this.nums[2], this.nums[3], this.nums[4]];
  }
  get Mid3() {
    return [this.nums[1], this.nums[2], this.nums[3]];
  }
  get Last3() {
    return [this.nums[0], this.nums[1], this.nums[2]];
  }
}

// const snum: string = "6,1,3";
// console.log(new C3DNum(snum).Nums);
