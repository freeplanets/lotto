import XFunc from "../XFunc";

interface D234 {
  D2:number;
  D2Head:number;
  D3:number;
  D4:number;
}
interface Sets23 {
  Length:23,
  D2:number[];
  D2Head:number[];
  D3:number[];
  D4:number[];
}
export interface ISGPoolsResult {
  Nums: string[];
  Place:D234[];   //前三獎
  NumSet23:Sets23;
  OddEven: number[];
  BigSmall: number[];
  SumOddEven: number[];
  SumBigSmall: number[];
}
export class SGPoolResult {
  private XF = new XFunc();
  private midNum = 5000;
  private tMidNum = 18;
  get Nums() {
    return this.NumSet;
  }
  private NumSet: ISGPoolsResult = {
    Nums: [],
    Place:[],
    NumSet23: { Length:23,D2:[],D2Head:[],D3:[],D4:[]},
    OddEven: [],
    BigSmall: [],
    SumOddEven:[],
    SumBigSmall:[]    
  };
  constructor(private nums: string) {
    const anums = nums.split(",");
    let Sum: number = 0;
    anums.map((num, idx) => {
      // if(!this.NumSet.RGNums) this.NumSet.RGNums=[];
      const snum=this.chkNum(num);
      const d=this.get234D(snum);
      const TPre = (idx + 1) * 10;
      if(idx < 3){
        this.NumSet.Place.push(d);
        const bs=this.BigSmall(snum,this.midNum);
        const oe=this.OddEven(snum);
        const tbs=this.SumBigSmall(snum,this.tMidNum);
        const toe=this.SumOddEven(snum)
        this.NumSet.BigSmall.push(bs+TPre);
        this.NumSet.OddEven.push(oe+TPre);
        this.NumSet.SumBigSmall.push(tbs+TPre);
        this.NumSet.SumOddEven.push(toe+TPre);
      }
      this.NumSet.NumSet23.D2.push(d.D2);
      this.NumSet.NumSet23.D2Head.push(d.D2Head);
      this.NumSet.NumSet23.D3.push(d.D3);
      this.NumSet.NumSet23.D4.push(d.D4);
      this.NumSet.Nums.push(snum);
    });
  }
  private chkNum(snum:string){
    while(snum.length<4){
      snum='0'+snum;
    }
    return snum;
  }
  private get234D(snum:string):D234{
    const tmp:D234={
      D2:this.parseToInt(snum.substr(-2)),
      D2Head:this.parseToInt(snum.substr(0,2)),
      D3:this.parseToInt(snum.substr(-3)),
      D4:this.parseToInt(snum)
    }
    return tmp;
  }
  private OddEven=this.XF.getOddEven;
  private BigSmall=this.XF.getBigSmall;
  private SumBigSmall=this.XF.getTotalBS;
  private SumOddEven=this.XF.getTotalOE;
  private parseToInt(v: number|string): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    return v;
  }
}