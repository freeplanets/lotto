import MSNum, {IMarkSixNums} from "../MSNum";
import XFunc from "../XFunc";
const SevenOE: number[] = [];  // "單/雙"數量
const SevenBS: number[] = [];  // "大/小"數量
SevenOE["00"] = 0;
SevenOE["01"] = 1;
SevenOE["02"] = 2;
SevenOE["03"] = 3;
SevenOE["04"] = 4;
SevenOE["05"] = 5;
SevenOE["06"] = 6;
SevenOE["07"] = 7;
SevenOE["10"] = 8;
SevenOE["11"] = 9;
SevenOE["12"] = 10;
SevenOE["13"] = 11;
SevenOE["14"] = 12;
SevenOE["15"] = 13;
SevenOE["16"] = 14;
SevenOE["17"] = 15;
SevenBS["00"] = 16;
SevenBS["01"] = 17;
SevenBS["02"] = 18;
SevenBS["03"] = 19;
SevenBS["04"] = 20;
SevenBS["05"] = 21;
SevenBS["06"] = 22;
SevenBS["07"] = 23;
SevenBS["10"] = 24;
SevenBS["11"] = 25;
SevenBS["12"] = 26;
SevenBS["13"] = 27;
SevenBS["14"] = 28;
SevenBS["15"] = 29;
SevenBS["16"] = 30;
SevenBS["17"] = 31;

const SixOE: number[] = [];  // "單/雙"數量
const SixBS: number[] = [];  // "大/小"數量
SixOE["00"] = 0;
SixOE["01"] = 1;
SixOE["02"] = 2;
SixOE["03"] = 3;
SixOE["04"] = 4;
SixOE["05"] = 5;
SixOE["06"] = 6;
SixOE["10"] = 7;
SixOE["11"] = 8;
SixOE["12"] = 9;
SixOE["13"] = 10;
SixOE["14"] = 11;
SixOE["15"] = 12;
SixOE["16"] = 13;
SixBS["00"] = 14;
SixBS["01"] = 15;
SixBS["02"] = 16;
SixBS["03"] = 17;
SixBS["04"] = 18;
SixBS["05"] = 19;
SixBS["06"] = 20;
SixBS["10"] = 21;
SixBS["11"] = 22;
SixBS["12"] = 23;
SixBS["13"] = 24;
SixBS["14"] = 25;
SixBS["15"] = 26;
SixBS["16"] = 27;
/**
 * 特碼其他
 */
interface ISPOther {
     Zodiac?: number;         // 生肖
     OddEven?: number;        // 單雙
     BigSmall?: number;       // 大小
     TOddEvent?: number;
     TailBS?: number;
 }
 /*
 class MarkSixMum implements IMarkSixNums{
    Num:number;
    OddEven:number;
    BigSmall:number;
    ColorWave:number;
    TailNum:number;
    TailOE:number;
    TailBS:number;
    Total:number;
    TotOE:number;
    TotBS:number;
    constructor(num:string){
        this.Num = parseInt(num);
    }

 }
 */
export interface IMSResult {
     Nums: number[];
     RegularNums: number[];
     SPNo: number;
     RGNums: IMarkSixNums[];
     SPNum: IMarkSixNums;
     Sum: number;
     SumOE: number;
     SumBS: number;
     tailNums: number[];
     Zadic: number[];
     Seven: number[];
     DragonTiger: number[];
}
/**
 *  六合彩
 *  正碼1, 正碼2,正碼3,正碼4,正碼5,正碼6,特碼,
 *   0   ,  1   , 2  ,  3  , 4  ,  5  , 6   <--彩球順序
 *   0  <-
 *   1
 *   2
 *   總和中位數 175
 *
 */
export class CMarkSixMum {
  private imsr: IMSResult = {
      Nums: [],
      RegularNums: [],
      SPNo: 0,
      RGNums: [],
      SPNum: {} as IMarkSixNums,
      Sum: 0,
      SumOE: 0,
      SumBS: 0,
      tailNums: [],
      Zadic: [],
      Seven: [],
      DragonTiger: []
  };
  private xf = new XFunc();
  private totalMidNum = 175;
  private SOE = SevenOE;
  private SBS = SevenBS;
  constructor(num: string, hasZero?: boolean) {
      const nums: string[] = num.split(",");
      nums.map((itm) => {
          this.imsr.Nums.push(parseInt(itm, 10));
          this.imsr.Sum += this.xf.toInt(itm);
      });
      this.imsr.SumOE = this.xf.getOddEven(this.imsr.Sum);
      this.imsr.SumBS = this.xf.getBigSmall(this.imsr.Sum, this.totalMidNum);
      this.imsr.tailNums = this.TailNums(nums);
      const sp: string = nums.pop() as string;
      // this.imsr.RegularNums = nums;
      nums.map((itm) => {
          this.imsr.RegularNums.push(parseInt(itm, 10));
      });
      if (!hasZero) {
        this.imsr.SPNo = parseInt(sp, 10);
        this.imsr.SPNum = new MSNum(this.imsr.SPNo, true).Num;
      } else {
          this.SBS = SixBS;
          this.SOE = SixOE;
      }
      this.imsr.RGNums = [];
      nums.map((elm) => {
          this.imsr.RGNums.push(new MSNum(parseInt(elm, 10), false, hasZero).Num);
      });
      this.SevenOB();
      this.DragonTiger();
  }
  get Nums(): IMSResult {
      return this.imsr;
  }
  private TailNums(nums: string[]) {
      const tmp: number[] = [];
      nums.map((itm) => {
          const tailnum: number = this.xf.getTail(itm);
          const ans = tmp.find((elm) => elm === tailnum);
          if (ans === undefined) {
              tmp.push(tailnum);
          }
      });
      return tmp.sort();
  }
  private SevenOB() {
      const tmp: number[] = [];
      let OddCnt: number = 0;
      let EvenCnt: number = 0;
      let BigCnt: number = 0;
      let SmallCnt: number = 0;
      const zd: number[] = [];
      this.imsr.RGNums.map((itm) => {
          if (itm.OddEven === 1) {
              EvenCnt++;
          } else {
              OddCnt++;
          }
          if (itm.BigSmall === 1) {
              SmallCnt++;
          } else {
              BigCnt++;
          }
          const fzd = zd.find((elm) => elm === itm.Zadic);
          // console.log("find zadic:", fzd, itm.Num, itm.Zadic);
          if (!fzd) {
              zd.push(itm.Zadic as number);
          }
          // console.log("find zadic", fzd, itm.Zadic, zd);
      });
      if (this.imsr.SPNum.OddEven === 1) {
          EvenCnt++;
      } else {
          OddCnt++;
      }
      if (this.imsr.SPNum.BigSmall === 1) {
          SmallCnt++;
      } else {
          BigCnt++;
      }
      const sfzd = zd.find((elm) => elm === this.imsr.SPNum.Zadic);
      if (!sfzd) {
          zd.push(this.imsr.SPNum.Zadic as number);
      }
      tmp.push(this.SOE["0" + OddCnt]);
      tmp.push(this.SOE["1" + EvenCnt]);
      tmp.push(this.SBS["0" + BigCnt]);
      tmp.push(this.SBS["1" + SmallCnt]);
      this.imsr.Seven = tmp;
      this.imsr.Zadic = zd;
  }
  private DragonTiger() {
      const len = this.imsr.RegularNums.length;
      let i: number = 0;
      let j: number = len - 1;
      do {
          const H: number = this.imsr.RegularNums[i];
          const T: number = this.imsr.RegularNums[j];
          const R: number = H > T ? 0 : 1;
          if (i === 0) {
              this.imsr.DragonTiger.push(R);
          } else {
              this.imsr.DragonTiger.push(i * 10 + R);
          }
          i = i + 1;
          j = j - 1;
      } while (i < j);
      /*
      for (let i = 0; i < len; i++) {
          for (let j = len - 1; j >= 0; j--) {
              const H: number = this.imsr.RegularNums[i];
              const T: number = this.imsr.RegularNums[j];
              const R: number = H > T ? 0 : 1;
              if (i === 0) {
                  this.imsr.DragonTiger.push(R);
              } else {
                  this.imsr.DragonTiger.push(i * 10 + R);
              }
          }
      }
      */
  }
}
