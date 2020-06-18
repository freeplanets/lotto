interface INumSet {
  Num: number;
  OddEven: number;
  BigSmall: number;
}
export interface ID3Nums extends INumSet {
  Prime: number;
}
export interface ISum3 extends INumSet {
  SumPos: number;
  Tail: number;
}
export interface ITwoNums {
  Num: number;
  SumPos: number;
  SumOE: number;
  SumTail: number;
  SumTailBS: number;
  SumTailPrime: number;
}
