import XFunc from "../XFunc";

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
  Sum: number;
  SumTOE: number;
  SumTBS: number;
  SumTailBS: number;
}
export class HappyResult {
  private XF = new XFunc();
  private midNum = 11;
  private midTNum = 84;
  private tieNum = 84;
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
    C3Dragon: [],
    Sum: 0,
    SumTailBS: 0,
    SumTBS: 0,
    SumTOE: 0
  };
  constructor(private nums: string) {
    const anums = nums.split(",");
    anums.map((snum, idx) => {
      // if(!this.NumSet.RGNums) this.NumSet.RGNums=[];
      const HPre = (idx + 1) * 100;
      const TPre = (idx + 1) * 10;
      const iNum = parseInt(snum, 10);
      this.NumSet.RGNums.push(HPre + iNum);
      this.NumSet.Nums.push(`${iNum}`);
      this.NumSet.OddEven.push(TPre + this.XF.getOddEven(iNum));
      this.NumSet.BigSmall.push(TPre + this.XF.getBigSmall(iNum, this.midNum));
      this.NumSet.SumOE.push(TPre + this.XF.getTotalOE(snum));
      this.NumSet.TailBS.push(TPre + this.XF.getTailBS(snum));
      this.NumSet.C3Dragon.push(TPre + this.getC3Dragon(iNum));
      this.NumSet.Direction.push(TPre + this.getDirection(iNum));
      this.NumSet.Sum += iNum;
    });
    this.NumSet.DragonTiger = this.getDragonTiger(anums);
    this.NumSet.SumTOE = this.XF.getOddEven(this.NumSet.Sum);
    this.NumSet.SumTBS = this.XF.getBigSmall(this.NumSet.Sum, this.midTNum, this.tieNum);
    this.NumSet.SumTailBS = this.XF.getTailBS(this.NumSet.Sum);
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
  private getDragonTiger(v: string[]) {
    const key = 4;
    const n = v.length;
    const ans: number[] = new Array(n);
    for (let i = 0; i < key; i++) {
      const lt = n - i - 1;
      const a = parseInt(v[i], 10);
      const b = parseInt(v[lt], 10);
      ans[i] = (i + 1) * 10 + (a > b ? 0 : 1);
      ans[lt] = (n - i) * 10 + (ans[i] ? 0 : 1 );
    }
    return ans;
  }
}

// const snum: string = "6,1,3";
// console.log(new C3DNum(snum).Nums);
