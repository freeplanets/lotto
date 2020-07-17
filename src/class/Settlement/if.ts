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
export interface IC36S {
  isSame3: boolean;
  isSet3: boolean;
  isSet6: boolean;
  Num: string;
}
export interface IHRGNums {
  Num: number;
  Sum: number;
  OddEven: number;
  BigSmall: number;
  C3Dragon: number;      // 中發白
  Direction: number;     // 方位
  SumOE: number;         // 合數單雙
  TailBS: number;        // 尾數大小
  DragonTiger: number;
}
