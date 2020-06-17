import * as SFunc from './SFunc'
import {ITwoNums} from './if';

export class D3TwoNums {
  private tn:ITwoNums;
  private MidNum:number=5;
  constructor(n1:string,n2:string){
    const num=parseInt(n1+n2,10);
    const sum=parseInt(n1,10)+parseInt(n2,10);
    const sumtail=this.getSumTail(sum);
    this.tn= {
      Num: num,
      SumPos: this.getSumPos(sum),
      SumOE: this.getSumOE(sum),
      SumTail: sumtail,
      SumTailBS: this.getSumTailBS(sumtail,this.MidNum),
      SumTailPrime: this.getSumTailPrime(sumtail)
    }
  }
  private getSumOE=SFunc.OddEven;
  private getSumTail = SFunc.Tail;
  private getSumTailBS = SFunc.BigSmall;
  private getSumTailPrime = SFunc.PrimeOrNot;
  private getSumPos(sum:number){
    if(sum <=4) return 4;
    if(sum >=14) return 14;
    return sum;
  }
  get Nums(){
    return this.tn;
  }  
}