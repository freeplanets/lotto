import mariadb from "mariadb";
import {IBet, IBetContent, IBetHeader, IBetTable,
    ICurOddsData, IMsg, INumData, IOParam, IStrKeyNumer} from "../DataSchema/if";
import {getUserCredit, ModifyCredit} from "../func/Credit";
import {BetParam} from "./BetParam";
import {C} from "./Func";
import JTable from "./JTable";
import {ErrCode, OpChk} from "./OpChk";
// import dbPool from "src/func/db";
interface INum {
    [key: number]: any;
}
interface INumOdd {
    [key: number]: number;
}
interface IGameInfo {
    UseAvgOdds: number;
    GType: string;
}
const GameTypes = {
    MarkSix : "MarkSix"
};
export interface IExProc {
    id: number;
    betid: number;
    tid: number;
    GameID: number;
    BetType: number;
    tGroup: number;
    Num: number;
    Odds: number;
    Opened: number;
    UseAvgOdds: number;
}
/**
 * define errno
 * 1 balance
 *
 */
export class Bet implements IBet {
    constructor(private UserID: number, private Account: string, private UpId: number,
                private tid: number, private GameID: number,
                private PayClassID: number, private conn: mariadb.PoolConnection) {}
    public async AnaNum(nums: string) {
        // const SNB: ISingleNumBet[] = [];
        const msg: IMsg = {
            ErrNo: 0
        };
        const SNB: IBetContent = {
            Content: []
        };
        const BetDetail: IBetTable[] = [];
        const num: string[] = nums.split("@");
        const arrNum: INum = {};
        const dta: INumData[] = [];
        const BetTypes: number[] = [];
        let Chker: OpChk|undefined;
        num.map((itm: string) => {
            const tmp: string[] = itm.split("#");
            const n: INumData = {
                Num: parseInt(tmp[0], 10),
                OddsID: parseInt(tmp[1], 10),
                Amt: parseInt(tmp[2], 10),
                BetType: parseInt(tmp[3], 10)
            };
            if (typeof arrNum[n.BetType as number] === "undefined") {
                arrNum[n.BetType as number] = [];
            }
            arrNum[n.BetType as number].push(n.Num);
            // dta[n.BetType].push(n);
            if (n.BetType) {
               const f: number | undefined = BetTypes.find((iBT) => iBT === n.BetType);
               if (!f) {
                BetTypes.push(n.BetType);
               }
            }
            dta.push(n);
        });
        const ans: ICurOddsData[] = await this.getOddsData(arrNum);
        const opParams: IOParam[] | undefined = await this.getOpParams(BetTypes);
        if (opParams) {
            Chker = new OpChk(opParams, false);
        }
        let total: number = 0;
        let payouts: number = 0;
        let BtChange: boolean = false;
        let CurBT: number = 0;
        // dta.map((itm) => {
        // for (const x in dta) {
        for (let i = 0, n = dta.length; i < n; i++) {
            const itm = dta[i];
            const found = ans.find(
                (nn) => nn.BetType === itm.BetType && nn.Num === itm.Num &&  nn.OID === itm.OddsID
                );
            if (found) {
                if (Chker) {
                    const chk = Chker.ChkData(itm, found);
                    if (chk !== ErrCode.PASS) {
                        // console.log("Chker", chk);
                        msg.ErrNo = chk;
                        msg.ErrCon = `ChkData error:${chk}`;
                        return msg;
                    }
                }
                itm.Odds = found.Odds;
                if (CurBT === 0) {
                    CurBT = itm.BetType as number;
                } else {
                    if (CurBT !== itm.BetType) {
                        BtChange = true;
                    }
                }
                let amt: number = 0;
                if (itm.Amt) {
                    amt = itm.Amt;
                }
                const bd: IBetTable = {
                    id: 0,
                    betid: 0,
                    UserID: this.UserID,
                    Account: this.Account,
                    UpId: this.UpId,
                    tid: this.tid,
                    GameID: this.GameID,
                    BetType: itm.BetType as number,
                    Num: itm.Num + "",
                    Odds: itm.Odds,
                    Amt: amt,
                    Payouts: itm.Odds * amt
                };
                total = total + amt;
                payouts = payouts + (amt * itm.Odds);
                SNB.Content.push(itm);
                BetDetail.push(bd);
            } else {
                msg.ErrNo = 1;
                msg.ErrCon = `BetType ${itm.BetType} item ${itm.Num} not found!!`;
                return msg;
            }
        }
        // });
        if (!BtChange) {
            SNB.BetType = CurBT;
        }
        const balance: number = await getUserCredit(this.UserID, this.conn);
        if (total > balance) {
            console.log("Balance", total, balance);
            msg.ErrNo = 2;
            msg.ErrCon = "Insufficient credit";
            return msg;
        }
        await this.conn.beginTransaction();
        const jt: JTable<IBetHeader> = new JTable(this.conn, "BetHeader");
        const bh: IBetHeader = {
            id: 0,
            UserID: this.UserID,
            UpId: this.UpId,
            tid: this.tid,
            GameID: this.GameID,
            BetContent: JSON.stringify(SNB),
            Total: total,
            Payout: payouts
        };
        const rlt = await jt.Insert(bh);
        if (rlt.warningStatus === 0) {
            const ts = new Date().getTime();
            const ansmc = await ModifyCredit(this.UserID, "", "-1", total * -1, ts + "ts" + this.UserID, this.conn);
            if (ansmc) {
                msg.balance = ansmc.balance;
            } else {
                await this.conn.rollback();
                msg.ErrNo = 9;
                msg.ErrCon = "System Busy!!";
                return msg;
            }
            BetDetail.map((itm) => {
                itm.betid = rlt.insertId;
            });
            const jtd: JTable<IBetTable> = new JTable(this.conn, "BetTable");
            const rlt1 = await jtd.MultiInsert(BetDetail);
            console.log("AnaNum Save Detail:", rlt1);
            if (rlt1) {
                if (Chker) {
                    // console.log("do Chker updateTotals");
                    const totchk = Chker.updateTotals(BetDetail, this.conn);
                    if (!totchk) {
                        await this.conn.rollback();
                        msg.ErrNo = 9;
                        msg.ErrCon = "Add Total error!!";
                        return msg;
                    }
                } else {
                    console.log("no checker", Chker);
                }
                msg.data = rlt1;
                await this.conn.commit();
                return msg;
            }
        }
        msg.ErrNo = 9;
        msg.ErrCon = "System busy";
        msg.header = rlt;
        await this.conn.rollback();
        return msg;
    }
    public async Parlay(BetType: number, Odds: string, Nums: string, Amt: number): Promise<IMsg> {
        const msg: IMsg = {
            ErrNo: 0
        };
        const BetTypes: number[] = [BetType];
        let Chker: OpChk | undefined;
        const Odd: string[] = Odds.split(",");
        const arrNum: INum = {};
        let BNum = BetParam[BetType];
        const setsN = Nums.split("|");
        const tmpNums: INumData[] = [];
        const SNB: IBetContent = {
            Content: []
        };
        console.log("Parlay", BNum);
        let isPASS: boolean = false;
        if (BNum > 0 && Odd.length < BNum) {
            msg.ErrNo = 3;
            msg.ErrCon = "Not enough num";
            return msg;
        }
        const igf: IGameInfo | undefined = await this.getUseAvgOdds();
        if (igf === undefined) {
            msg.ErrNo = 9;
            msg.ErrCon = "get UseAvgOdds error!!";
            return msg;
        }
        const UseAvgOdds = igf.UseAvgOdds;
        const GType = igf.GType;
        if (BNum === 0) {
            isPASS = true;
        }
        if (typeof arrNum[BetType] === "undefined") {
            arrNum[BetType] = [];
        }
        // arrNum[BetType] = Nums.split("|");
        // const total: number = 0;
        const NumOdd: INumOdd = {};
        Odd.map((itm) => {
            const tmp: string[] = itm.split(":");
            const iNumD: INumData = {
                Num: parseInt(tmp[0], 10),
                OddsID: parseInt(tmp[1], 10),
                Amt: 0
            };
            arrNum[BetType].push(iNumD.Num);
            // SNB.Content.push(iNumD);
            tmpNums.push(iNumD);
        });
        const ans: ICurOddsData[] = await this.getOddsData(arrNum);
        const opParams: IOParam[] | undefined = await this.getOpParams(BetTypes);
        if (opParams) {
            Chker = new OpChk(opParams, true);
            /*
            const chkans = Chker.ChkData(Amt, BetType);
            if (chkans !== ErrCode.PASS) {
                msg.ErrNo = chkans;
                return msg;
            }
            */
        }
        console.log("Parlay data:", tmpNums, ans);
        // tmpNums.map((itm) => {
        for (let i = 0, n = tmpNums.length; i < n; i++) {
            const itm = tmpNums[i];
            const fnd = ans.find((f) => f.Num === itm.Num && f.OID === itm.OddsID);
            if (fnd) {
                if (Chker) {
                    const chk = Chker.ChkData(itm, fnd);
                    if (chk !== ErrCode.PASS) {
                        msg.ErrNo = chk;
                        return msg;
                    }
                }
                itm.Odds = fnd.Odds;
                NumOdd[itm.Num] = fnd.Odds;
                if (itm.Num > 100 && !isPASS) {
                    const tNum: number = itm.Num - 100;
                    SNB.Content.find((im) => {
                        if (im.Num === tNum) {
                            im.Odds += "," + fnd.Odds;
                        }
                    });
                } else {
                    SNB.Content.push(itm);
                }
            } else {
                msg.ErrNo = 9;
                return msg;
            }
        }
        // });
        SNB.BetType = BetType;
        SNB.isPaylay = true;
        if (BNum === 0) {
            BNum = Odd.length;
        }
        const numsets = C(setsN, BNum);
        const jt: JTable<IBetHeader> = new JTable(this.conn, "BetHeader");
        SNB.Sets = numsets.length;
        const bh: IBetHeader = {
            id: 0,
            UpId: this.UpId,
            UserID: this.UserID,
            tid: this.tid,
            GameID: this.GameID,
            BetContent: JSON.stringify(SNB),
            Total: numsets.length * Amt
        };
        const balance = await getUserCredit(this.UserID, this.conn);
        if (bh.Total > balance) {
            msg.ErrNo = 3;
            msg.ErrCon = "Insufficient credit";
            return msg;
        }
        await this.conn.beginTransaction();
        const rlt = await jt.Insert(bh);
        console.log("Parlay SNB:", SNB);
        if (rlt.warningStatus === 0) {
            const ts = new Date().getTime();
            const ansmc = await ModifyCredit(this.UserID, "", "-1", bh.Total * -1, ts + "ts" + this.UserID, this.conn);
            if (ansmc) {
                msg.balance = ansmc.balance;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "System Busy!!";
                // await this.conn.rollback();
                return msg;
            }
            const BetDetail: IBetTable[] = [];
            const nums: string[] = [];
            const exproc: IExProc[] = [];
            numsets.map((set, idx) => {
                let odds: number = 0;
                let odds1: number = 0;
                const oddsg: number[] = [];
                const oddsg1: number[] = [];
                set.map((n) => {
                    const nn: number = parseInt(n, 10);
                    if (isPASS) {
                        if (odds === 0) {
                            odds = 1;
                        }
                        odds = odds * NumOdd[n];
                    } else {
                        odds = odds + NumOdd[n];
                        oddsg.push(NumOdd[n]);
                        if (arrNum[BetType].length > setsN.length) {
                            console.log("Odds1", nn, NumOdd[100 + nn], NumOdd);
                            odds1 = odds1 + NumOdd[100 + nn];
                            oddsg1.push(NumOdd[100 + nn]);
                            // 三中二額外處理
                            if (GType === GameTypes.MarkSix && (BetType === 8 || BetType === 72)) {
                                const tmp: IExProc = {
                                    id: 0,
                                    betid: rlt.insertId,
                                    tid: this.tid,
                                    GameID: this.GameID,
                                    BetType,
                                    tGroup: idx,
                                    Num: n,
                                    Odds: NumOdd[n],
                                    Opened: 0,
                                    UseAvgOdds
                                };
                                exproc.push(tmp);
                            }
                        }
                    }
                });
                const avgOdds: number = (isPASS ? odds : this.AvgOrMin(oddsg, UseAvgOdds));
                const bd: IBetTable = {
                    id: 0,
                    betid: rlt.insertId,
                    tid: this.tid,
                    UserID: this.UserID,
                    Account: this.Account,
                    UpId: this.UpId,
                    GameID: this.GameID,
                    BetType,
                    Num: "x" + set.join("x") + "x",
                    Odds: avgOdds,
                    Payouts: parseFloat((Amt * avgOdds).toFixed(2)),
                    Amt
                };
                if (isPASS) {
                    bd.OpPASS = BNum;
                }
                if (odds1) {
                    bd.Odds1 =  this.AvgOrMin(oddsg1, UseAvgOdds);
                    bd.Payouts1 = parseFloat((Amt * bd.Odds1).toFixed(2));
                }
                nums.push(bd.Num);
                BetDetail.push(bd);
            });
            // 聯碼限額
            const UnionTotals: IStrKeyNumer|undefined = await this.getUnionTotals(BetType, nums);
            if (UnionTotals) {
                if (Chker) {
                    const unchk = Chker.overUnionNum(BetDetail, UnionTotals);
                    if (unchk !== ErrCode.PASS) {
                        msg.ErrNo = unchk;
                        await this.conn.rollback();
                        return msg;
                    }
                }
            }
            // 聯碼限額--End
            const jtd: JTable<IBetTable> = new JTable(this.conn, "BetTable");
            const rlt1 = await jtd.MultiInsert(BetDetail);
            console.log("Parlay Save Detail:", rlt1);
            if (rlt1) {
                if (Chker) {
                    // console.log("do Chker updateTotals");
                    const totchk = Chker.updateTotals(BetDetail, this.conn);
                    if (!totchk) {
                        await this.conn.rollback();
                        msg.ErrNo = 9;
                        msg.ErrCon = "Add Total error!!";
                        return msg;
                    }
                } else {
                    console.log("no checker", Chker);
                }
                if (exproc.length > 0) {
                    const exjtd: JTable<IExProc> = new JTable(this.conn, "BetTableEx");
                    const exrlt = await exjtd.MultiInsert(exproc);
                    if (!exrlt) {
                        await this.conn.rollback();
                        msg.ErrNo = 9;
                        msg.ErrCon = "Save BetTableEx error!!";
                        return msg;
                    }
                }
            }
            msg.data = rlt1;
            await this.conn.commit();
            return msg;
        }
        await this.conn.rollback();
        msg.ErrNo = 9;
        msg.ErrCon = "System busy!!";
        msg.header = rlt;
        return msg;

    }
    private async getOddsData(nums: INum) {
        let sql: string = `select c.BetType,UNIX_TIMESTAMP(c.OID) OID,c.Num,Odds+Rate Odds,tolS from CurOddsInfo c left join PayRate p
        on c.GameID=p.GameID and c.BetType=p.BetType where p.SubType=0 and
        c.tid= ${this.tid} and c.GameID = ${this.GameID} and p.PayClassID= ${this.PayClassID} and `;
        const filters: string[] = [];
        Object.keys(nums).map((BetType) => {
            const tmp: string = "(c.BetType=" + BetType + " and Num in (" + nums[BetType].join(",") + "))";
            filters.push(tmp);
        });
        sql = sql + "(" + filters.join(" or ") + ")";
        // console.log("getOddsData:", sql);
        let ans;
        await this.conn.query(sql).then((rows) => {
            ans = rows;
        }).catch((err) => {
            console.log("getOddsData", err);
            ans = false;
        });
        return ans;
    }
    private getOpParams(BetTypes: number[]): Promise<IOParam[] | undefined> {
        const sql: string = `select * from BasePayRate where GameID=${this.GameID} and BetType in (${BetTypes.join(",")})`;
        return new Promise(async (resolve) => {
            // console.log("getOpParams", sql);
            await this.conn.query(sql).then((res) => {
                // console.log("getOpParams", res);
                resolve(res);
            }).catch((err) => {
                console.log("getOpParams error:", err);
                resolve();
            });
        });
    }
    private async getUnionTotals(BetType: number, Nums: string[]): Promise<IStrKeyNumer|undefined> {
        const sql = `select Num,Amount from UnionNums where tid=${this.tid} and GameID=${this.GameID} and
        BetType=${BetType} and UpId=0 and Num in ('${Nums.join(",")}')`;
        const dta: IStrKeyNumer = {};
        await this.conn.query(sql).then((res) => {
            res.map((itm) => {
                dta[itm.Num] = itm.Amount;
            });
        }).catch((err) => {
            console.log("getUnionTotals", err);
            return;
        });
        return dta;
    }
    private async getUseAvgOdds(): Promise<IGameInfo|undefined> {
        const sql = `select UseAvgOdds,GType from Games where id=${this.GameID}`;
        let ans: IGameInfo|undefined;
        await this.conn.query(sql).then((res) => {
            if (res) {
                ans = res[0];
            }
        }).catch((err) => {
            console.log("Bet getUseAvgOdds error:", err);
        });
        return ans;
    }
    private AvgOrMin(dta: number[], UseAvgOdds: number) {
        if (UseAvgOdds) {
            let total: number = 0;
            dta.map((n) => {
                total += n;
            });
            return total / dta.length;
        } else {
            return Math.min.apply(Math, dta);
        }
    }
}
