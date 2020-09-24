import {ID3Nums} from "./if";
import * as SFunc from "./SFunc";

export class D3OneNum {
  get Nums() {
    return this.OneNum;
  }
  private OneNum: ID3Nums;
  private Num: number;
  private MidNum = 5; // < 小, 其他大
  private getOddEven = SFunc.OddEven;
  private getBigSmall = SFunc.BigSmall;
  private getPrime = SFunc.PrimeOrNot;
  constructor(snum: string | number) {
    if (typeof(snum) === "string") {
      this.Num = parseInt(snum, 10);
    } else {
      this.Num = snum;
    }
    if (this.Num > 9) { this.Num = this.Num % 10; }
    this.OneNum = {
      Num: this.Num,
      OddEven:  this.getOddEven(this.Num),
      BigSmall: this.getBigSmall(this.Num, this.MidNum),
      Prime: this.getPrime(this.Num)
    };
  }
}
