export interface IGameItem {
    id: string;
    name: string;
    GType: string;
}
export interface IBTItem {
    id: string;
    name: string;
    isParlay: number;
}

export interface IMsg {
    ErrNo: number;
    data?: object[]|object;
    debug?: string;
    ErrCon?: string;
    [key: string]: any;
}

/**
 *  member getOddsItems
 */
export interface IGameInfo {
    id: string;
    name: string;
    sNo: string;
    isEnd: string;
    endSec: number;
    endSecSN: number;
    isSettled: number;
    GType: string;
}
export interface ILastGame {
    sno: string;
    nn: string;          // 一般
    ns: string;          // 特碼
}
export interface IOdds {
    s: number;       // isStop
    o: number;       // Odds
    id: string;      // Odds id
}

export interface IBtOdds {
    [key: string]: IOdds;
}

export interface IGameOdds {
    [key: string]: IBtOdds;
}

export interface INumData {
    Num: number | string;
    OddsID: number;
    Odds?: string | number;
    Amt: number;
    BetType?: number;
    TNums?: number;
}
export interface IBetContent {
    BetType?: number;
    Content: INumData[];
    isPaylay?: boolean;
    Sets?: number;
}
export interface IBet {
    AnaNum(nums: string): any;
    Save?(data: string, f: () => void): void;
}

export interface IBetHeader {
    id: number;
    UserID: number;
    UpId: number;
    tid: number;
    GameID: number;
    BetContent: string;
    Fee?: number;
    Total: number;
    Payout?: number;
    WinLose?: number;
    ExRate?: number;
    CancelLimit?: number;
    CreateTime?: string;
    TermID?: string;
}
export interface IGameAccessParams {
    ac: string;
    userCode: string; // 用戶帳號 length max 64
    nickName?: string; // 用戶顯示名稱(可用 userCode 代替),utf-8
    money?: string; // ,不轉錢為0,單位:人民幣
    orderId?: string; // 不轉錢為空白 或 agentid+yyyyMMddHHmmssSSS+userCode
    ip: string; // 客戶端IP
    gameId?: string; // 游戲ID
    lang?: string; // default:zh-CN
    isLandscape?: string; // 闪屏界面及大厅界面是否横屏显示 1 为横屏，0 为竖屏，默认为 1
    isFullScreen?: string; // 是否全屏显示游戏界面 1 为全屏，0 为不全屏，默认是 0
    loadType?: string; // 游戏加载方式，分为预加载及后加载两种，
    // 预加载会先把资源下载完成后，才进 入游戏；后加载则边进游戏边加载资源。 1 为预加载，0 为后加载，默认是 1
    homeUrl?: string; // 主页地址，游戏大厅或游戏房间内点击返回按钮，支持返回代理商站点页面。
    // 具 体的 url 地址，如：http://www.xxx.com，
    // 如果 url 地址带有多个参数，把&符号用 #符号替换：http://www.xxx.com?type=1#user=test01#loginType=1
    isShowLobby?: string; // 是否需要大厅界面 1 为显示，0 为不显示，默认 1
    isShowFSGuide?: string; // 是否需要全屏引导。1 为显示，0 为不显示，默认 0
    parentCode?: string; // 乙方信用网平台用户的上级编号，用户在乙方平台跳转到甲方游戏平台时所携带的字段，
    // 信用网封盘时对该代理商下属于该 parentCode 的用户进行重置分数时使 用（注：信用网必须传此参数）
    popGameLst?: string; // 是否需要显示游戏列表弹窗，1 为显示，0 为不显示，默认显示；
    // isShowLobby 为 0 时，配置才生效；isShowLobby 为 1 时，不显示游戏列表弹窗。
    showTrialRoom?: string; // 是否显示试玩场，1 为显示，0 为不显示，默认显示
    startTime?: number;
    endTime?: number;
    getKey?: string;
  }

export interface IDbAns  {
    affectedRows: number;
    insertId: number;
    warningStatus: number;
    [key: string]: number;
}

export interface IBetTable {
    id: number;
    betid: number;
    UserID: number;
    Account: string;
    UpId: number;
    tid: number;
    GameID: number;
    BetType: number;
    tGroup?: number;
    Num: string;
    Odds: number;
    Odds1?: number;
    Odds2?: number;
    Odds3?: number;
    OpPASS?: number;
    Amt: number;
    validAmt: number;
    Payouts: number;
    Payouts1?: number;
    WinLose?: number;
    isCancled?: number;
    isSettled?: number;
}

export interface IOparamSub {
    TotalNums: number;
    UseAvg: number;
    SingleNum: number;
    UnionNum: number;
    MinHand: number;
    MaxHand: number;
    BetForChange: number;
    Steps: number;
}
export interface IOparamG {
    id: number;
    GameID: number;
    BetType: number;
    Subs: IOparamSub[];
}
export interface ICurOddsData {
    BetType: number;
    SubType: number;
    OID: number;
    NoOID?: boolean;
    Num: number;
    Odds: number;
    tolS: number;
}
/**
 *  obj['aaa']=123;
 */
export interface IStrKeyNumer {
    [key: string]: number;
}

export interface IComments {
    id: number;
    PageName: string;
    Comments: string;
}

export interface IBetItem {
    BetType: string;
    Num: string;
}

export interface IMOdds {
    Odds: number;
    MaxOdds: number;
    isStop: number;
    Steps: number;
}

export interface ICommonParams {
    id?: number;
    tid?: number;
    GameID?: number|string;
    GType?: string;
    BT?: number;
    Num?: number;
    Step?: number;
    UserID?: number;
    MaxOddsID?: number;
    BetTypes?: string;
    isStop?: number;
    PageName?: string;
    Comments?: string;
    BCName?: string;
    findString?: string;
    userType?: number;
    ModifyID?: number;
    data?: any;
    PayClassName?: string;
    NameOrNick?: string;
    SDate?: string;
    EDate?: string;
    UpId?: number;
    OnlyID?: boolean;
    [key: string]: number|string|boolean|IParamLog[]|undefined;
}

export interface IBasePayRateItm {
    id: number;
    GameID?: number;
    GType?: number;
    Title?: string;
    SubTitle?: string;
    BetType?: number;
    SubType?: number;
    NoAdjust?: number;
    Profit?: number;
    DfRate?: number;
    TopRate?: number;
    // Probability?: number;
    Steps?: number;
    TopPay?: number;
    OneHand?: number;
    TotalNums?: number;
    UseAvg?: number;
    SingleNum?: number;
    UnionNum?: number;
    MinHand?: number;
    MaxHand?: number;
    BetForChange?: number;
    ChangeStart?: number;
    PerStep?: number;
    StepsGroup?: string;
    ChaseNum?: number;
    ModifyID?: number;
}
export interface IStepG {
    Start: number;
    Step: number;
}
export interface INumAvg {
    BetType: number;
    Amount: number;
}
export interface IParamLog {
    id: number;
    tb: string;
    uid: number;
    mykey: string;
    ovalue: string;
    nvalue: string;
    adminid: number;
}
export interface IDayReport {
    SDate: string;
    UpId: number;
    UserID: number;
    GameID: number;
    BetType: number;
    Total: number;
    Winlose?: number;
}
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
    OpenSP?: number;             // 開出特碼
    NumMove?: number;            // 號碼和結果差
    PType?: string;              // EACH 多項目對一個結果
    // ExtBT?: number;              // 比對附加下注方式
    UseExTable?: boolean;        // 使用BetTableEx進行比對 最小/平均賠率
    ExChk?: string;              // 額外檢查欄位名稱,開出的碼是否為組3或是組6
    differentOdds?: boolean;      // 多重倍率(不變動)
    MultiPay?: boolean;             // 倍數派彩
}

export interface ISqlProc {
    pre: string[];
    common: string[];
    final: string;
}

export interface IGameResult {
    GameTime: string;
    NumberNormal: string;
    NumberSpecial: string;
    SerialNo: string;
    isCancel: string;
}

export interface IGameDataCaption {
    id: number;
    Game: string;
    BetType: string;
}
export interface IKeyVal {
    [key: string]: string|number;
}

export interface IChaseNum {
    id: number;
    UserID: number;
    UpId?: number;
    betid: number;
    BetType?: number;
    Num?: string;
    Terms?: number;
    TermsDone?: number;
    FinishWhenOpen?: number;
}

export interface IProbTable {
    id: number;
    GType: string;
    BetType: number;
    SubType: number;
    Probability: number;
    isParlay: number;
    ModifyID?: number;
 }

export interface IDfOddsItems {
    id?: number;
    GType: string;
    BetType: number;
    SubType: number;
    Num: string;
    ModifyID?: number;
}

export interface IHashAna {
    id?: number;
    Cond: string;
    AnaData: string;
}
