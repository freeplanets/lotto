import XFunc from "../XFunc";

export interface IAWDT {
  Num: number;
  Tie: number;
}
export interface IBS {
  BigSmall: number;
  OddEven: number;
}

export interface IAlwaysResult {
  Nums: string[];
  RGNums: number[];
  OddEven: number[];
  BigSmall: number[];
  Sum: IBS;
  DragonTiger: IAWDT;
  First3: number;
  Middle3: number;
  Last3: number;
}
export class AlwaysResult {
  private XF = new XFunc();
  private midNum = 23;
  get Nums() {
    return this.NumSet;
  }
  private NumSet: IAlwaysResult = {
    Nums: [],
    RGNums: [],
    OddEven: [],
    BigSmall: [],
    Sum: {
      BigSmall: 0,
      OddEven: 0
    },
    DragonTiger: {
      Num: 0,
      Tie: 0
    },
    First3: 0,
    Middle3: 0,
    Last3: 0
  };
  constructor(private nums: string) {
    const anums = nums.split(",");
    let Sum: number = 0;
    anums.map((snum, idx) => {
      // if(!this.NumSet.RGNums) this.NumSet.RGNums=[];
      const HPre = (idx + 1) * 10;
      const TPre = (idx + 1) * 10;
      const iNum = parseInt(snum, 10);
      Sum += iNum;
      this.NumSet.RGNums.push(HPre + iNum);
      this.NumSet.Nums.push(snum);
      this.NumSet.OddEven.push(TPre + this.XF.getOddEven(iNum));
      this.NumSet.BigSmall.push(TPre + this.XF.getBigSmall(iNum, this.midNum));
    });
    this.NumSet.Sum.BigSmall = this.XF.getBigSmall(Sum, this.midNum);
    this.NumSet.Sum.OddEven = this.XF.getOddEven(Sum);
    this.NumSet.DragonTiger = this.getDragonTiger(anums[0], anums[4]);
    this.NumSet.First3 = this.getOthers(anums[0] + anums[1] + anums[2]);
    this.NumSet.Middle3 = this.getOthers(anums[1] + anums[2] + anums[3]);
    this.NumSet.Last3 = this.getOthers(anums[2] + anums[3] + anums[4]);
  }
  private parseToInt(v: number|string): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    return v;
  }
  private getDragonTiger(hd: string, tl: string) {
    const awdt: IAWDT = {
      Num: 2,
      Tie: 1,
    };
    if (hd === tl) {
      awdt.Tie = 0;
    }
    if (awdt.Tie !== 0) {
      awdt.Num = hd > tl ? 0 : 1;
    }
    return awdt;
  }
  // 豹子 1, 順子 2, 對子 3,半順 4, 雜六 5
  private getOthers(n: string) {
    const tmpN: string[] = n.split("");
    const chk1 = this.getSame(tmpN);
    if (chk1 === 1) { return 1; }
    if (chk1 === 2) { return 3; }
    return this.chkStraight(tmpN);
  }
  private chkStraight(s: string[]) {
    s.sort();
    const str = s.join("");
    if (str === "019" || str === "089") { return 2; }
    const inum: number[] = [];
    s.map((sr) => {
      inum.push(this.parseToInt(sr));
    });
    const k1 = inum[1] - inum[0];
    const k2 = inum[2] - inum[1];
    if (k1 === 1 && k2 === 1) { return 2; }
    if ((k1 === 1 || k2 === 1) && k1 + k2 !== 2) { return 4; }
    return 5;
  }
  private getSame(s: string[]) {
    const chk: string[] = [];
    s.map((sn) => {
      if (chk.indexOf(sn) === -1) { chk.push(sn); }
    });
    return chk.length;
  }
}

// const snum: string = "6,1,3";
// console.log(new C3DNum(snum).Nums);
