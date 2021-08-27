import mariadb from "mariadb";
import JDate from "../class/JDate";
import { ErrCode } from "../DataSchema/ENum";
import {IBasePayRateItm, IBetTable, ICurOddsData, IDayReport,
    IHasID, INumAvg, INumData, IStepG, IStrKeyNumer} from "../DataSchema/if";
import {IGame} from "../DataSchema/user";
import {doQuery} from "../func/db";
import {getOtherSide} from "./Func";
import JTable from "./JTable";
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
interface IUdOdds {
    tid: number;
    GameID: number;
    BetType: number;
    Num: number;
    Odds: number;
}
/**
 * 六合彩類 BetType:8,72,10,73 有雙賠率,第二賠號碼加 100
 */
export class OpChk {
    private iniop: IBasePayRateItm = {
        id: 0
    };
    private op: IBasePayRateItm = Object.assign({}, this.iniop);
    private op2: IBasePayRateItm = Object.assign({}, this.iniop);
    private CurOT: ICurOddsT[] = [];
    private MCurOT: ICurOddsT[] = [];
    private AvgT: INumAvgle[] = [];
    private UnT: IUnionTotal[] = [];
    private BetC: IUdOdds[] = [];
    private MoreOdds: number[] = [8, 72, 10, 73];
    constructor(private GInfo: IGame, private tid: number, private UserID: number, private ops: IBasePayRateItm[], private isParlay: boolean, private NumAvg?: INumAvg[] ) {}
    public ChkData(dt: INumData , Odds: ICurOddsData) {
        let chkAmt = 0;
        chkAmt = dt.Amt;
        if (this.op.BetType !== Odds.BetType && this.op.SubType !== Odds.SubType) {
            const f = this.ops.find((itm) => itm.BetType === Odds.BetType && itm.SubType === Odds.SubType);
            if (f) {
                this.op = Object.assign({}, f);
            } else {
                this.op = Object.assign({}, this.iniop);
            }
        }
        let chk: number;
        // console.log("ChkData", dt);
        chk = this.lessMinHand(chkAmt);
        if (chk !== ErrCode.PASS) { return chk; }
        chk = this.overMaxHand(chkAmt);
        if (chk !== ErrCode.PASS) { return chk; }
        chk = this.overSingleNum(chkAmt, Odds.tolS);
        if (chk !== ErrCode.PASS) { return chk; }
        chk = this.chkBetForChange(dt, Odds);
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
        const sdate: string = JDate.LocalDateStr;
        const dayR: IDayReport[] = [];
        data.map((itm) => {
            this.addCurOddT(itm);
            this.calAvg(itm);
            this.calUnionNumTotal(itm);
            const f = dayR.find((dr) => dr.SDate === sdate && dr.UpId === itm.UpId
                && dr.UserID === itm.UserID && dr.GameID === itm.GameID && dr.BetType === itm.BetType);
            if (f) {
                f.Total += itm.Amt;
            } else {
                const tmp: IDayReport = {
                    SDate: sdate,
                    UpId: itm.UpId,
                    UserID: itm.UserID,
                    GameID: itm.GameID,
                    BetType: itm.BetType,
                    Total: itm.Amt,
                };
                dayR.push(tmp);
            }
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
        const doBFC = await this.doBetForChagne(conn);
        if (!doBFC) {
            return false;
        }
        const doRpt = await this.saveDayReport(dayR, conn);
        return !!doRpt;
    }
    public overUnionNum(itms: IBetTable[], UnionTotals: IStrKeyNumer): number {
        let err: number = ErrCode.PASS;
        if (this.op.UnionNum) {
            const UnionNum: number = this.op.UnionNum;
            itms.map((itm) => {
                if (itm.Amt + UnionTotals[itm.Num] > UnionNum) {
                    err = ErrCode.OVER_UNION_NUM;
                }
            });
        }
        return err;
    }
    private async saveDayReport(dayR: IDayReport[], conn: mariadb.PoolConnection) {
        let sql: string = "insert into DayReport(SDate,UpId,UserID,GameID,BetType,Total) values";
        const dta: string[] = [];
        dayR.map((itm) => {
            dta.push(`('${itm.SDate}',${itm.UpId},${itm.UserID},${itm.GameID},${itm.BetType},${itm.Total})`);
        });
        sql += dta.join(",") + " on duplicate key update Total=Total+values(Total)";
        return await doQuery(sql, conn);
    }
    private lessMinHand(v: number): number {
        if (this.op.MinHand) {
            if (v < this.op.MinHand) {
                console.log("lessMinHand", this.op.MinHand, v);
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
                // console.log("overSingleNum", v, typeof(v), NumTotal, typeof(NumTotal), this.op.SingleNum, typeof(this.op.SingleNum));
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
        return await jt.MultiUpdate(data, true, true);
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
            // console.log("addCurOddT", tmpC);
            this.CurOT.push(tmpC);
            const tmpM: ICurOddsT = Object.assign({}, tmpC);
            tmpM.UpId = itm.UpId;
            this.MCurOT.push(tmpM);
        }
        // console.log("addCurOddT", this.CurOT);
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
    private chkBetForChange(dt: INumData , Odds: ICurOddsData): number {
        // console.log("chkBetForChange", dt, Odds, this.op);
        if (!this.op.NoAdjust) {
            if (this.op.BetForChange) {
                let avg: number = 0;
                let base: number = 0;
                if (this.op.UseAvg) {
                    avg = this.getAvg(dt.BetType as number);
                    base = dt.Amt + Odds.tolS;
                    // console.log("chkavg", base, avg);
                    if (base < avg) {
                        return ErrCode.PASS;
                    }
                }
                const ChangeStart: number = this.op.ChangeStart ? this.op.ChangeStart : 0;
                const chkAmt = Odds.tolS - avg - ChangeStart;
                if (chkAmt < 0 ) { return ErrCode.PASS; }
                const leftAmt = chkAmt % this.op.BetForChange;
                const Amt = dt.TNums ? dt.Amt / dt.TNums : dt.Amt;
                console.log("chkchange", leftAmt , Amt, dt.Amt, dt.TNums, ChangeStart, this.op.BetForChange, avg, Odds.tolS, Odds.Odds);
                // console.log("Chk Types", typeof(leftAmt), typeof(dt.Amt), typeof(ChangeStart), typeof(this.op.BetForChange), typeof(avg), typeof(Odds.tolS));
                if ((leftAmt + Amt) >= this.op.BetForChange) {
                    const chgOdds = this.calBetforChange(Odds.tolS + Amt);
                    console.log("chgOdds", chgOdds);
                    const udodd: IUdOdds = {
                        tid: this.tid,
                        GameID: this.op.GameID as number,
                        BetType: this.op.BetType as number,
                        Num: dt.Num as number,
                        Odds: chgOdds,
                    };
                    this.BetC.push(udodd);
                    // this.BetC.push(`${this.tid},${this.op.GameID},${this.op.BetType},${dt.Num},${chgOdds}`);
                    if (this.GInfo.BothSideAdjust && this.op.TotalNums === 2) {  // 雙面連動
                        const xNum: number = getOtherSide(dt.Num as number);
                        const xudodd: IUdOdds = {
                            tid: this.tid,
                            GameID: this.op.GameID as number,
                            BetType: this.op.BetType as number,
                            Num: xNum,
                            Odds: -1 * chgOdds,
                        };
                        this.BetC.push(xudodd);
                        // this.BetC.push(`${this.tid},${this.op.GameID},${this.op.BetType},${xNum},${-1 * chgOdds}`);
                    }
                }
            }
        }
        return ErrCode.PASS;
    }
    private getAvg(bt: number): number {
        let avg: number = 0;
        if (this.NumAvg) {
            const f = this.NumAvg.find((itm) => itm.BetType === bt);
            if (f) {
                avg = f.Amount;
            }
        }
        return avg;
    }
    private calBetforChange(tolSPlusAmt: number) {
        // const pSt = this.op.PerStep ? this.op.PerStep : 0;
        const st = this.op.Steps ? this.op.Steps : 0;
        if (this.op.StepsGroup) {
            const StG: IStepG[] = JSON.parse(this.op.StepsGroup.replace(/\\/g, ""));
            if (StG.length > 0) {
                const steps = this.getStepsFromSG(StG, tolSPlusAmt);
                console.log("calBetforChange", st, steps, StG);
                if (steps) { return steps; }
            }
        }
        return st;
    }
    private getStepsFromSG(stg: IStepG[], v: number): number {
        let steps: number = 0;
        for (let i = 0, n = stg.length; i < n; i++) {
            stg[i].Start = typeof(stg[i].Start) === "string" ?  parseInt(stg[i].Start + "" , 10) : stg[i].Start;
            if (stg[i].Start > v) { break; }
            steps = stg[i].Step;
        }
        return steps;
    }
    private async doBetForChagne(conn: mariadb.PoolConnection): Promise<any> {
        // console.log("doBetForChagne", this.BetC);
        if (this.BetC.length > 0) {
            let chk: boolean = true;
            await Promise.all(this.BetC.map(async (itm: IUdOdds) => {
                if (chk) {
                    const sql = `Update CurOddsInfo set Odds=Odds-${itm.Odds} where
                        tid=${itm.tid} and GameID=${itm.GameID} and BetType=${itm.BetType} and Num=${itm.Num} and MaxOdds>=Odds-${itm.Odds}`;
                    console.log("doBetForChange:", sql);
                    const ans = await doQuery(sql, conn);
                    chk = !!ans;
                }
            }));
            /*
            const  sql: string = `insert into CurOddsInfo(tid,GameID,BetType,Num,Odds)
                values(${this.BetC.join("),(")}) on duplicate key update Odds=values(Odds)`;
            return await doQuery(sql, conn);
            */
        }
        return true;
    }
}
