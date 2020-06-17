interface INumSet {
  Num: number;
  OddEven: number;
  BigSmall: number;
}
export interface I3DNums extends INumSet{
  Prime: number;
}
export interface ISum3 extends INumSet {
  SumPos:number;
  Tail:number;
}
export interface ITwoNums {
  Num:number;
  SumPos:number;
  SumOE:number;
  SumTail:number;
  SumTailBS:number;
  SumTailPrime:number;
}