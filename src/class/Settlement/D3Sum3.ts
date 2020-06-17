import * as SFunc from './SFunc'
import {ISum3} from './if';

export class D3Sum3 {
  private OneNum:ISum3;
  private MidNum=14; // < 小, 其他大
  constructor(Num:number){
    this.OneNum = {
      Num,
      OddEven:  this.getOddEven(Num),
      BigSmall: this.getBigSmall(Num,this.MidNum),
      SumPos: this.getSum3(Num),
      Tail: this.getTail(Num)
    }
  }
  private getOddEven=SFunc.OddEven;
  private getBigSmall=SFunc.BigSmall;
  private getSum3=SFunc.fSum3;
  private getTail=SFunc.Tail;
  get Nums(){
    return this.OneNum;
  }
}