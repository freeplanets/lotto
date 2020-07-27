import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 單碼
    NumTarget: "RGNums",
    Position: [0, 1, 2, 3, 4],
    OpenAll: 1
  },
  {
    BetTypes: 2,              // 單雙
    NumTarget: "OddEven",
    Position: [0, 1, 2, 3, 4],
    OpenAll: 1,
  },
  {
    BetTypes: 3,              // 大小
    NumTarget: "BigSmall",
    Position: [0, 1, 2, 3, 4],
    OpenAll: 1,
  },
  {
    BetTypes: 5,              // 總和大小
    NumTarget: "Sum",
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
    BetTypes: 6,              // 總和單雙
    NumTarget: "Sum",
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 7,              // 龍虎 第一球 > 第五球 龍 0 ,反之 虎 1, 和局 2
    NumTarget: "DragonTiger",
    SubName: "Num",
    OpenAll: 1
  },
  {
    BetTypes: 8,              // 龍虎和局 0 ,反之 1
    NumTarget: "DragonTiger",
    SubName: "Tie",
    OpenAll: 1
  },
  /*
  Sum: 0,
  SumOE: 0,
  SumBS: 0,
  */
  {
    BetTypes: 12,              // 中三  豹子 1, 順子 2, 對子 3,半順 4, 雜六 5
    NumTarget: "First3",
    OpenAll: 1
  },
  {
    BetTypes: 13,              // 中三  豹子 1, 順子 2, 對子 3,半順 4, 雜六 5
    NumTarget: "Middle3",
    OpenAll: 1
  },
  {
    BetTypes: 14,             // 後三 豹子 1, 順子 2, 對子 3,半順 4, 雜六 5
    NumTarget: "Last3",
    OpenAll: 1
  },
];
export default SettleNums;
