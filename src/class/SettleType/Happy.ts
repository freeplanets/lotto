import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 單碼
    NumTarget: "Nums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    PType: "INDEX",
    OpenAll: 1
  },
  {
    BetTypes: 2,              // 單雙
    NumTarget: "RGNums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    SubName: "OddEven",
    PType: "INDEX",
    OpenAll: 1,
  },
  {
    BetTypes: 3,              // 大小
    NumTarget: "RGNums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    SubName: "BigSmall",
    PType: "INDEX",
    OpenAll: 1,
  },
  {
    BetTypes: 4,              // 合數單雙
    NumTarget: "RGNums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    SubName: "SumOE",
    PType: "INDEX",
    OpenAll: 1
  },
  {
    BetTypes: 5,              // 尾數大小
    NumTarget: "尾數大小",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    SubName: "TailBS",
    PType: "INDEX",
    OpenAll: 1
  },
  {
    BetTypes: 7,              // 方位 % 4 餘 1 東  2 南 3 西 0 北
    NumTarget: "RGNums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    SubName: "Direction",
    PType: "INDEX",
    OpenAll: 1
  },
  /*
  Sum: 0,
  SumOE: 0,
  SumBS: 0,
  */
  {
    BetTypes: 9,              // 中發白 Red / Green / White Dragon 中 < 8 ,7 < 發 < 15, 白 > 14
    NumTarget: "RGNums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    SubName: "C3Dragon",
    PType: "INDEX",
    OpenAll: 1
  },
  {
      BetTypes: 10,             // 總和大小  sum 8 num : 小 < 84 ,大 > 84, 和 = 84
      NumTarget: "Sum",
      SubName: "BigSmall",
      OpenAll: 1
  },
  {
    BetTypes: 11,             // 總和單雙
    NumTarget: "Sum",
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 12,              // 總和尾數大小  大 > 4 ,小 < 5
    NumTarget: "Sum",
    SubName: "TailBS",
    OpenAll: 1
  },
  {
    BetTypes: 13,              // 龍虎
    NumTarget: "RGNums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    SubName: "DragonTiger",
    PType: "INDEX",
    OpenAll: 1
  },
  {
    BetTypes: 14,                 // 正碼
    NumTarget: "Nums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    OpenAll: 1
  },
  {
    BetTypes: 15,                 // 任選二
    NumTarget: "Nums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    OpenAll: 2
  },
  {
    BetTypes: 16,                 // 選二連組
    NumTarget: "Nums",
    Position: [1, 2],
    OpenAll: 2
  },
  {
    BetTypes: 17,           // 任選三
    NumTarget: "Nums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    OpenAll: 3
  },
  {
    BetTypes: 18,           // 選三前組
    NumTarget: "Nums",
    Position: [1, 2, 3],
    OpenAll: 3
  },
  {
    BetTypes: 19,              // 任選四
    NumTarget: "Nums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    OpenAll: 4
  },
  {
    BetTypes: 20,              // 任選五
    NumTarget: "Nums",
    Position: [1, 2, 3, 4, 5, 6, 7, 8],
    OpenAll: 5
  }
];
export default SettleNums;
