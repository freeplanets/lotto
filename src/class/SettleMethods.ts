export interface ISetl {
    BetTypes: number;
    NumTarget: string;
    SubName?: string;
    Position?: number[] | number;   // -1 表示對該項目所有號碼
    OpenAll: number;           // 須開出號數
    OpenLess?: number;          // 最少開出號數
    OneToGo?: boolean;
    TieNum?: number;             // 平手
    ExSP?: string;               // 中特
    OpenSP?: number;
    NumMove?: number;            // 號碼和結果差
    PType?: string;              // EACH 多項目對一個結果
    ExtBT?: number;              // 比對附加下注方式
}
export interface IGType {
    [key: number]: string;
}
const gtype: IGType = [];
gtype[1] = "MarkSix";
export const GType: IGType = gtype;

const SettleNums: ISetl[] = [
    {
        BetTypes: 1,              // 特碼A
        NumTarget: "SPNum",
        SubName: "Num",
        OpenAll: 1
    },
    {
        BetTypes: 28,              // 特碼B
        NumTarget: "SPNum",
        SubName: "Num",
        OpenAll: 1
    },
    {
        BetTypes: 2,              // 特碼單雙
        NumTarget: "SPNum",
        SubName: "OddEven",
        OpenAll: 1,
        TieNum: 49
    },
    {
        BetTypes: 3,              // 特碼大小
        NumTarget: "SPNum",
        SubName: "BigSmall",
        OpenAll: 1,
        TieNum: 49,
    },
    {
        BetTypes: 74,             // 特碼尾大小
        NumTarget: "SPNum",
        SubName: "TailBS",
        OpenAll: 1
    },
    {
        BetTypes: 4,              // 正碼
        NumTarget: "RegularNums",
        OpenAll: 1
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
        BetTypes: 7,                 // 三全中
        NumTarget: "RegularNums",
        Position: -1,
        OpenAll: 3
    },
    {
        BetTypes: 8,           // 三中二 I
        NumTarget: "RegularNums",
        Position: -1,
        OpenAll: 3,
        OpenLess: 2
    },
    {
        BetTypes: 72,           // 三中二 II
        NumTarget: "RegularNums",
        Position: -1,
        OpenAll: 3,
        OpenLess: 2
    },
    {
        BetTypes: 9,              // 二全中
        NumTarget: "RegularNums",
        Position: -1,
        OpenAll: 2,
    },
    {
        BetTypes: 10,          // 二中特 I
        NumTarget: "RegularNums",
        ExSP: "SPNo",
        Position: -1,
        OpenAll: 2,
        OpenSP: 1
    },
    {
        BetTypes: 73,          // 二中特 II
        NumTarget: "RegularNums",
        Position: -1,
        ExSP: "SPNo",
        OpenAll: 2,
        OpenSP: 1
    },
    {
        BetTypes: 11,         // 特串
        NumTarget: "RegularNums",
        Position: -1,
        ExSP: "SPNo",
        OpenAll: 1,
        OpenSP: 1,
    },
    {
        BetTypes: 12,             // 正碼1-6單雙
        NumTarget: "RGNums",
        SubName: "OddEven",
        Position: [0, 1, 2, 3, 4, 5],
        ExtBT: 15,
        OpenAll: 1
    },
    {
        BetTypes: 13,             // 正碼1-6大小
        NumTarget: "RGNums",
        SubName: "BigSmall",
        Position: [0, 1, 2, 3, 4, 5],
        ExtBT: 15,
        OpenAll: 1
    },
    {
        BetTypes: 14,             // 正碼1-6色波
        NumTarget: "RGNums",
        SubName: "ColorWave",
        Position: [0, 1, 2, 3, 4, 5],
        ExtBT: 15,
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
        BetTypes: 15,            // 正碼過關
        NumTarget: "PASS",
        OpenAll: 1
    },
    {
        BetTypes: 16,             // 特碼合數單雙
        NumTarget: "SPNum",
        SubName: "TotOE",
        OpenAll: 1
    },
    {
        BetTypes: 17,             // 特碼色波
        NumTarget: "SPNum",
        SubName: "ColorWave",
        OpenAll: 1
    },
    {
        BetTypes: 18,         // 特碼生肖
        NumTarget: "SPNum",
        SubName: "Zadic",
        OpenAll: 1
    },
    {
        BetTypes: 19,           // 生肖
        NumTarget: "Zadic",
        OpenAll: 1
    },
    {
        BetTypes: 20,         // 尾數
        NumTarget: "tailNums",
        OpenAll: 1
    },
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
        BetTypes: 29,         // 半波
        NumTarget: "SPNum",
        SubName: "HalfWave",
        TieNum: 49,
        OpenAll: 1
    },
    {
        BetTypes: 75,     // 二肖
        NumTarget: "SPNum",
        SubName: "Zadic",
        TieNum: 49,
        PType: "EACH",
        OpenAll: 1
    },
    {
        BetTypes: 76,     // 三肖
        NumTarget: "SPNum",
        SubName: "Zadic",
        TieNum: 49,
        PType: "EACH",
        OpenAll: 1
    },
    {
        BetTypes: 77,     // 四肖
        NumTarget: "SPNum",
        SubName: "Zadic",
        TieNum: 49,
        PType: "EACH",
        OpenAll: 1
    },
    {
        BetTypes: 78,     // 五肖
        NumTarget: "SPNum",
        SubName: "Zadic",
        TieNum: 49,
        PType: "EACH",
        OpenAll: 1
    },
    {
        BetTypes: 30,     // 六肖
        NumTarget: "SPNum",
        SubName: "Zadic",
        TieNum: 49,
        PType: "EACH",
        OpenAll: 1
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
        BetTypes: 53,    // 七碼
        NumTarget: "Seven",
        OpenAll: 1
    },
    {
        BetTypes: 54,     // 五行
        NumTarget: "SPNum",
        SubName: "FiveElements",
        OpenAll: 1
    },
    {
        BetTypes: 55,     // 一肖量
        NumTarget: "Zadic",
        SubName: "length",
        NumMove: -2,
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
        BetTypes: 69,     // 一肖不中
        NumTarget: "Zadic",
        OpenAll: 0
    },
    {
        BetTypes: 70,  // 尾數不中
        NumTarget: "tailNums",
        OpenAll: 0
    }
];
export default SettleNums;
