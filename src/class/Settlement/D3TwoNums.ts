import {ITwoNums} from "./if";
import * as SFunc from "./SFunc";

export class D3TwoNums {
  get Nums() {
    return this.tn;
  }
  private tn: ITwoNums;
  private MidNum: number = 5;
  private getSumOE = SFunc.OddEven;
  private getSumTail = SFunc.Tail;
  private getSumTailBS = SFunc.BigSmall;
  private getSumTailPrime = SFunc.PrimeOrNot;
  constructor(n1: string, n2: string) {
    const num = parseInt(n1 + n2, 10);
    const sum = parseInt(n1, 10) + parseInt(n2, 10);
    const sumtail = this.getSumTail(sum);
    this.tn = {
      Num: num,
      SumPos: this.getSumPos(sum),
      SumOE: this.getSumOE(sum),
      SumTail: sumtail,
      SumTailBS: this.getSumTailBS(sumtail, this.MidNum),
      SumTailPrime: this.getSumTailPrime(sumtail)
    };
  }
  private getSumPos(sum: number) {
    if (sum <= 4) { return 4; }
    if (sum >= 14) { return 14; }
    return sum;
  }
}
