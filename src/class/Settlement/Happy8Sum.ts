import XFunc from "../XFunc";

export interface ISum {
  BigSmall: number;
  OddEven: number;
  Total810: number;
  Pass: number;
}

export class Happy8Sum {
  get Nums() {
    return this.OneNum;
  }
  private XF = new XFunc();
  private OneNum: ISum;
  constructor(Total: number, midNum: number, tieNum: number) {
    this.OneNum = {
      OddEven:  this.XF.getOddEven(Total, tieNum),
      BigSmall: this.XF.getBigSmall(Total, midNum, tieNum),
      Total810: Total === tieNum ? 0 : 1,
      Pass: 0
    };
    this.OneNum.Pass = Total === tieNum ? 4 : this.getPass();
  }
  // 大單 0,大雙 1,小單 2,小雙 3
  private getPass() {
    const pass = ["00", "01", "10", "11"];
    return pass.indexOf(this.OneNum.BigSmall + "" + this.OneNum.OddEven);
  }
}
