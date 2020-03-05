import mariadb from "mariadb";
import {IBet, IBetContent, IBetHeader, IMsg, INumData} from "../DataSchema/if";
import {getUserCredit, ModifyCredit} from "../func/Credit";
import {BetParam} from "./BetParam";
import {C} from "./Func";
import JTable from "./JTable";
interface INum {
    [key: number]: any;
}
interface ICurOddsData {
    BetType: number;
    OID: number;
    Num: number;
    Odds: number;
}

interface IBetTable {
    id: number;
    betid: number;
    UserID: number;
    Account: string;
    UpId: number;
    tid: number;
    GameID: number;
    BetType: number;
    Num: string;
    Odds: number;
    Odds1?: number;
    OpPASS?: number;
    Amt: number;
    Payouts: number;
    Payouts1?: number;
    WinLose?: number;
    isCancled?: number;
    isSettled?: number;
}
interface INumOdd {
    [key: number]: number;
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
            dta.push(n);
        });
        const ans: ICurOddsData[] = await this.getOddsData(arrNum);
        console.log("AnaNum ans:", ans);
        let total: number = 0;
        let payouts: number = 0;
        let BtChange: boolean = false;
        let CurBT: number = 0;
        dta.map((itm) => {
            const found = ans.find(
                (nn) => nn.BetType === itm.BetType && nn.Num === itm.Num &&  nn.OID === itm.OddsID
                );
            if (found) {
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
        });
        if (!BtChange) {
            SNB.BetType = CurBT;
        }
        const balance: number = await getUserCredit(this.UserID, this.conn);
        if (total > balance) {
            msg.ErrNo = 2;
            msg.ErrCon = "Insufficient credit";
            return msg;
        }
        await this.conn.beginTransaction();
        const jt: JTable<IBetHeader> = new JTable(this.conn, "betheader");
        const bh: IBetHeader = {
            id: 0,
            UserID: this.UserID,
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
            const jtd: JTable<IBetTable> = new JTable(this.conn, "bettable");
            const rlt1 = await jtd.MultiInsert(BetDetail);
            console.log("Save Detail:", rlt1);
            msg.data = rlt1;
            await this.conn.commit();
            return msg;
        }
        msg.ErrNo = 9;
        msg.ErrCon = "System busy";
        msg.header = rlt;
        await this.conn.rollback();
        return msg;
    }
    public async Parlay(BetType: number, Odds: string, Nums: string, Amt: number) {
        const msg: IMsg = {
            ErrNo: 0
        };
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
                OddsID: parseInt(tmp[1], 10)
            };
            arrNum[BetType].push(iNumD.Num);
            // SNB.Content.push(iNumD);
            tmpNums.push(iNumD);
        });
        const ans: ICurOddsData[] = await this.getOddsData(arrNum);
        console.log("Parlay data:", tmpNums, ans);
        tmpNums.map((itm) => {
            const fnd = ans.find((f) => f.Num === itm.Num && f.OID === itm.OddsID);
            if (fnd) {
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
                return false;
            }
        });
        SNB.BetType = BetType;
        SNB.isPaylay = true;
        if (BNum === 0) {
            BNum = Odd.length;
        }
        const numsets = C(setsN, BNum);
        const jt: JTable<IBetHeader> = new JTable(this.conn, "betheader");
        SNB.Sets = numsets.length;
        const bh: IBetHeader = {
            id: 0,
            UserID: this.UserID,
            tid: this.tid,
            GameID: this.GameID,
            BetContent: JSON.stringify(SNB),
            Total: numsets.length * Amt
        };
        const balance = await getUserCredit(this.UserID, this.conn);
        if (bh.Total > balance) {
            msg.ErrNo = 2;
            msg.ErrCon = "Insufficient credit";
            return msg;
        }
        // await this.conn.beginTransaction();
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
            numsets.map((set) => {
                let odds: number = 0;
                let odds1: number = 0;
                set.map((n) => {
                    const nn: number = parseInt(n, 10);
                    if (isPASS) {
                        if (odds === 0) {
                            odds = 1;
                        }
                        odds = odds * NumOdd[n];
                    } else {
                        odds = odds + NumOdd[n];
                        if (arrNum[BetType].length > setsN.length) {
                            console.log("Odds1", nn, NumOdd[100 + nn], NumOdd);
                            odds1 = odds1 + NumOdd[100 + nn];
                        }
                    }
                });
                const avgOdds: number = (isPASS ? odds : odds / set.length);
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
                    Payouts: parseFloat((Amt * avgOdds).toFixed(6)),
                    Amt
                };
                if (isPASS) {
                    bd.OpPASS = BNum;
                }
                if (odds1) {
                    bd.Odds1 =  odds1 / set.length;
                    bd.Payouts1 = parseFloat((Amt * bd.Odds1).toFixed(6));
                }
                BetDetail.push(bd);
            });
            const jtd: JTable<IBetTable> = new JTable(this.conn, "bettable");
            const rlt1 = await jtd.MultiInsert(BetDetail);
            console.log("Save Detail:", rlt1);
            msg.data = rlt1;
            // await this.conn.commit();
            return msg;
        }
        // await this.conn.rollback();
        msg.ErrNo = 9;
        msg.ErrCon = "System busy!!";
        msg.header = rlt;
        return msg;

    }
    private async getOddsData(nums: INum) {
        let sql: string = `select c.BetType,c.OID,c.Num,Odds+Rate Odds from curoddsinfo c left join payrate p
        on c.GameID=p.GameID and c.BetType=p.BetType where p.SubType=0 and
        c.tid= ${this.tid} and c.GameID = ${this.GameID} and p.PayClassID= ${this.PayClassID} and `;
        const filters: string[] = [];
        Object.keys(nums).map((BetType) => {
            const tmp: string = "(c.BetType=" + BetType + " and Num in (" + nums[BetType].join(",") + "))";
            filters.push(tmp);
        });
        sql = sql + "(" + filters.join(" or ") + ")";
        console.log("getOddsData:", sql);
        let ans;
        await this.conn.query(sql).then((rows) => {
            ans = rows;
        }).catch((err) => {
            console.log("getOddsData", err);
            ans = false;
        });
        return ans;
    }
}
