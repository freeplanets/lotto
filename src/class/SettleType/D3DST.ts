import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 一定位-個
    NumTarget: "RGNums",
    Position: 2,
    SubName: "Num",
    OpenAll: 1
  },
  {
    BetTypes: 2,              // 一定位-個單雙
    NumTarget: "PRGNums",
    Position: 2,
    SubName: "OddEven",
    OpenAll: 1,
  },
  {
    BetTypes: 3,              // 一定位-個大小
    NumTarget: "RGNums",
    Position: 2,
    SubName: "BigSmall",
    OpenAll: 1,
  },
  {
    BetTypes: 4,              // 一定位-拾
    NumTarget: "RGNums",
    Position: 1,
    SubName: "Num",
    OpenAll: 1
  },
  {
    BetTypes: 5,              // 一定位-拾單雙
    NumTarget: "RGNums",
    Position: 1,
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 6,              // 一定位-拾大小
    NumTarget: "RGNums",
    Position: 1,
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
    BetTypes: 7,              // 一定位-佰
    NumTarget: "RGNums",
    Position: 0,
    SubName: "Num",
    OpenAll: 1
  },
  {
    BetTypes: 8,              // 一定位-佰單雙
    NumTarget: "RGNums",
    Position: 0,
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 9,              // 一定位-佰大小
    NumTarget: "RGNums",
    Position: 0,
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
      BetTypes: 10,             // 一字組合 - 中獎號碼為 1，2，3。下注 1 或 2 或 3 均為得獎。(重碼只算一組)
      NumTarget: "RGNums",
      SubName: "Num",
      Position: [0, 1, 2],
      OpenAll: 1
  },
  {
    BetTypes: 11,             // 三字和數
    NumTarget: "Sum3",
    SubName: "SumPos",
    OpenAll: 1
  },
  {
    BetTypes: 12,              // 三字和數單雙
    NumTarget: "Sum3",
    SubName: "OddEven",
    OpenAll: 1
  },
  {
    BetTypes: 13,              // 三字和數大小
    NumTarget: "Sum3",
    SubName: "BigSmall",
    OpenAll: 1
  },
  {
    BetTypes: 14,                 // 二定位拾個
    NumTarget: "Pos12",
    SubName: "Num",
    OpenAll: 1
  },
  {
    BetTypes: 15,                 // 二定位佰個
    NumTarget: "Pos02",
    SubName: "Num",
    OpenAll: 1
  },
  {
    BetTypes: 16,                 // 二定位佰拾
    NumTarget: "Pos01",
    SubName: "Num",
    OpenAll: 1
  },
  {
    BetTypes: 17,           // 二字组合 -依照開獎結果，由小至大重新排列，依序排出“兩號為一組”之數字為得獎號碼。(重碼只算一組)。此範例得獎彩票為：12，13，23。
    NumTarget: "TwoNums",
    OpenAll: 1
  },
  {
    BetTypes: 18,           // 組 3全包 -- 顧名思義，不用購買號碼，只買一個結果。就是只要開獎結果中有且只有兩個號碼重覆，下注 組 3 全包 就視為中獎。例如 112，344，446，233 等等，都是中獎。
    NumTarget: "Set3All",
    OpenAll: 1
  },
  {
    BetTypes: 19,              // 組 3轉直-5
    NumTarget: "C36S",
    SubName: "isSet3",
    OpenAll: 2,
    UseExTable: true
  },
  {
    BetTypes: 20,              // 組 3轉直-6
    NumTarget: "C36S",
    SubName: "isSet3",
    OpenAll: 2,
    UseExTable: true
  },
  {
    BetTypes: 21,              // 組 3轉直-7
    NumTarget: "C36S",
    SubName: "isSet3",
    OpenAll: 2,
    UseExTable: true
  },
  {
    BetTypes: 22,              // 組 3轉直-8
    NumTarget: "C36S",
    SubName: "isSet3",
    OpenAll: 2,
    UseExTable: true
  },
  {
    BetTypes: 23,              // 組 6轉直-4
    NumTarget: "C36S",
    SubName: "isSet6",
    OpenAll: 3,
    UseExTable: true
  },
  {
    BetTypes: 24,              // 組 6轉直-5
    NumTarget: "C36S",
    SubName: "isSet6",
    OpenAll: 3,
    UseExTable: true
  },
  {
    BetTypes: 25,              // 組 6轉直-6
    NumTarget: "C36S",
    SubName: "isSet6",
    OpenAll: 3,
    UseExTable: true
  },
  {
    BetTypes: 26,              // 組 6轉直-7
    NumTarget: "C36S",
    SubName: "isSet6",
    OpenAll: 3,
    UseExTable: true
  },
  {
    BetTypes: 27,              // 組 6轉直-8
    NumTarget: "C36S",
    SubName: "isSet6",
    OpenAll: 3,
    UseExTable: true
  },
  {
    BetTypes: 28,          // 3x3x3
    NumTarget: "Nums",
    Position: [0, 1, 2],
    OpenAll: 3,
    PType: "EACH"
  },
  {
    BetTypes: 29,          // 4x4x4
    NumTarget: "Nums",
    Position: [0, 1, 2],
    OpenAll: 3,
    PType: "EACH"
  },
  {
    BetTypes: 30,          // 5x5x5
    NumTarget: "Nums",
    Position: [0, 1, 2],
    OpenAll: 3,
    PType: "EACH"
  },
  {
    BetTypes: 31,          // 6x6x6
    NumTarget: "Nums",
    Position: [0, 1, 2],
    OpenAll: 3,
    PType: "EACH"
  },
  {
    BetTypes: 32,          // 7x7x7
    NumTarget: "Nums",
    Position: [0, 1, 2],
    OpenAll: 3,
    PType: "EACH"
  },
  {
    BetTypes: 34,          // 一定位-個質合 質數 1,2,3,4,7 ,合數 其他
    NumTarget: "RGNums",
    SubName: "Prime",
    Position: 2,
    OpenAll: 1,
  },
  {
    BetTypes: 35,          // 一定位-拾質合 質數 1,2,3,4,7 ,合數 其他
    NumTarget: "RGNums",
    SubName: "Prime",
    Position: 1,
    OpenAll: 1,
  },
  {
    BetTypes: 36,          // 一定位-佰質合 質數 1,2,3,4,7 ,合數 其他
    NumTarget: "RGNums",
    SubName: "Prime",
    Position: 0,
    OpenAll: 1,
  },
  {
    BetTypes: 37,         // 定位單雙過關
    NumTarget: "OddEvenPass",
    OpenAll: 1,
  },
  {
    BetTypes: 38,             // 定位大小過關
    NumTarget: "BigSmallPass",
    OpenAll: 1
  },
  {
    BetTypes: 39,         // 定位質合過關
    NumTarget: "PrimePass",
    OpenAll: 1,
  },
  {
    BetTypes: 40,             // 跨度 大小差
    NumTarget: "CrossN",
    OpenAll: 1
  },
  {
    BetTypes: 41,             // 合值 - 以開獎三個號碼的總和的尾數，作為中獎的依據。會員可以選擇 0 ~ 9 的任一號碼。
    NumTarget: "Sum3",
    SubName: "Tail",
    OpenAll: 1
  },
  {
    BetTypes: 42,             // 三定位
    NumTarget: "D3Pos",
    OpenAll: 1
  },
  {
    BetTypes: 43,             // 三字组合
    NumTarget: "D3NotPos",
    OpenAll: 1
  },
  {
    BetTypes: 44,             // 拾個和數
    NumTarget: "Pos12",
    SubName: "SumPos",
    OpenAll: 1
  },
  {
    BetTypes: 45,         // 佰個和數
    NumTarget: "Pos02",
    SubName: "SumPos",
    OpenAll: 1
  },
  {
    BetTypes: 46,           // 佰拾和數
    NumTarget: "Pos01",
    SubName: "SumPos",
    OpenAll: 1
  },
  {
    BetTypes: 47,         // 拾個和數單雙
    NumTarget: "Pos12",
    SubName: "SumOE",
    OpenAll: 1
  },
  {
    BetTypes: 48,         // 佰個和數單雙
    NumTarget: "Pos02",
    SubName: "SumOE",
    OpenAll: 1
  },
  {
    BetTypes: 49,         // 佰拾和數單雙
    NumTarget: "Pos01",
    SubName: "SumOE",
    OpenAll: 1
  },
  {
    BetTypes: 50,         // 拾個和數尾數
    NumTarget: "Pos12",
    SubName: "SumTail",
    OpenAll: 1
  },
  {
    BetTypes: 51,         // 佰個和數尾數
    NumTarget: "Pos02",
    SubName: "SumTail",
    OpenAll: 1
  },
  {
    BetTypes: 52,         // 佰拾和數尾數
    NumTarget: "Pos01",
    SubName: "SumTail",
    OpenAll: 1
  },
  {
    BetTypes: 53,         // 拾個和數尾數大小
    NumTarget: "Pos12",
    SubName: "SumTailBS",
    OpenAll: 1
  },
  {
    BetTypes: 54,         // 佰個和數尾數大小
    NumTarget: "Pos02",
    SubName: "SumTailBS",
    OpenAll: 1
  },
  {
    BetTypes: 55,         // 佰拾和數尾數大小
    NumTarget: "Pos01",
    SubName: "SumTailBS",
    OpenAll: 1
  },
  {
    BetTypes: 56,         // 拾個和數尾數質合
    NumTarget: "Pos12",
    SubName: "SumTailPrime",
    OpenAll: 1
  },
  {
    BetTypes: 56,         // 佰個和數尾數質合
    NumTarget: "Pos02",
    SubName: "SumTailPrime",
    OpenAll: 1
  },
  {
    BetTypes: 58,         // 佰拾和數尾數質合
    NumTarget: "Pos01",
    SubName: "SumTailPrime",
    OpenAll: 1
  },
  {
    BetTypes: 59,         // 雜六 - 不包含豹子、順子、對子、半順的所有中獎號碼。例如：024、406即為中獎。
    NumTarget: "Not6",
    OpenAll: 1
  },
  {
    BetTypes: 60,         // 順子 -數位連號，不分順序(包含數位9.0.1)。例如：012、019，即為中獎。
    NumTarget: "Straight",
    Position: 3,
    OpenAll: 1
  },
  {
    BetTypes: 61,         // 豹子 -數位都相同。例如：111、222，即為中獎。
    NumTarget: "Same3",
    OpenAll: 1
  },
  {
    BetTypes: 62,         // 不出 - 0~9投注一個號碼，如果開獎號碼不包含該號碼，則視為中獎。例如：開獎結果為012，不出3、4、5、6、7、8、9即為中獎。
    NumTarget: "Nums",
    Position: [0, 1, 2],
    OpenAll: 0
  },
  {
    BetTypes: 63,         // 對子 - 任意2位數相同，另一位數不同(不含豹子)。例如：211、727，即為中獎。
    NumTarget: "Pairs",
    OpenAll: 1
  },
  {
    BetTypes: 64,     // 准對 - 0~9投注一個號碼，該號碼於本次開獎為對子即為中獎(不包含豹子)。例如：開獎結果為211，准對1即為中獎。
    NumTarget: "PairsNum",
    OpenAll: 1
  },
  {
    BetTypes: 65,     // 半順 - 數位皆不同，且任意2位數為連號(不含對子、順子與數字9,0,1)。例如：023、401，即為中獎。
    NumTarget: "StraightPart",
    OpenAll: 1
  },
  {
    BetTypes: 66,     // 殺號
    NumTarget: "KillNum",
    PType: "Multi",   // 多重結果
    OpenAll: 1
  }
];
export default SettleNums;
