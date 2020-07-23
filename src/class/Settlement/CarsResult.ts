import XFunc from "../XFunc";

export interface IFirst2Sum {
  Num: number;
  OddEven: number;
  BigSmall: number;
}
export interface ICarsResult {
  Nums: string[];
  RGNums: number[];
  OddEven: number[];
  BigSmall: number[];
  DragonTiger: number[];
  First2Sum: IFirst2Sum;
}
export class CarsResult {
  private XF = new XFunc();
  private midNum = 11;
  private midTNum = 84;
  private tieNum = 84;
  get Nums() {
    return this.NumSet;
  }
  private NumSet: ICarsResult = {
    Nums: [],
    RGNums: [],
    OddEven: [],
    BigSmall: [],
    DragonTiger: [],
    First2Sum: {
      Num: 0,
      BigSmall: 0,
      OddEven: 0
    }
  };
  constructor(private nums: string) {
    const anums = nums.split(",");
    anums.map((snum, idx) => {
      // if(!this.NumSet.RGNums) this.NumSet.RGNums=[];
      const HPre = (idx + 1) * 10;
      const TPre = (idx + 1) * 10;
      const iNum = parseInt(snum, 10);
      this.NumSet.RGNums.push(HPre + iNum);
      this.NumSet.Nums.push(snum);
      this.NumSet.OddEven.push(TPre + this.XF.getOddEven(iNum));
      this.NumSet.BigSmall.push(TPre + this.XF.getBigSmall(iNum, this.midNum));
    });
    this.NumSet.DragonTiger = this.getDragonTiger(anums);
    this.NumSet.First2Sum = this.getFirst2Sum(anums[0], anums[1]);
  }
  private getFirst2Sum(v1: number|string, v2: number|string) {
    const midNum = 12;
    const f2: IFirst2Sum = {
      Num: 0,
      BigSmall: 0,
      OddEven: 0
    };
    v1 = this.parseToInt(v1);
    v2 = this.parseToInt(v2);
    f2.Num = v1 + v2;
    f2.BigSmall = this.XF.getBigSmall(f2.Num, midNum);
    f2.OddEven = this.XF.getOddEven(f2.Num);
    return f2;
  }
  private parseToInt(v: number|string): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    return v;
  }
  private getDragonTiger(v: string[]) {
    const key = 5;
    const n = v.length;
    const ans: number[] = new Array(key);
    for (let i = 0; i < key; i++) {
      const lt = n - i - 1;
      const a = parseInt(v[i], 10);
      const b = parseInt(v[lt], 10);
      ans[i] = (i + 1) * 10 + (a > b ? 0 : 1);
    }
    return ans;
  }
}

// const snum: string = "6,1,3";
// console.log(new C3DNum(snum).Nums);
