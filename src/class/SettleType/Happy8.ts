import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 單碼
    NumTarget: "Nums",
    Position: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
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
    SubName: "PASS",
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
  }
];
export default SettleNums;
