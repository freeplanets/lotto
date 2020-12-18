import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
    {
      BetTypes: 21,         // 正1特
      NumTarget: "RGNums",
      SubName: "Num",
      Position: 0,
      OpenAll: 1
  },
  {
      BetTypes: 22,         // 正2特
      NumTarget: "RGNums",
      SubName: "Num",
      Position: 1,
      OpenAll: 1
  },
  {
      BetTypes: 23,         // 正3特
      NumTarget: "RGNums",
      SubName: "Num",
      Position: 2,
      OpenAll: 1
  },
  {
      BetTypes: 24,         // 正4特
      NumTarget: "RGNums",
      SubName: "Num",
      Position: 3,
      OpenAll: 1
  },
  {
      BetTypes: 25,         // 正5特
      NumTarget: "RGNums",
      SubName: "Num",
      Position: 4,
      OpenAll: 1
  },
  {
      BetTypes: 26,         // 正6特
      NumTarget: "RGNums",
      SubName: "Num",
      Position: 5,
      OpenAll: 1
  },
  {
      BetTypes: 4,              // 正碼
      NumTarget: "RegularNums",
      OpenAll: 1
  },
  {
      BetTypes: 9,              // 二全中
      NumTarget: "RegularNums",
      Position: -1,
      OpenAll: 2,
  },
  {
      BetTypes: 7,                 // 三全中
      NumTarget: "RegularNums",
      Position: -1,
      OpenAll: 3
  },
  {
      BetTypes: 8,           // KENO3
      NumTarget: "RegularNums",
      Position: -1,
      OpenAll: 3,
      OpenLess: 2,
      differentOdds: true
  },
  {
      BetTypes: 79,           // KENO4
      NumTarget: "RegularNums",
      Position: -1,
      OpenAll: 4,
      OpenLess: 2,
      differentOdds: true
  },
  {
      BetTypes: 80,           // KENO5
      NumTarget: "RegularNums",
      Position: -1,
      OpenAll: 5,
      OpenLess: 2,
      differentOdds: true
  },
  {
      BetTypes: 81,           // KENO6
      NumTarget: "RegularNums",
      Position: -1,
      OpenAll: 6,
      OpenLess: 3,
      differentOdds: true
  },
  {
      BetTypes: 5,              // 總和單雙
      NumTarget: "SumOE",
      OpenAll: 1
  },
  {
      BetTypes: 6,              // 總和大小
      NumTarget: "SumBS",
      OpenAll: 1
  },
  {
      BetTypes: 12,             // 正碼1-6單雙
      NumTarget: "OddEvenP",
      // NumTarget: "RGNums",
      // SubName: "OddEven",
      // Position: [0, 1, 2, 3, 4, 5],
      // ExtBT: 15,
      OpenAll: 1
  },
  {
      BetTypes: 13,             // 正碼1-6大小
      NumTarget: "BigSmallP",
      // NumTarget: "RGNums",
      // SubName: "BigSmall",
      // Position: [0, 1, 2, 3, 4, 5],
      // ExtBT: 15,
      OpenAll: 1
  },
  {
      BetTypes: 27,             // 正1-6合數單雙
      NumTarget: "RGNums",
      SubName: "TotOE",
      Position: [0, 1, 2, 3, 4, 5],
      OpenAll: 1
  },
  {
      BetTypes: 20,         // 尾數
      NumTarget: "tailNums",
      OpenAll: 1
  },
  {
        BetTypes: 38,    // 二尾連-中
        NumTarget: "tailNums",
        OpenAll: 2,
        Position: -1
    },
    {
        BetTypes: 39,    // 三尾連-中
        NumTarget: "tailNums",
        OpenAll: 3,
        Position: -1
    },
    {
        BetTypes: 40,    // 四尾連-中
        NumTarget: "tailNums",
        OpenAll: 4,
        Position: -1
    },
    {
        BetTypes: 46,    // 五尾連-中
        NumTarget: "tailNums",
        OpenAll: 5,
        Position: -1
    },
    {
        BetTypes: 41,    // 二尾連-不中
        NumTarget: "tailNums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 42,    // 三尾連-不中
        NumTarget: "tailNums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 43,    // 四尾連-不中
        NumTarget: "tailNums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 47,    // 五尾連-不中
        NumTarget: "tailNums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 70,  // 尾數不中
        NumTarget: "tailNums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 31,    // 五不中
        NumTarget: "Nums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 48,    // 六不中
        NumTarget: "Nums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 49,    // 七不中
        NumTarget: "Nums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 50,    // 八不中
        NumTarget: "Nums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 51,    // 九不中
        NumTarget: "Nums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 52,    // 十不中
        NumTarget: "Nums",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 71,           // 四中一
        NumTarget: "Nums",
        OpenAll: 1,
        Position: -1
    },
    {
        BetTypes: 57,           // 五中一
        NumTarget: "Nums",
        OpenAll: 1,
        Position: -1
    },
    {
        BetTypes: 58,     // 六中一
        NumTarget: "Nums",
        OpenAll: 1,
        Position: -1
    },
    {
        BetTypes: 59,     // 七中一
        NumTarget: "Nums",
        OpenAll: 1,
        Position: -1
    },
    {
        BetTypes: 60,     // 八中一
        NumTarget: "Nums",
        OpenAll: 1,
        Position: -1
    },
    {
        BetTypes: 61,     // 九中一
        NumTarget: "Nums",
        OpenAll: 1,
        Position: -1
    },
    {
        BetTypes: 62,     // 十中一
        NumTarget: "Nums",
        OpenAll: 1,
        Position: -1
    },
    {
        BetTypes: 63,     // 一粒任
        NumTarget: "Nums",
        OpenAll: 1,
        OneToGo: true,
        Position: -1
    },
    {
        BetTypes: 64,     // 二粒任
        NumTarget: "Nums",
        OpenAll: 2,
        OneToGo: true,
        Position: -1
    },
    {
        BetTypes: 65,     // 三粒任
        NumTarget: "Nums",
        OpenAll: 3,
        OneToGo: true,
        Position: -1
    },
    {
        BetTypes: 66,     // 四粒任
        NumTarget: "Nums",
        OpenAll: 4,
        OneToGo: true,
        Position: -1
    },
    {
        BetTypes: 67,     // 五粒任
        NumTarget: "Nums",
        OpenAll: 5,
        OneToGo: true,
        Position: -1
    },
    {
        BetTypes: 68,     // 龍虎
        NumTarget: "DragonTiger",
        OpenAll: 1
    },
    {
        BetTypes: 53,    // 六碼
        NumTarget: "Seven",
        OpenAll: 1
    },
    {
        BetTypes: 56,     // 尾數量
        NumTarget: "tailNums",
        SubName: "length",
        NumMove: -2,
        OpenAll: 1
    },
    {
        BetTypes: 14,             // 正碼1-6色波
        NumTarget: "ColorWaveP",
        // NumTarget: "RGNums",
        // SubName: "ColorWave",
        // Position: [0, 1, 2, 3, 4, 5],
        // ExtBT: 15,
        OpenAll: 1
    },
    {
        BetTypes: 15,            // 正碼過關
        NumTarget: "PASS",
        OpenAll: 1
    },
    {
        BetTypes: 82,         // 正碼1-6半波 //NumTarget: "RGNums",//SubName: "HalfWave",//Position: [0, 1, 2, 3, 4, 5],
        NumTarget: "HalfWaveP",
        OpenAll: 1
    },
    {
        BetTypes: 19,           // 生肖
        NumTarget: "Zadic",
        OpenAll: 1
    },
    {
        BetTypes: 83,         // 正碼1-6生肖
        NumTarget: "RGNums",
        SubName: "Zadic",
        Position: 0,
        OpenAll: 1
    },
    {
        BetTypes: 84,         // 正碼1-6二肖
        NumTarget: "RGNums",
        SubName: "Zadic",
        Position: 1,
        OpenAll: 1
    },
    {
        BetTypes: 85,         // 正碼1-6三肖
        NumTarget: "RGNums",
        SubName: "Zadic",
        Position: 2,
        OpenAll: 1
    },
    {
        BetTypes: 86,         // 正碼1-6四肖
        NumTarget: "RGNums",
        SubName: "Zadic",
        Position: 3,
        OpenAll: 1
    },
    {
        BetTypes: 87,         // 正碼1-6五肖
        NumTarget: "RGNums",
        SubName: "Zadic",
        Position: 4,
        OpenAll: 1
    },
    {
        BetTypes: 88,         // 正碼1-6六肖
        NumTarget: "RGNums",
        SubName: "Zadic",
        Position: 5,
        OpenAll: 1
    },
    {
        BetTypes: 32,    // 二肖連-中
        NumTarget: "Zadic",
        OpenAll: 2,
        Position: -1
    },
    {
        BetTypes: 33,    // 三肖連-中
        NumTarget: "Zadic",
        OpenAll: 3,
        Position: -1
    },
    {
        BetTypes: 34,    // 四肖連-中
        NumTarget: "Zadic",
        OpenAll: 4,
        Position: -1
    },
    {
        BetTypes: 44,    // 五肖連-中
        NumTarget: "Zadic",
        OpenAll: 5,
        Position: -1
    },
    {
        BetTypes: 35,    // 二肖連-不中
        NumTarget: "Zadic",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 36,    // 三肖連-不中
        NumTarget: "Zadic",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 37,    // 四肖連-不中
        NumTarget: "Zadic",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 45,    // 五肖連-不中
        NumTarget: "Zadic",
        OpenAll: 0,
        Position: -1
    },
    {
        BetTypes: 69,     // 一肖不中
        NumTarget: "Zadic",
        OpenAll: 0
    },
    {
        BetTypes: 55,     // 一肖量
        NumTarget: "Zadic",
        SubName: "length",
        NumMove: -2,
        OpenAll: 1
    },
    {
        BetTypes: 89,     // 五行
        NumTarget: "RGNums",
        Position: [0, 1, 2, 3, 4, 5],
        SubName: "FiveElements",
        OpenAll: 1
    }

];

export default SettleNums;
