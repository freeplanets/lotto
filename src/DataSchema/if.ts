import * as ENUM from "./ENum";
export interface AnyObject {
    [key: string]: any;
}
export interface WsMsg extends AnyObject {
    Func?: ENUM.FuncKey;
    data?: any;
    Asks?: AskTable | AskTable[];
    Ask?: AskTable;
    Balance?: number;
    Message?: string;
    ChannelName?: string;
    LedgerTotal?: LedgerTotal[];
    SettleServiceID?: number;
    UserID?: number;
}
export interface IHasID {
    id: number;
    [key: string]: any;
}
export interface HasUID extends IHasID {
    UserID: number;
}
export interface HasUpID extends IHasID {
    UserID: number;
    UpId: number;
}
export interface IGameItem {
    id: string;
    name: string;
    GType: string;
}
export interface IBTItem {
    id: string;
    name: string;
    isParlay: number;
    MinHand: number;
}

export interface IMsg {
    ErrNo?: ENUM.ErrCode;
    data?: object[]|object;
    NewAsk?: object[]|object;   // 系統產生之新單 槓桿用
    Ask?: AskTable;
    Asks?: AskTable[];
    debug?: string;
    ErrCon?: string;
    Balance?: number;
    LedgerTotal?: any;
    UserID?: number;
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
    ext: string;         // 給 hash 號碼用
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
    BeginTrans(): Promise<void>;
    RollBack(): Promise<void>;
    Commit(): Promise<void>;
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
    gameType?: string; // cc: 數字貨幣, 其他： lottory
    id?: string;
    key?: string; // for admin url
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
    OpSP?: number;
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
    isStop?: number;
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
    UpId?: number|number[];
    OnlyID?: boolean;
    [key: string]: number|number[]|string|boolean|IParamLog[]|undefined;
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
    tid: number;
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
    AddPosNum?: number;            // HashSix 正碼1-6 生肖，二肖，三肖..... val * pos
    isNumber?: boolean;            // 同上  以數字的方式比對
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
    Key?: string;
    Val?: string | number;
    Cond?: string;
    Key2?: string;
    Val2?: string | number;
    CondOr?: string;
    [key: string]: any;
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

export interface IDfOddsItems extends IHasID {
    GType: string;
    BetType: number;
    SubType: number;
    Num: string;
    ModifyID?: number;
}

export interface IHashAna extends IHasID {
    Cond: string;
    AnaData: string;
}
// 下單資料
// 下單資料
export interface Order extends IHasID {
    ItemID: number;
    ItemType: number;
    Price: number;
    AskType: number; // 0 市價, 1 限價
    BuyType: number; // 0 買, 1 賣
    Qty: number;
    Amount: number;
    TermFee?: number;
    Lever?: number;
    CLevel: string;
    USetID?: number; // 平倉對象ID -> 會員下單
    GainPrice?: number;
    LosePrice?: number;
    ProcStatus?: number;
    isUserSettle?: number; // 會員平倉
}
export interface Lever extends IHasID {
    UpId: number;
    Multiples: number;
    LongT: number;
    ShortT: number;
    ModifyID: number;
}
export interface AskTable extends HasUID {
    UpId: number;
    CLevel: string;
    ItemID: number;
    ItemType: number;
    Code: string;
    AskType: number; // 0 市價, 1 限價
    BuyType: number; // 0 買, 1 賣
    Amount: number; // USDT金額
    Price: number;
    Qty: number;
    Fee?: number; // 手續費
    TFee?: number;  // 短線手續費
    AskFee: number; // 手續費率
    TermFee?: number; // 短線費率
    AskPrice: number; // 下單價格
    LeverCredit?: number; // 下單時暫扣的信用額度
    ExtCredit?: number; // 下單後變動的信用額度,只能增加
    Lever?: number;
    GainPrice?: number;
    LosePrice?: number;
    StopGain?: number;
    StopLose?: number;
    ProcStatus?: number;  // 0 等待處理 1 處理中 2 成交 3 取消
    CreateTime?: number; // 建單時間
    DealTime?: number; // 成交時間
    ModifyTime?: number; // 修改時間
    SetID?: number; // 平倉對象ID -> System下單
    USetID?: number; // 平倉對象ID -> 會員下單
    isUserSettle?: number; // 會員平倉
    ChoicePrice?: number; // 有利價
}
export interface LedgerLever extends HasUID {
    UpId: number;
    ItemID: number;
    ItemType: number;
    BuyID: number;  // 買進時 AskTable id
    SellID?: number;  // 賣出進時 AskTable id
    Qty: number;
    BuyPrice: number; // 建倉價格
    SellPrice?: number;
    BuyFee: number;
    SellFee?: number;
    GainLose?: number; // 輸贏
    TFee?: number; // 短線費
    Lever: number;  // 槓桿
    BuyTime: number; // 買進時間
    SellTime?: number; // 賣出時間
}

export interface WebParams {
    sid: string;
    UserID: number;
    Account?: string;
    UpId?: number;
    TableName?: string;
    TableData?: string;
    TableDatas?: IHasID | IHasID[];
    Filter?: IKeyVal | IKeyVal[];
    Fields?: string | string[];
    order?: Order;
    orderField?: string;
    Limit?: string;  // 顯示最新記錄筆數， 在order 之後加上 limit 0, n
    [key: string]: any;
}
export interface Items {
    id: number;
    Title?: string;
    Code: string;
    OpenFee: number;
    CloseFee: number;
    isLoan: number;
    StopGain: number;
    StopLose: number;
    Closed: number;
    EmergencyClosed?: number; // 0 開放, 1 關閉
    OneHand: number;
    Type: number;
    IMG?: string;
}
export interface NoDelete extends HasUID {
    ProcStatus: number;
}
export interface CryptoOrder {
    id: number;
    UserID: number;
    ItemID: number;
    Code: string;
    Type: number;
    BuyType: number;
    Amount?: number; // USDT金額
    OpenPrice?: number; // 建倉價格
    OpenFee?: number;
    ClosePrice?: number; // 平倉價格
    CloseFee?: number;
    OpenLimitPrice?: number; // 建倉限價價格
    CloseLimitPrice?: number; // 平倉限價價格
    CloseType?: number; // 平倉種類 0 市價, 1限價
    CloseWin?: number; // 停利價格
    CloseLose?: number; // 停損價格
    OpenCredit?: number; // 開倉信用額度
    CloseCredit?: number; // 平倉信用額度
    ProcessStatus?: number;  // 0 等待處理 1 處理中
    CreateTime?: number; // 建單時間
    OpenTime?: number; // 新倉時間
    CreateCloseTime?: number; // 平倉建單時間
    CloseTime?: number; // 平倉時間
}

export interface LedgerTotal extends HasUID {
    UpId: number;
    ItemID: number;
    Qty: number;
}
export interface Ledger extends LedgerTotal {
    AskID: number;
    CreateTime?: number;
    Amount: number;
    Fee: number;
}
export interface MemberGainLose extends IHasID {
    UserID: number;
    UpId: number;
    SDate: string;
    Total: number;
    LeverTotal: number;
    BuyFee: number;
    SellFee: number;
    TFee: number;   // TermFee 短線手續費
    GainLose: number;
}
/**
 * CreditMemo
 * database type varchar 256
 * save data after JSON.stringify
 */
export interface CreditMemo {
    Type: ENUM.CreditType;
    Message: object;
}
export interface MemoCryptoCur {
    Type: ENUM.MemoType;
    AskID?: number;
    ItemID: number;
    ItemType: number;
    Amount: number;
    Fee?: number;
    TFee?: number;
    Qty: number;
}
export interface ChatMsg {
    name: string; // for Chat Message 'name' 發話者名稱
    text: string[]; // 訊息 for Chat Message 'text'
    sent: boolean; // for Chat Message 'sent'
    stamp?: string; // 顯示訊息時間 例: '4 minutes ago' for Chat Message 'stemp'
    // bgColor?:string; // 訊息底色 for Chat Message 'bg-color'
    // txtColor?:string; // 訊息字顏色 for Chat Message 'text-color'
    avatar?: string; // 發話者圖片（或圖片網址）for Chat Message 'avatar'
    inMessage?: boolean; // 收訊方用，發話方是否正在輸入訊息 for Chat Message tag q-spinner-dots
    receiveTime: number|string;
    SenderID: number;
    UpID: number;
    ReceiverID?: number;
    MKey?: string;
}

export interface MsgKey extends IHasID {
    UserKey: string;
    MKey: string;
}
export interface MsgCont extends AnyObject {
    id: number;
    MKey: string;
    MsgCont: string;
}
export interface NameAndText {
    name: string;
    text: string[];
}
export interface CryptoOpRules {
    OneHand?: number;    // 單手上限
    Full?: number;   // 滿倉
}
export interface CryptoOpParams extends IHasID {
    ItemID: number; // 項目代號
    OpType: string; // 控盤類型 None, A, B, C, D
    isActive: number; // 是否啟用
    OneHand: number; // 單注上限
    FullStorage: number; // 滿倉
    LeverLimit: number; // 最大槓桿倍數
    ShortTerm1: number; // 短線1 不可平倉時間
    ShortTerm2: number; // 短線2 可平倉但加收手續費
    ShortTermFee: number; // 短線手續費則
    ChoicePrice: number; // 有利價
}
export interface UserInfo extends IHasID {
    UpId: number;
    CLevel: string;
}
export interface ItemTotal {
    id: number;
    Total?: number;
    InProc?: number;
}
export interface PriceTick {
    code: string;
    lastPrice: number;
    lastVol: number;
    ticktime: number;
}
export interface PriceTickID extends PriceTick {
    id: number;
}
export interface GameType extends AnyObject {
    GType: string;
    OpenNums: number;
    OpenSP: number;
    StartNum: number;
    EndNum: number;
    SameNum: number;
}
export interface KenoDataProcQue {
    id: number;
    procStatus: number;
}
