import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 個位-單雙
    NumTarget: "RGNums",
    Position: 4,
    SubName: "OddEven",
    OpenAll: 1,
  },
  {
    BetTypes: 2,              // 十位-單雙
    NumTarget: "RGNums",
    Position: 3,
    SubName: "OddEven",
    OpenAll: 1,
  },
  {
    BetTypes: 3,              // 百位-單雙
    NumTarget: "RGNums",
    Position: 2,
    SubName: "OddEven",
    OpenAll: 1,
  },
  {
    BetTypes: 4,              // 千位-單雙
    NumTarget: "RGNums",
    Position: 1,
    SubName: "OddEven",
    OpenAll: 1,
  },
  {
    BetTypes: 5,              // 萬位-單雙
    NumTarget: "RGNums",
    Position: 0,
    SubName: "OddEven",
    OpenAll: 1,
  },
  {
    BetTypes: 6,              // 個位-大小
    NumTarget: "RGNums",
    Position: 4,
    SubName: "BigSmall",
    OpenAll: 1,
  },
  {
    BetTypes: 7,              // 十位-大小
    NumTarget: "RGNums",
    Position: 3,
    SubName: "BigSmall",
    OpenAll: 1,
  },
  {
    BetTypes: 8,              // 百位-大小
    NumTarget: "RGNums",
    Position: 2,
    SubName: "BigSmall",
    OpenAll: 1,
  },
  {
    BetTypes: 9,              // 千位-大小
    NumTarget: "RGNums",
    Position: 1,
    SubName: "BigSmall",
    OpenAll: 1,
  },
  {
    BetTypes: 10,              // 萬位-大小
    NumTarget: "RGNums",
    Position: 0,
    SubName: "BigSmall",
    OpenAll: 1,
  },
  {
    BetTypes: 11,              // 個位-質合
    NumTarget: "RGNums",
    Position: 4,
    SubName: "Prime",
    OpenAll: 1,
  },
  {
    BetTypes: 12,              // 十位-質合
    NumTarget: "RGNums",
    Position: 3,
    SubName: "Prime",
    OpenAll: 1,
  },
  {
    BetTypes: 13,              // 百位-質合
    NumTarget: "RGNums",
    Position: 2,
    SubName: "Prime",
    OpenAll: 1,
  },
  {
    BetTypes: 14,              // 千位-質合
    NumTarget: "RGNums",
    Position: 1,
    SubName: "Prime",
    OpenAll: 1,
  },
  {
    BetTypes: 15,              // 萬位-質合
    NumTarget: "RGNums",
    Position: 0,
    SubName: "Prime",
    OpenAll: 1,
  },
  {
    BetTypes: 16,             // 總和單雙
    NumTarget: "Sum",
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 17,             // 總和大小
    NumTarget: "Sum",
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
    BetTypes: 18,             // 前3和單雙
    NumTarget: "SumT3",
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 19,             // 前3和大小
    NumTarget: "SumT3",
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
    BetTypes: 20,             // 中3和單雙
    NumTarget: "SumM3",
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 21,             // 中3和大小
    NumTarget: "SumM3",
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
    BetTypes: 22,             // 後3和單雙
    NumTarget: "SumL3",
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 23,             // 後3和大小
    NumTarget: "SumL3",
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
    BetTypes: 24,              // 一定位-個
    NumTarget: "RGNums",
    Position: 4,
    SubName: "Num",
    OpenAll: 1,
  },
  {
    BetTypes: 25,              // 一定位-十
    NumTarget: "RGNums",
    Position: 3,
    SubName: "Num",
    OpenAll: 1,
  },
  {
    BetTypes: 26,              // 一定位-百
    NumTarget: "RGNums",
    Position: 2,
    SubName: "Num",
    OpenAll: 1,
  },
  {
    BetTypes: 27,              // 一定位-千
    NumTarget: "RGNums",
    Position: 1,
    SubName: "Num",
    OpenAll: 1,
  },
  {
    BetTypes: 28,              // 一定位-萬
    NumTarget: "RGNums",
    Position: 0,
    SubName: "Num",
    OpenAll: 1,
  },
  {
    BetTypes: 29,              // 一字現
    NumTarget: "Nums",
    Position: [0, 1, 2, 3, 4],
    OpenAll: 1,
  },
  {
    BetTypes: 30,              // 一字現-前3
    NumTarget: "Nums",
    Position: [0, 1, 2],
    OpenAll: 1,
  },
  {
    BetTypes: 31,              // 一字現-中3
    NumTarget: "Nums",
    Position: [1, 2, 3],
    OpenAll: 1,
  },
  {
    BetTypes: 32,              // 一字現-後3
    NumTarget: "Nums",
    Position: [2, 3, 4],
    OpenAll: 1,
  },
  {
    BetTypes: 33,              // 二字現
    NumTarget: "TwoNums",
    OpenAll: 1,
  },
  {
    BetTypes: 34,              // 二字現-前3
    NumTarget: "TwoNumsT3",
    OpenAll: 1,
  },
  {
    BetTypes: 35,              // 二字現-中3
    NumTarget: "TwoNumsM3",
    OpenAll: 1,
  },
  {
    BetTypes: 36,              // 二字現-後3
    NumTarget: "TwoNumsL3",
    OpenAll: 1,
  },
  {
    BetTypes: 37,              // 三字現
    NumTarget: "D3NotPos",
    OpenAll: 1,
  },
  {
    BetTypes: 38,              // 三字現-前3
    NumTarget: "D3NotPosT3",
    OpenAll: 1,
  },
  {
    BetTypes: 39,              // 三字現-中3
    NumTarget: "D3NotPosM3",
    OpenAll: 1,
  },
  {
    BetTypes: 40,              // 三字現-後3
    NumTarget: "D3NotPosL3",
    OpenAll: 1,
  },
  {
    BetTypes: 41,              // 四字現
    NumTarget: "D4NotPos",
    OpenAll: 1
  },
  {
    BetTypes: 42,              // 五字現
    NumTarget: "D5NotPos",
    OpenAll: 1
  },
  {
    BetTypes: 43,              // 雜項-前3
    NumTarget: "MixedT3",      // ['豹子','順子','對子','半順','雜六'],
    OpenAll: 1
  },
  {
    BetTypes: 44,              // 雜項-中3
    NumTarget: "MixedM3",      // ['豹子','順子','對子','半順','雜六'],
    OpenAll: 1
  },
  {
    BetTypes: 45,              // 雜項-後3
    NumTarget: "MixedL3",      // ['豹子','順子','對子','半順','雜六'],
    OpenAll: 1
  },
  {
    BetTypes: 46,              // 炸金花
    NumTarget: "GoldenFlower",      // ['五同號','四條','葫蘆','順子','三條','兩對','一對','雜牌']
    OpenAll: 1
  },
  {
    BetTypes: 47,            // 兩面過關
    NumTarget: "PASS",
    PType: "EACH",
    OpenAll: 1
  }
];
export default SettleNums;
