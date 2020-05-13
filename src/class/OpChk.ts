import mariadb from "mariadb";
import {IBetTable, ICurOddsData, INumData, IStrKeyNumer,IBasePayRateItm,INumAvg} from "../DataSchema/if";
import JTable, {IHasID} from "./JTable";
interface ICurOddsT {
    id: 0;
    tid: number;
    GameID: number;
    BetType: number;
    UpId?: number;
    Num: number;
    tolW: number;
    tolS: number;
    tolP: number;
}
/*
interface IMCurOddsT extends ICurOddsT{
    UpId:number;
}
*/
interface INumAvgle {
    id: 0;
    tid: number;
    GameID: number;
    BetType: number;
    Amount: number;
}
interface IUnionTotal {
    id: 0;
    tid: number;
    GameID: number;
    BetType: number;
    UpId: number;
    Num: string;
    Amount: number;
}
export const enum ErrCode {
    PASS = 0,
    LESS_MIN_HAND = 1,
    OVER_MAX_HAND = 2,
    OVER_SINGLE_NUM = 3,
    OVER_UNION_NUM = 4,
    NUM_STOPED = 5,
}
export class OpChk {
    private iniop: IBasePayRateItm = {
        id: 0
    };
    private op: IBasePayRateItm = Object.assign({}, this.iniop);
    private CurOT: ICurOddsT[] = [];
    private MCurOT: ICurOddsT[] = [];
    private AvgT: INumAvgle[] = [];
    private UnT: IUnionTotal[] = [];
    constructor(private ops: IBasePayRateItm[], private isParlay: boolean,private NumAvg?:INumAvg[] ) {}
    public ChkData(dt: INumData , Odds: ICurOddsData) {
        let BT: number = 0;
        let chkAmt = 0;
        chkAmt = dt.Amt;
        if (dt.BetType) {
            BT = dt.BetType;
        }
        if (this.op.BetType !== BT) {
            const f = this.ops.find((itm) => itm.BetType === BT);
            if (f) {
                this.op = Object.assign({}, f);
            } else {
                this.op = Object.assign({}, this.iniop);
            }
        }
        let chk: number;
        chk = this.lessMinHand(chkAmt);
        if (chk !== ErrCode.PASS) { return chk; }
        chk = this.overMaxHand(chkAmt);
        if (chk !== ErrCode.PASS) { return chk; }
        chk = this.overSingleNum(chkAmt, Odds.tolS);
        if (chk !== ErrCode.PASS) { return chk; }
        chk = this.doBetForChange(chkAmt);        
        return chk;
    }
    /**
     * 更新統計資料表
     * CurOddsInfo
     * MCurOddsInfo
     * NumAvgle
     * @param data
     */
    public async updateTotals(data: IBetTable[], conn: mariadb.PoolConnection): Promise<boolean> {
        this.CurOT = [];
        this.MCurOT = [];
        this.AvgT = [];
        this.UnT = [];
        data.map((itm) => {
            this.addCurOddT(itm);
            this.calAvg(itm);
            this.calUnionNumTotal(itm);
        });
        let ans;
        if (this.CurOT.length > 0) {
            ans = await this.saveTotal<ICurOddsT>("CurOddsInfo", this.CurOT, conn);
            if (!ans) { return false; }
        }
        if (this.MCurOT.length > 0) {
            ans = await this.saveTotal<ICurOddsT>("MCurOddsInfo", this.MCurOT, conn);
            if (!ans) {
                return false;
            }
        }
        if (this.AvgT.length > 0) {
            ans = await this.saveTotal<INumAvgle>("NumAvgle", this.AvgT, conn);
            if (!ans) {
                return false;
            }
        }
        if (this.UnT.length > 0) {
            ans = await this.saveTotal<IUnionTotal>("UnionNums", this.UnT, conn);
            if (!ans) {
                return false;
            }
        }
        return true;
    }
    public overUnionNum(itms: IBetTable[], UnionTotals: IStrKeyNumer): number {
        if (this.op.UnionNum) {
            const UnionNum:number = this.op.UnionNum;
            itms.map((itm) => {
                if (itm.Amt + UnionTotals[itm.Num] > UnionNum) {
                    return ErrCode.OVER_UNION_NUM;
                }
            });
        }
        return ErrCode.PASS;
    }
    private lessMinHand(v: number): number {
        if (this.op.MinHand) {
            if (v < this.op.MinHand) {
                return ErrCode.LESS_MIN_HAND;
            }
        }
        return ErrCode.PASS;
    }
    private overMaxHand(v: number): number {
        if (this.op.MaxHand) {
            if (v > this.op.MaxHand) {
                return ErrCode.OVER_MAX_HAND;
            }
        }
        return ErrCode.PASS;
    }
    private overSingleNum(v: number, NumTotal: number): number {
        if (this.op.SingleNum) {
            if ((v + NumTotal) > this.op.SingleNum) {
                return ErrCode.OVER_SINGLE_NUM;
            }
        }
        return ErrCode.PASS;
    }
    private getTotalNums(itm: IBetTable): number {
        if (this.op.BetType !== itm.BetType) {
            const f = this.ops.find((op) => op.BetType === itm.BetType);
            if (f) {
                return f.TotalNums ? f.TotalNums : 0;
            }
        } else {
            return this.op.TotalNums ? this.op.TotalNums : 0;
        }
        return 0;
    }
    private async saveTotal<T extends IHasID>(tableName: string, data: T[], conn: mariadb.PoolConnection) {
        const jt: JTable<T> = new JTable<T>(conn, tableName);
        return await jt.MultiUpdate(data, true);
    }
    private addCurOddT(itm: IBetTable): void {
        if (this.isParlay) {
            const reg = /\d+(?=x)/g;
            const nums = itm.Num.match(reg)?.map((sNum) => {
                return parseInt(sNum, 10);
            });
            if (nums) {
                const len = nums.length;
                nums.map((num) => {
                    const tmpC: ICurOddsT = {
                        id: 0,
                        tid: itm.tid,
                        GameID: itm.GameID,
                        BetType: itm.BetType,
                        Num: num,
                        tolW: 1,
                        tolS: itm.Amt / len,
                        tolP: itm.Payouts / len
                    };
                    this.CurOT.push(tmpC);
                    const tmpM: ICurOddsT = Object.assign({}, tmpC);
                    tmpM.UpId = itm.UpId;
                    this.MCurOT.push(tmpM);
                });
            }
        } else {
            const tmpC: ICurOddsT = {
                id: 0,
                tid: itm.tid,
                GameID: itm.GameID,
                BetType: itm.BetType,
                Num: parseInt(itm.Num, 10),
                tolW: 1,
                tolS: itm.Amt,
                tolP: itm.Payouts
            };
            this.CurOT.push(tmpC);
            const tmpM: ICurOddsT = Object.assign({}, tmpC);
            tmpM.UpId = itm.UpId;
            this.MCurOT.push(tmpM);
        }
    }
    private calAvg(itm: IBetTable): void {
        if (this.isParlay) { return; }
        const tn = this.getTotalNums(itm);
        if (tn > 0) {
            const nAvg: INumAvgle = {
                id: 0,
                tid: itm.tid,
                GameID: itm.GameID,
                BetType: itm.BetType,
                Amount: itm.Amt / tn
            };
            this.AvgT.push(nAvg);
        }
    }
    private calUnionNumTotal(itm: IBetTable) {
        if (!this.isParlay) { return; }
        const tmpU: IUnionTotal = {
            id: 0,
            tid: itm.tid,
            GameID: itm.GameID,
            BetType: itm.BetType,
            UpId: 0,
            Num: itm.Num,
            Amount: itm.Amt
        };
        this.UnT.push(tmpU);
        const tmpM = Object.assign({}, tmpU);
        tmpM.UpId = itm.UpId;
        this.UnT.push(tmpM);
    }
    private doBetForChange(amt:number):number{
        if(!this.op.NoAdjust){

        }
        return ErrCode.PASS;
    }
}
