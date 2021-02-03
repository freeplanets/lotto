import XFunc from "../XFunc";

interface ID234 {
  D2: number;
  D2Head: number;
  D3: number;
  D4: number;
}
interface ISets23 {
  D2: number[];
  D2Head: number[];
  D3: number[];
  D4: number[];
}
export interface ISGPoolsResult {
  Nums: string[];
  Place: ID234[];   // 前三獎
  NumSet23: ISets23;
  OddEven: number[];
  BigSmall: number[];
  SumOddEven: number[];
  SumBigSmall: number[];
}
export class SGPoolsResult {
  get Nums() {
    return this.NumSet;
  }
  private XF = new XFunc();
  private midNum = 5000;
  private tMidNum = 18;
  private NumSet: ISGPoolsResult = {
    Nums: [],
    Place: [],
    NumSet23: { D2: [], D2Head: [], D3: [], D4: []},
    OddEven: [],
    BigSmall: [],
    SumOddEven: [],
    SumBigSmall: []
  };
  constructor(private nums: string) {
    const anums = nums.split(",");
    const Sum: number = 0;
    anums.map((num, idx) => {
      // if(!this.NumSet.RGNums) this.NumSet.RGNums=[];
      const snum = this.chkNum(num);
      const d = this.get234D(snum);
      const TPre = (idx + 1) * 10;
      if (idx < 3) {
        this.NumSet.Place.push(d);
        const bs = this.XF.getBigSmall(snum, this.midNum);
        const oe = this.XF.getOddEven(snum);
        const tbs = this.XF.getTotalBS(snum, this.tMidNum);
        const toe = this.XF.getTotalOE(snum);
        this.NumSet.BigSmall.push(bs + TPre);
        this.NumSet.OddEven.push(oe + TPre);
        this.NumSet.SumBigSmall.push(tbs + TPre);
        this.NumSet.SumOddEven.push(toe + TPre);
      }
      this.AddNumNoDuplicate(this.NumSet.NumSet23.D2, d.D2);
      this.AddNumNoDuplicate(this.NumSet.NumSet23.D2Head, d.D2Head);
      this.AddNumNoDuplicate(this.NumSet.NumSet23.D3, d.D3);
      this.AddNumNoDuplicate(this.NumSet.NumSet23.D4, d.D4);
      /*
      this.NumSet.NumSet23.D2.push(d.D2);
      this.NumSet.NumSet23.D2Head.push(d.D2Head);
      this.NumSet.NumSet23.D3.push(d.D3);
      this.NumSet.NumSet23.D4.push(d.D4);
      */
      this.NumSet.Nums.push(snum);
    });
  }
  private AddNumNoDuplicate(arr: number[], num: number) {
    if (arr.indexOf(num) < 0) { arr.push(num); }
  }
  private chkNum(snum: string) {
    while (snum.length < 4) {
      snum = "0" + snum;
    }
    return snum;
  }
  private get234D(snum: string): ID234 {
    const tmp: ID234 = {
      D2: this.parseToInt(snum.substr(-2)),
      D2Head: this.parseToInt(snum.substr(0, 2)),
      D3: this.parseToInt(snum.substr(-3)),
      D4: this.parseToInt(snum)
    };
    return tmp;
  }
  private parseToInt(v: number|string): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    return v;
  }
}
