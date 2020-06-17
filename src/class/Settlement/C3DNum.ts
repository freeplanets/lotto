import {I3DNums,ISum3,ITwoNums} from './if';
import {D3OneNum} from './D3OneNum';
import {D3Sum3,} from './D3Sum3';
import {D3TwoNums} from './D3TwoNums'
import * as SFunc from './SFunc'

interface I3DResult {
  Nums: number[];
  RGNums: I3DNums[];
  Sum: number;
  Sum3?:ISum3;
  Pos12?:ITwoNums;
  Pos02?:ITwoNums;
  Pos01?:ITwoNums;
  TwoNums?:number[];
  Set3All?:number;   // 組 3全包 中0,不中1
  C3S?:number|string[];
  C6S?:number|string[];
  OddEvenPass?:number;
  BigSmallPass?:number;
  PrimePass?:number;
  D3Pos?:number;
  D3NotPos?:number;
  CrossN?:number;
  Straight?:number;
  Same3?:number;  //犳子
  Pairs?:number;  //對子
  PairsNum?:number;
  StraightPart?:number // 准對
  Not6?:number; //雜六
  KillNum?:number[]
}
class C3DNum {
  private NumSet:I3DResult={
    Nums:[],
    RGNums:[],
    Sum:0
  }
  constructor(private nums:string){
    nums.split(',').map(snum=>{
      //if(!this.NumSet.RGNums) this.NumSet.RGNums=[];
      const tmp=new D3OneNum(snum).Nums
      this.NumSet.RGNums.push(new D3OneNum(snum).Nums);
      this.NumSet.Nums.push(tmp.Num);
      this.NumSet.Sum += tmp.Num;
    })
    const anum=nums.split(',');
    this.NumSet.Pos12= new D3TwoNums(anum[1],anum[2]).Nums;
    this.NumSet.Pos02= new D3TwoNums(anum[0],anum[2]).Nums;
    this.NumSet.Pos01= new D3TwoNums(anum[0],anum[1]).Nums;
    this.NumSet.Sum3 = new D3Sum3(this.NumSet.Sum).Nums;
    this.NumSet.TwoNums = this.getComb2(nums);
    this.NumSet.Set3All = this.getSet3All(nums) as number;
    this.NumSet.OddEvenPass = this.getOddEvenPass(this.NumSet.Nums);
    this.NumSet.BigSmallPass = this.getBigSmallPass(this.NumSet.Nums);
    this.NumSet.PrimePass = this.getPrimePass(this.NumSet.Nums);
    this.NumSet.D3Pos = parseInt(this.NumSet.Nums.join(''),10);
    this.NumSet.D3NotPos = this.getD3NoPos(nums);
    this.NumSet.CrossN = this.getCrossN(nums);
    this.NumSet.Straight = this.chkStraight(nums);
    const cc=SFunc.Combs(anum);
    this.NumSet.Same3 = cc.length === 1 ? 0 : 1;
    this.NumSet.Pairs = cc.length === 2 ? 0 : 1;
    this.NumSet.PairsNum = this.getPairsNum(nums);
    this.NumSet.StraightPart = this.chkStraightPart(nums);
    // 雜六 - 不包含豹子、順子、對子、半順
    this.NumSet.Not6 = this.NumSet.Sum3 && this.NumSet.Pairs && this.NumSet.Straight && this.NumSet.StraightPart ? 0 : 1;
    this.NumSet.KillNum = this.getKillNum(this.NumSet.Nums);
  }
  private getComb2=SFunc.D3TwoNums;
  private getSet3All=SFunc.D3Set3All;
  private getOddEvenPass=SFunc.OddEvenPass;
  private getBigSmallPass=SFunc.BigSmallPass;
  private getPrimePass=SFunc.PrimePass;
  private getKillNum=SFunc.ChkKillNum;
  private getD3NoPos(n:string):number{
    return parseInt(n.split(',').sort().join(''),10);
  }
  private getCrossN(n:string){
    const aNum=n.split(',').sort();
    return parseInt(aNum[2],10)-parseInt(aNum[0],10);
  }
  private chkStraight(n:string){
    const aNum=n.split(',').sort();
    if(aNum.join()==='019') return 0;
    const chk1=parseInt(aNum[1],10)-parseInt(aNum[0],10);
    const chk2=parseInt(aNum[2],10)-parseInt(aNum[1],10);
    if(chk1===1 && chk2===1) return 0;
    return 1;
  }
  private chkStraightPart(n:string){
    const aNum=n.split(',').sort();
    const chk1=parseInt(aNum[1],10)-parseInt(aNum[0],10);
    const chk2=parseInt(aNum[2],10)-parseInt(aNum[1],10);
    const b1:number = chk1===1 ? 1 : 0
    const b2:number = chk2===1 ? 1 : 0
    if(b1 ^ b2) return 0;
    return 1;
  }
  private getPairsNum(n:string){
    let fcnt:number=0;
    let fnum:number=-1;
    let arr:string[]=[];
    const aNum=n.split(',');
    aNum.map(nn=>{
      const f=arr.find(itm=>itm===nn);
      if(f){
         fnum=parseInt(f,10);
         fcnt++;
      }
      else arr.push(nn);
    })
    if(fcnt===1) return fnum;
    return -1;
  }
  get imsr(){
    return this.NumSet;
  }
}

const snum:string='6,1,3';
console.log(new C3DNum(snum).imsr);
