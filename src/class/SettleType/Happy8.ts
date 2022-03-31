import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 正碼
    NumTarget: "Nums",
    Position: -1,
    OpenAll: 1
  },
  {
    BetTypes: 2,              // 總和大小  >810 0, 1
    NumTarget: "Sum",
    SubName: "BigSmall",
    TieNum: 2,
    OpenAll: 1
  },
  {
    BetTypes: 3,              // 總和單雙
    NumTarget: "Sum",
    SubName: "OddEven",
    TieNum: 2,
    OpenAll: 1
  },
  {
    BetTypes: 4,              // 總和810
    NumTarget: "Sum",
    SubName: "Total810",
    OpenAll: 1
  },
  {
    BetTypes: 5,              // 總和過關 大單 0,大雙 1,小單 2,小雙 3
    NumTarget: "Sum",
    SubName: "Pass",
    TieNum: 4,
    OpenAll: 1
  },
  {
    BetTypes: 6,              // 前後和 前 40(含) 個數 or 後 40, 40前 多 0, 少1,平 2
    NumTarget: "Counter",
    SubName: "BigSmallS",
    OpenAll: 1
  },
  {
    BetTypes: 7,              // 單雙和 單雙個數比,單多 0,小 1,平 2
    NumTarget: "Counter",
    SubName: "OddEvenS",
    OpenAll: 1
  },
  {
    BetTypes: 8,              // 五行 和值 金(210~695) 0,木（696～763） 1,水（764～855） 2,火（856～923） 3,士（924～1410） 4
    NumTarget: "FiveElements",
    OpenAll: 1
  },
  {
    BetTypes: 9,              // 特碼
    NumTarget: "Nums",
    Position: [19],
    OpenAll: 1
  },
  {
    BetTypes: 10,           // 2星
    NumTarget: "Nums",
    Position: -1,
    OpenAll: 2,
    OpenLess: 1,
    UseExTable: true
  },
  {
    BetTypes: 11,           // 3星
    NumTarget: "Nums",
    Position: -1,
    OpenAll: 3,
    OpenLess: 2,
    UseExTable: true
  },
  {
    BetTypes: 12,           // 4星
    NumTarget: "Nums",
    Position: -1,
    OpenAll: 4,
    OpenLess: 3,
    UseExTable: true
  },
  {
    BetTypes: 13,
    NumTarget: "OddEven",
    Position: -1,
    OpenAll: 1,
  },
  {
    BetTypes: 14,
    NumTarget: "BigSmall",
    Position: -1,
    OpenAll: 1,
  },
  {
    BetTypes: 15,
    NumTarget: "TailOddEven",
    Position: -1,
    OpenAll: 1,
  },
  {
    BetTypes: 16,
    NumTarget: "TailBigSmall",
    Position: -1,
    OpenAll: 1,
  },
  {
    BetTypes: 17,
    NumTarget: "SpTail",
    OpenAll: 1,
  },
  {
    BetTypes: 18,
    NumTarget: "Tail_1_5",
    Position: -1,
    OpenAll: 1,
  },
  {
    BetTypes: 19,
    NumTarget: "Tail_6_10",
    Position: -1,
    OpenAll: 1,
  },
  {
    BetTypes: 20,
    NumTarget: "Tail_11_15",
    Position: -1,
    OpenAll: 1,
  },
  {
    BetTypes: 21,
    NumTarget: "Tail_16_20",
    Position: -1,
    OpenAll: 1,
  },
];
export default SettleNums;
