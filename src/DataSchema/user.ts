export interface IUser {
    TableName: "User";
    id: number;
    Account: string;
    Password: string;
    Nickname: string;
    Types: number;
    Levels: number;
    DfKey: string;
    UpId: number;
    PayClassID: number;
    Balance?: number;
    CreateTime: string;
    ModifyTime: string;
    CDate?: Date;
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

export interface IBasePayRate {
    GameID: number;
    BetType: number;
    Title: string;
    SubTitle: string;
    SubType: number;
    Profit: number;
    DfRate: number;
    TopRate: number;
    Probability: number;
    Steps: number;
    ModifyID: number;
}

export interface IBasePayRateItm {
    Title: string;
    SubTitle?: string;
    BetType?: string;
    SubType?: number;
    Profit?: number;
    DfRate?: number;
    TopRate?: number;
    Probability?: number;
    Steps?: number;
    TopPay?: number;
    OneHand?: number;
    PlusRate?: number;
}
export interface IPayRateItm {
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
    id?: number;
    GameID: number;
    TermID: string;
    TCenterID?: string;
    PDate: string;
    PTime: string;
    StopTime: string;
    StopTimeS: string;
    Result?: string;
    SpNo?: string;
    ModifyID: number;
}

export interface IGame {
    id: number;
    name: string;
    StopBeforeEnd: string;
    BothSideAdjust: boolean;
    AutoOpen: boolean;
    PDiffTwoSide: number;
    PDiffColorWave: number;
    DelAfterBet: number;
    DelBeforeEnd: number;
    LowestBet: number;
    TopPay: number;
    GType: string;
}
