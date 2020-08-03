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
  constructor(private Total: number, private tieNum: number) {
    this.OneNum = {
      OddEven:  this.XF.getOddEven(Total, tieNum),
      BigSmall: this.XF.getBigSmall(Total, tieNum, tieNum),
      Total810: Total === tieNum ? 0 : 1,
      Pass: 0
    };
    this.OneNum.Pass = Total === tieNum ? 4 : this.getPass();
  }
  // 大單 0,大雙 1,小單 2,小雙 3
  private getPass() {
    const pass = ["00", "01", "10", "11"];
    const BS = this.XF.getBigSmall(this.Total, this.tieNum);
    const OE = this.XF.getOddEven(this.Total);
    console.log("BS:", BS, this.Total, this.tieNum);
    return pass.indexOf(BS + "" + OE);
  }
}
