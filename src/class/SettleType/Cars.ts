import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 1-10名 車號
    NumTarget: "RGNums",
    Position: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    OpenAll: 1
  },
  {
    BetTypes: 2,              // 1-10名 大小
    NumTarget: "BigSmall",
    Position: [0, 1, 2, 3, 4, 5, 6, 7],
    OpenAll: 1,
  },
  {
    BetTypes: 3,              // 1-10名 單雙
    NumTarget: "OddEven",
    Position: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    OpenAll: 1,
  },
  {
    BetTypes: 4,              // 1-5 龍虎
    NumTarget: "DragonTiger",
    Position: [0, 1, 2, 3, 4],
    OpenAll: 1
  },
  {
    BetTypes: 5,              // 冠亞和大小
    NumTarget: "First2Sum",
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
    BetTypes: 6,              // 冠亞和單雙
    NumTarget: "First2Sum",
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 7,              // 冠亞和值
    NumTarget: "First2Sum",
    SubName: "Num",
    OpenAll: 1
  },
  {
    BetTypes: 8,             // 前2組合
    NumTarget: "Nums",
    Position: [0, 1],
    PType: "EACH",
    OpenAll: 2
  },
  {
    BetTypes: 9,              // 前3組合
    NumTarget: "Nums",
    Position: [0, 1, 3],
    PType: "EACH",
    OpenAll: 3
  },
  {
    BetTypes: 10,              // 前4組合
    NumTarget: "Nums",
    Position: [0, 1, 2, 3],
    PType: "EACH",
    OpenAll: 4
  }
];
export default SettleNums;
