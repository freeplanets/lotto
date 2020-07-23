import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 單碼
    NumTarget: "RGNums",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1
  },
  {
    BetTypes: 2,              // 單雙
    NumTarget: "OddEven",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1,
  },
  {
    BetTypes: 3,              // 大小
    NumTarget: "BigSmall",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1,
  },
  {
    BetTypes: 4,              // 合數單雙
    NumTarget: "SumOE",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1
  },
  {
    BetTypes: 5,              // 尾數大小
    NumTarget: "TailBS",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1
  },
  {
    BetTypes: 7,              // 方位 % 4 餘 1 東  2 南 3 西 0 北
    NumTarget: "Direction",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1
  },
  /*
  Sum: 0,
  SumOE: 0,
  SumBS: 0,
  */
  {
    BetTypes: 9,              // 中發白 Red / Green / White Dragon 中 < 8 ,7 < 發 < 15, 白 > 14
    NumTarget: "C3Dragon",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1
  },
  {
      BetTypes: 10,             // 總和大小  sum 8 num : 小 < 84 ,大 > 84, 和 = 84 , 大 0,小 1 ,和 2
      NumTarget: "SumTBS",
      TieNum: 2,
      OpenAll: 1
  },
  {
    BetTypes: 11,             // 總和單雙
    NumTarget: "SumTOE",
    OpenAll: 1
  },
  {
    BetTypes: 12,              // 總和尾數大小  大 > 4 ,小 < 5
    NumTarget: "SumTailBS",
    OpenAll: 1
  },
  {
    BetTypes: 13,              // 龍虎
    NumTarget: "DragonTiger",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1
  },
  {
    BetTypes: 14,                 // 正碼
    NumTarget: "Nums",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1
  },
  {
    BetTypes: 15,                 // 任選二
    NumTarget: "Nums",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    PType: "EACH",
    OpenAll: 2
  },
  {
    BetTypes: 16,                 // 選二連組
    NumTarget: "Nums",
    Position: [0, 1],
    PType: "EACH",
    OpenAll: 2
  },
  {
    BetTypes: 17,           // 任選三
    NumTarget: "Nums",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    PType: "EACH",
    OpenAll: 3
  },
  {
    BetTypes: 18,           // 選三前組
    NumTarget: "Nums",
    Position: [0, 1, 2],
    PType: "EACH",
    OpenAll: 3
  },
  {
    BetTypes: 19,              // 任選四
    NumTarget: "Nums",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    PType: "EACH",
    OpenAll: 4
  },
  {
    BetTypes: 20,              // 任選五
    NumTarget: "Nums",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    PType: "EACH",
    OpenAll: 5
  }
];
export default SettleNums;
