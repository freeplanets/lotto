import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 三軍
    NumTarget: "Nums",
    PType: "Multi",
    OpenAll: 1,
  },
  {
    BetTypes: 2,              // 大小(和) 11-17 大 0, 4-10 小 1, 豹子 通殺 2
    NumTarget: "BigSmall",
    OpenAll: 1,
  },
  {
    BetTypes: 3,              // 圍骰 豹子號碼
    NumTarget: "Same3",
    SubName: "Num",
    OpenAll: 1,
  },
  {
    BetTypes: 4,              // 全骰 是否為豹子
    NumTarget: "Same3",
    SubName: "ALL",
    OpenAll: 1
  },
  {
    BetTypes: 5,              // 點數
    NumTarget: "Sum",
    OpenAll: 1
  },
  {
    BetTypes: 6,              // 長牌
    NumTarget: "Long",
    OpenAll: 1
  },
  {
    BetTypes: 7,              // 短牌
    NumTarget: "Short",
    OpenAll: 1
  }
];
export default SettleNums;
