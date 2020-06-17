import * as SFunc from './SFunc'
import {I3DNums} from './if';

export class D3OneNum {
  private OneNum:I3DNums;
  private Num:number;
  private MidNum=5; // < 小, 其他大
  constructor(snum:string){
    this.Num = parseInt(snum,10);
    if(this.Num>9) this.Num = this.Num % 10;
    this.OneNum = {
      Num: this.Num,
      OddEven:  this.getOddEven(this.Num),
      BigSmall: this.getBigSmall(this.Num,this.MidNum),
      Prime: this.getPrime(this.Num)
    }
  }
  private getOddEven=SFunc.OddEven;
  private getBigSmall=SFunc.BigSmall;
  private getPrime=SFunc.PrimeOrNot;
  get Nums(){
    return this.OneNum;
  }
}