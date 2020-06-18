import {ISum3} from "./if";
import * as SFunc from "./SFunc";

export class D3Sum3 {
  get Nums() {
    return this.OneNum;
  }
  private OneNum: ISum3;
  private MidNum = 14; // < 小, 其他大
  private getOddEven = SFunc.OddEven;
  private getBigSmall = SFunc.BigSmall;
  private getSum3 = SFunc.fSum3;
  private getTail = SFunc.Tail;
  constructor(Num: number) {
    this.OneNum = {
      Num,
      OddEven:  this.getOddEven(Num),
      BigSmall: this.getBigSmall(Num, this.MidNum),
      SumPos: this.getSum3(Num),
      Tail: this.getTail(Num)
    };
  }
}
