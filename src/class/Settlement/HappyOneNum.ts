import XFunc from "../XFunc";
import {IHappyNums} from "./if";
const XF = new XFunc();
export class D3OneNum {
  get Nums() {
    return this.OneNum;
  }
  /*
  四季 除以5的商 <=1 春, <=2 夏, <=3 秋, <= 4 東
  private FourSeason:number[][]=[
    [1,2,3,4,5],
    [6,7,8,9,10],
    [11,12,13,14,15],
    [16,17,18,19,20]
  ];
  */
  /*
  五行 除以5的餘數  0 金, 1 木, 2 水, 3 火, 4 土
  private FiveElement:number[][]=[
    [5,10,15,20],
    [1,6,11,16],
    [2,7,12,17],
    [3,8,13,18],
    [4,9,14,19]
  ]
  */
  /*
  方位 除以4的餘數 1 東, 2 南, 3 西, 0 北
  private Direction: number[][]=[
    [1,5,9,13,17],
    [2,6,10,14,18],
    [3,7,11,15,19],
    [4,8,12,16,20]
  ];
  */
 /*
  中發白 除以7的商 <=1 中, <=2 發, <=3 白
  private C3Dragon: number[][]=[
    [1,2,3,4,5,6,7],
    [8,9,10,11,12,13,14],
    [15,16,17,18,19,20]
  ]
  */
  private OneNum: IHappyNums;
  private Num: number;
  private MidNum = 11; // < 小, 其他大
  private getOddEven = XF.getOddEven;
  private getBigSmall = XF.getBigSmall;
  private getTailBS = XF.getTailBS;
  constructor(snum: string) {
    this.Num = parseInt(snum, 10);
    if (this.Num > 9) { this.Num = this.Num % 10; }
    this.OneNum = {
      Num: this.Num,
      OddEven:  this.getOddEven(this.Num),
      BigSmall: this.getBigSmall(this.Num, this.MidNum),
      SumOE: this.getOddEven(this.Num),
      TailBS: this.getTailBS(this.Num),
      DragonTiger: 0,
      Direction: this.getDirection(this.Num),
      C3Dragon: this.getC3Dragon(this.Num)
    };
  }
  private getSumOE(v: string|number) {
    if (typeof(v) === "number") { v = v + ""; }
    const tmp: string[] = v.split("");
    let t: number = 0;
    tmp.map((itm) => {
      t = t + parseInt(itm, 10);
    });
    return XF.getOddEven(t);
  }
  private getC3Dragon(v: string|number): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    return Math.ceil(v / 3) - 1;
  }
  private getDirection(v: string|number): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    let a: number = (v % 4) - 1;
    a = a < 0 ? 3 : a;
    return a;
  }
}
