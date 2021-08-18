export interface CryptoOp {
    ItemID: number;
    LeverLimit: number;
    ShortTerm1: number;
    ShortTerm2: number;
    ShortFee: number;
}
export interface IUser {
    TableName?: "User";
    id: number;
    CLevel: string;
    Account: string;
    Password?: string;
    Nickname: string;
    Types: number;
    Levels: number;
    DfKey: string;
    UpId: number;
    PayClassID: number;
    PayClass?: string;
    Balance?: number;
    forcePWChange?: number;
    isTwoPassAsked?: number;
    isChkGA?: number;
    GACode?: string;
    Programs?: string;
    CreateTime: string;
    ModifyTime: string;
    CDate?: Date;
    Params?: CryptoOp[];
}
export interface IUserPartial {
    id: number;
    forcePWChange?: number;
    isTwoPassAsked?: number;
    GAAppName?: string;
    GACode?: string;
    isChkGA?: number;
    Programs?: string;
}
export interface IPayRate {
    id: number;
    BetType: number;
    PreNum: string;     // 例  三中二 另有三中三的賠率 的前置號碼
    Profit: number;     // 利潤
    DfRate: number;     // 預設賠率
    DfRateDiff: number; // 預設利差
    TopRate: number;    // 賠率上限
    TopDiff: number;    // 最高差額
    BetChangeAmt: number; // 押碼金額
    BetChangeRate: number; // 押碼間隔
    LowestBet: number; // 最小下注
    TopPay: number; // 最高派彩
    SingleBet: number; // 公司單注
    ChangeID: number;   // 修改人員
    ChangeTime: Date;   // 修改時間
}

export interface IPayRateItm {
    id: number;
    BetType: string;
    SubType: number;
    Rate: number;
    [key: string]: string | number;
}

export interface IPayClassParam {
    GameID: number;
    PayClassID: number;
    RateType: number;
    RateDiff?: string;
    RateCond?: number;
    ModifyID: number;
}

export interface IDBAns {
    affectedRows: number;
    insertId: number;
    warningStatus: number;
}

export interface ITerms {
    id: number;
    GameID: number;
    TermID: string;
    TCenterID?: string;
    PDate: string;
    PTime: string;
    StopTime: string;
    StopTimeS: string;
    Result?: string;
    SpNo?: string;
    isSettled?: number;
    isCanceled?: number;
    lrid?: number;
    ModifyID: number;
}

export interface IGame {
    id: number;
    name: string;
    OfficeSite: string;
    StopBeforeEnd: number;
    BothSideAdjust: boolean;
    AutoOpen: boolean;
    PDiffTwoSide: number;
    PDiffColorWave: number;
    DelAfterBet: number;
    DelBeforeEnd: number;
    // LowestBet: number;
    // TopPay: number;
    UseAvgOdds: number;
    GType: string;
    hasSPNO: number;
    OpenNums: number;
}

export interface IBroadCasts {
    id: number;
    GameID: number;
    lrid: number;
    memo: string;
}
