import {IHNums} from "./if";
import * as SFunc from "./SFunc";

export class OeBsP {
  get Nums() {
    return this.OneNum;
  }
  private OneNum: IHNums;
  //private Num: number;
  private MidNum:number; // < 小, 其他大
  private getOddEven = SFunc.OddEven;
  private getBigSmall = SFunc.BigSmall;
  private getPrime = SFunc.PrimeOrNot;
  constructor(snum: string[]) {
    //if(!this.MidNum) this.MidNum=5;
    this.MidNum=Math.round(snum.length*9/2);
    let Num:number=0;
    snum.map(n=>{
      Num+=parseInt(n,10);
    });
    //if (this.Num > 9) { this.Num = this.Num % 10; }
    this.OneNum = {
      Num,
      OddEven:  this.getOddEven(Num),
      BigSmall: this.getBigSmall(Num, this.MidNum),
    };
    if(snum.length===1){
      this.OneNum.Prime = this.getPrime(Num)
    }
  }
}
