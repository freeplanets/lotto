import mariadb from "mariadb";
import ErrCode from "../DataSchema/ErrCode";
import {IBasePayRateItm, IBet, IBetContent, IBetHeader,
    IBetTable, ICurOddsData, IDayReport, IMsg, INumAvg, INumData, IStrKeyNumer} from "../DataSchema/if";
import {IGame, ITerms} from "../DataSchema/user";
import {getUserCredit, ModifyCredit} from "../func/Credit";
// import JDate from '../class/JDate';
import BetParam from "./BetParam";
import {C} from "./Func";
import JTable from "./JTable";
import {OpChk} from "./OpChk";
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
interface IOddInfo {
    BetType: number;
    SubType: number;
    OID: number;
    Num: number;
    Odds: number;
    tolS: number;
    BaseOdds: number;
}
const GameTypes = {
    MarkSix : "MarkSix",
    D3 : "3D"
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
    private GameInfo: IGame|undefined;
    private TermInfo: ITerms| undefined;
    constructor(private UserID: number, private Account: string, private UpId: number,
                private tid: number, private GameID: number,
                private PayClassID: number, private conn: mariadb.PoolConnection) {

                }
    public async AnaNum(nums: string, ExtNumInfo?: any) {
        // const SNB: ISingleNumBet[] = [];
        const msg: IMsg = {
            ErrNo: 0
        };
        this.TermInfo = await this.getTermInfo(this.tid, this.conn);
        if (this.TermInfo) {
            if (this.TermInfo.isSettled) {
                msg.ErrNo = ErrCode.NUM_STOPED;
                msg.ErrCon = "Terms End!!";
                return msg;
            }
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Terms data error!!";
            return msg;
        }
        this.GameInfo = await this.getGameInfo(this.GameID, this.conn);
        if (!this.GameInfo) {
            msg.ErrNo = 9;
            msg.ErrCon = "Game data error!!";
            return msg;
        }
        const SNB: IBetContent = {
            Content: []
        };
        const BetDetail: IBetTable[] = [];
        const GType = this.GameInfo.GType;
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
        const ans: ICurOddsData[] = await this.getOddsData(GType, arrNum);
        // console.log("AnaNum getOddsData", ans);
        const navg: INumAvg[]|undefined = await this.getNumAvgle(BetTypes);
        const opParams: IBasePayRateItm[] | undefined = await this.getOpParams(BetTypes);
        if (opParams) {
            Chker = new OpChk(this.GameInfo, this.tid, this.UserID, opParams, false, navg);
        }
        let total: number = 0;
        let payouts: number = 0;
        let BtChange: boolean = false;
        let CurBT: number = 0;
        // dta.map((itm) => {
        // for (const x in dta) {
        for (let i = 0, n = dta.length; i < n; i++) {
            const itm = dta[i];
            // console.log("AnaNum chk:", itm, ans, typeof(itm.Num), typeof(ans[0].Num));
            const found = ans.find(
                (nn) => nn.BetType === itm.BetType && nn.Num === itm.Num && (nn.NoOID || nn.OID === itm.OddsID)
                );
            // console.log("AnaNum chk:", itm, ans, typeof(itm.Num), typeof(ans[0].Num), found);
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
                    validAmt: amt,
                    Payouts: itm.Odds * amt
                };
                total = total + amt;
                payouts = payouts + (amt * itm.Odds);
                if (ExtNumInfo) {
                    bd.Num = this.rgExtNumInfo(ExtNumInfo);
                    itm.Num = bd.Num;
                }
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
            msg.ErrNo = ErrCode.NO_CREDIT;
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
                    if (ExtNumInfo) {
                        BetDetail.map((itm) => {
                            itm.Num = "0";
                        });
                    }
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
        this.TermInfo = await this.getTermInfo(this.tid, this.conn);
        if (this.TermInfo) {
            if (this.TermInfo.isSettled) {
                msg.ErrNo = ErrCode.NUM_STOPED;
                msg.ErrCon = "Terms End!!";
                return msg;
            }
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Terms data error!!";
            return msg;
        }
        this.GameInfo = await this.getGameInfo(this.GameID, this.conn);
        if (!this.GameInfo) {
            msg.ErrNo = 9;
            msg.ErrCon = "Game data error!!";
            return msg;
        }
        /*
        const igf: IGameInfo | undefined = await this.getUseAvgOdds();
        if (igf === undefined) {
            msg.ErrNo = 9;
            msg.ErrCon = "get UseAvgOdds error!!";
            return msg;
        }
        */
        const UseAvgOdds = this.GameInfo.UseAvgOdds;
        const GType = this.GameInfo.GType;
        const BetTypes: number[] = [BetType];
        let Chker: OpChk | undefined;
        const Odd: string[] = Odds.split(",");
        const arrNum: INum = {};
        let BNum: number = BetParam[GType][BetType];
        const setsN = Nums.split("|");
        const tmpNums: INumData[] = [];
        const SNB: IBetContent = {
            Content: []
        };
        console.log("Parlay", BNum);
        let isPASS: boolean = false;
        if (BNum > 0 && Odd.length < BNum) {
            msg.ErrNo = ErrCode.NOT_ENOUGH_NUM;
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
                OddsID: parseInt(tmp[1], 10),
                TNums: BNum,
                Amt
            };
            arrNum[BetType].push(iNumD.Num);
            // SNB.Content.push(iNumD);
            tmpNums.push(iNumD);
        });
        const ans: ICurOddsData[] = await this.getOddsData(GType, arrNum);
        console.log("Parlay getOddsData:", ans);
        const navg: INumAvg[]|undefined = await this.getNumAvgle(BetTypes);
        const opParams: IBasePayRateItm[] | undefined = await this.getOpParams(BetTypes);
        if (opParams) {
            Chker = new OpChk(this.GameInfo, this.tid, this.UserID, opParams, true, navg);
            /*
            const chkans = Chker.ChkData(Amt, BetType);
            if (chkans !== ErrCode.PASS) {
                msg.ErrNo = chkans;
                return msg;
            }
            */
        }
        // console.log("Parlay data:", tmpNums, ans);
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
                    const tNum: number = itm.Num as number - 100;
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
        console.log("Parlay numsets", setsN, BNum, Odd);
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
            msg.ErrNo = ErrCode.NO_CREDIT;
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
                let odds2: number = 0;
                let odds3: number = 0;
                let passodds: number = 1;
                const oddsg: number[] = [];
                const oddsg1: number[] = [];
                set.map((n) => {
                    const nn: number = parseInt(n, 10);
                    odds = odds + NumOdd[n];
                    oddsg.push(NumOdd[n]);
                    if (isPASS) {
                        passodds = passodds * NumOdd[n];
                        console.log("Pass chk", passodds, n);
                    } else if (GType === GameTypes.D3) {
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
                    } else {
                        if (arrNum[BetType].length > setsN.length) {
                            // console.log("Odds1", nn, NumOdd[100 + nn], NumOdd);
                            odds1 = odds1 + NumOdd[100 + nn];
                            if (NumOdd[200 + nn]) { odds2 = NumOdd[200 + nn]; }
                            if (NumOdd[300 + nn]) { odds3 = NumOdd[300 + nn]; }
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
                const avgOdds: number = (isPASS ? passodds : this.AvgOrMin(oddsg, UseAvgOdds));
                const bd: IBetTable = {
                    id: 0,
                    betid: rlt.insertId,
                    tid: this.tid,
                    UserID: this.UserID,
                    Account: this.Account,
                    UpId: this.UpId,
                    GameID: this.GameID,
                    BetType,
                    tGroup: idx,
                    Num: "x" + set.join("x x") + "x",
                    Odds: avgOdds,
                    Payouts: parseFloat((Amt * avgOdds).toFixed(2)),
                    Amt,
                    validAmt: Amt
                };
                if (isPASS) {
                    bd.OpPASS = BNum;
                }
                if (odds1) {
                    bd.Odds1 =  this.AvgOrMin(oddsg1, UseAvgOdds);
                    bd.Payouts1 = parseFloat((Amt * bd.Odds1).toFixed(2));
                }
                if (odds2) {
                    bd.Odds2 = odds2;
                }
                if (odds3) {
                    bd.Odds3 = odds3;
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
            console.log("Parlay Save Detail:", rlt1, BetDetail);
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
            } else {
                await this.conn.rollback();
                msg.ErrNo = 9;
                msg.ErrCon = "Save detail error !!";
                return msg;
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
    public async ParOne(BetType: number, Odds: string, Nums: string, Amt: number): Promise<IMsg> {
        const msg: IMsg = {
            ErrNo: 0
        };
        this.TermInfo = await this.getTermInfo(this.tid, this.conn);
        if (this.TermInfo) {
            if (this.TermInfo.isSettled) {
                msg.ErrNo = ErrCode.NUM_STOPED;
                msg.ErrCon = "Terms End!!";
                return msg;
            }
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Terms data error!!";
            return msg;
        }
        this.GameInfo = await this.getGameInfo(this.GameID, this.conn);
        if (!this.GameInfo) {
            msg.ErrNo = 9;
            msg.ErrCon = "Game data error!!";
            return msg;
        }
        /*
        const igf: IGameInfo | undefined = await this.getUseAvgOdds();
        if (igf === undefined) {
            msg.ErrNo = 9;
            msg.ErrCon = "get UseAvgOdds error!!";
            return msg;
        }
        */
        const UseAvgOdds = this.GameInfo.UseAvgOdds;
        const GType = this.GameInfo.GType;
        // const BetTypes: number[] = [BetType];
        let Chker: OpChk | undefined;
        const OddsID: number = parseInt(Odds, 10);
        // const arrNum: INum = {};
        const BNum: number = BetParam[GType][BetType];
        const setsN = Nums.split(",");
        // const tmpNums: INumData[] = [];
        const SNB: IBetContent = {
            Content: []
        };
        console.log("ParOne", BNum);
        let isPASS: boolean = false;
        if (BNum > 0 && setsN.length < BNum) {
            msg.ErrNo = 3;
            msg.ErrCon = "Not enough num";
            return msg;
        }
        if (BNum === 0) {
            isPASS = true;
        }
        /*
        if (typeof arrNum[BetType] === "undefined") {
            arrNum[BetType] = [];
        }
        */
        // arrNum[BetType] = Nums.split("|");
        // const total: number = 0;
        const NumOdd: INumOdd = {};
        /*
        Odd.map((itm) => {
            const tmp: string[] = itm.split(":");
            const iNumD: INumData = {
                Num: parseInt(tmp[0], 10),
                OddsID: parseInt(tmp[1], 10),
                TNums: BNum,
                Amt
            };
            arrNum[BetType].push(iNumD.Num);
            // SNB.Content.push(iNumD);
            tmpNums.push(iNumD);
        });
        */
        const ans: ICurOddsData[] = await this.getOddsData(GType, Nums, BetType);
        // console.log("after getOddsData:", ans);
        const navg: INumAvg[]|undefined = await this.getNumAvgle(BetType);
        const opParams: IBasePayRateItm[] | undefined = await this.getOpParams(BetType);
        if (opParams) {
            Chker = new OpChk(this.GameInfo, this.tid, this.UserID, opParams, true, navg);
            /*
            const chkans = Chker.ChkData(Amt, BetType);
            if (chkans !== ErrCode.PASS) {
                msg.ErrNo = chkans;
                return msg;
            }
            */
        }
        // console.log("Parlay data:", tmpNums, ans);
        // tmpNums.map((itm) => {
        let rdOdds: number = 0;
        for (let i = 0, n = setsN.length; i < n; i++) {
            const iNum = parseInt(setsN[i], 10);
            const itm: INumData = {
                Num: iNum,
                OddsID: 0,
                Odds: 0,
                Amt
            };
            const fnd = ans.find((f) => f.Num === iNum && f.OID <= OddsID);
            if (fnd) {
                if (Chker) {
                    const chk = Chker.ChkData(itm, fnd);
                    if (chk !== ErrCode.PASS) {
                        msg.ErrNo = chk;
                        return msg;
                    }
                }
                itm.Odds = fnd.Odds;
                rdOdds = fnd.Odds;
                NumOdd[itm.Num] = fnd.Odds;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = `error: ${iNum} : OID= $`;
                return msg;
            }
            SNB.Content.push(itm);
        }
        // });
        SNB.BetType = BetType;
        const jt: JTable<IBetHeader> = new JTable(this.conn, "BetHeader");
        const bh: IBetHeader = {
            id: 0,
            UpId: this.UpId,
            UserID: this.UserID,
            tid: this.tid,
            GameID: this.GameID,
            BetContent: JSON.stringify(SNB),
            Total: Amt
        };
        const balance = await getUserCredit(this.UserID, this.conn);
        if (bh.Total > balance) {
            msg.ErrNo = ErrCode.NO_CREDIT;
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
            SNB.Content.map((set, idx) => {
                let tmpOdds: number = 0;
                if (set.Odds) { tmpOdds = set.Odds as number; }
                const tmp: IExProc = {
                    id: 0,
                    betid: rlt.insertId,
                    tid: this.tid,
                    GameID: this.GameID,
                    BetType,
                    tGroup: idx,
                    Num: set.Num as number,
                    Odds: tmpOdds,
                    Opened: 0,
                    UseAvgOdds
                };
                exproc.push(tmp);
            });
                // const avgOdds: number = (isPASS ? odds : this.AvgOrMin(oddsg, UseAvgOdds));
            const bd: IBetTable = {
                    id: 0,
                    betid: rlt.insertId,
                    tid: this.tid,
                    UserID: this.UserID,
                    Account: this.Account,
                    UpId: this.UpId,
                    GameID: this.GameID,
                    BetType,
                    Num: "x" + setsN.join("x") + "x",
                    Odds: rdOdds,
                    Payouts: parseFloat((Amt * rdOdds).toFixed(2)),
                    Amt,
                    validAmt: Amt
                };
            nums.push(bd.Num);
            BetDetail.push(bd);
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
    private async getGameInfo(GameID: number, conn: mariadb.PoolConnection) {
        const jt: JTable<IGame> = new JTable(conn, "Games");
        // this.GameInfo =
        return await jt.getOne(GameID);
    }
    private async getTermInfo(tid: number, conn: mariadb.PoolConnection) {
        const jt: JTable<ITerms> = new JTable(conn, "Terms");
        return await jt.getOne(tid);
    }
    private async getOddsData(GType: string, nums: INum|string, BT?: number) {
        let chk45: boolean = false;
        let sql: string = `select c.BetType,c.SubType,UNIX_TIMESTAMP(c.OID) OID,c.Num,Odds+Rate Odds,tolS,Odds BaseOdds from CurOddsInfo c left join PayRate p
        on c.GameID=p.GameID and c.BetType=p.BetType where p.SubType=0 and
        c.tid= ${this.tid} and c.GameID = ${this.GameID} and p.PayClassID= ${this.PayClassID} and `;
        if (typeof(nums) === "string") {
            sql = sql + ` c.BetType = ${BT} and Num in (${nums})`;
        } else {
            const filters: string[] = [];
            Object.keys(nums).map((BetType) => {
                let extF = "";
                if (GType === "BTCHash" && (BetType === "41" || BetType === "42")) {
                    chk45 = true;
                    extF = ",0";
                }
                const tmp: string = "(c.BetType=" + BetType + " and Num in (" + nums[BetType].join(",") + extF + "))";
                filters.push(tmp);
            });
            sql = sql + "(" + filters.join(" or ") + ")";
            // console.log("getOddsData:", sql);
        }
        console.log("getOddsData:", sql);
        let ans;
        await this.conn.query(sql).then(async (rows) => {
            // console.log("getOddsData rows:", rows);
            if (chk45) {
                ans = [];
                const tmp: IOddInfo[] = [];
                const f0: IOddInfo = rows.find((itm) => itm.Num === 0);
                let bOdds: IOddInfo;
                bOdds = Object.assign({}, f0);
                bOdds.tolS = 0;
                Object.keys(nums).map((BetType) => {
                    nums[BetType].map((num) => {
                        const f = rows.find((itm) => itm.Num === num);
                        if (f) {
                            f.NoOID = true;
                            ans.push(f);
                        } else {
                            const newOdds = Object.assign({}, bOdds);
                            newOdds.Num = num;
                            ans.push(newOdds);
                            tmp.push(newOdds);
                        }
                        // console.log("getOddsData map:", typeof(num), num, f, ans);
                    });
                });
                if (tmp.length > 0) {
                    await this.saveNewOddsData(tmp);
                }
            } else {
                ans = rows;
            }
        }).catch((err) => {
            console.log("getOddsData", err);
            ans = false;
        });
        // console.log("getOddsData ans:", ans);
        return ans;
    }
    private async getNumAvgle(BetTypes: number[]|number): Promise<INumAvg[]|undefined> {
        let sql: string = `select BetType,Amount from NumAvgle
            where tid= ${this.tid} and GameID = ${this.GameID} and`;
        if (typeof(BetTypes) === "number") {
            sql = sql + ` BetType = ${BetTypes}`;
        } else {
            sql = sql + ` BetType in (${BetTypes.join(",")})`;
        }
        let ans;
        await this.conn.query(sql).then((rows) => {
            ans = rows;
        }).catch((err) => {
            console.log("getOddsData", err);
            // ans = false;
        });
        return ans;
    }
    private getOpParams(BetTypes: number[]|number): Promise<IBasePayRateItm[] | undefined> {
        let sql: string = `select  id,GameID,BetType,SubType,
            isParlay,NoAdjust,TopRate,Steps,TopPay,TotalNums,UseAvg,
            SingleNum,UnionNum,MinHand,MaxHand,BetForChange,ChangeStart,PerStep,StepsGroup
            from BasePayRate where GameID=${this.GameID} `;
        if (typeof(BetTypes) === "number") {
            sql = sql + ` and BetType = ${BetTypes}`;
        } else {
            sql = sql + ` and BetType in (${BetTypes.join(",")})`;
        }
        return new Promise(async (resolve, reject) => {
            // console.log("getOpParams", sql);
            this.conn.query(sql).then((res) => {
                // console.log("getOpParams", res);
                resolve(res);
            }).catch((err) => {
                console.log("getOpParams error:", err);
                reject(err);
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
    private rgExtNumInfo(ext: any) {
        const extmark = ["h", "t", "u"];    // 百,拾,個
        const tmp: string[] = [];
        for (let i = 0, n = ext.length; i < n; i++) {
            const ln: string[] = ext[i];
            for (let j = 0, jn = ln.length; j < jn; j++) {
                ln[j] = extmark[i] + ln[j] + extmark[i];
            }
            tmp.push(ln.join(" "));
        }
        return tmp.join(" : ");
    }
    private async saveNewOddsData(newOdds: IOddInfo[]) {
        const data: string[] = [];
        newOdds.map((itm) => {
            data.push(`(${this.tid},${this.GameID},${itm.BetType},${itm.SubType},${itm.Num},${itm.BaseOdds},${itm.BaseOdds})`);
        });
        const sql = `insert into CurOddsInfo(tid,GameID,BetType,SubType,Num,Odds,MaxOdds) values${data.join(",")}`;
        console.log("saveNewOddsData:", sql);
        await this.conn.query(sql).then((res) => {
            console.log("saveNewOddsData success:", res);
            return res;
        }).catch((error) => {
            console.log("saveNewOddsData error:", error);
            return false;
        });
    }
    /*
    private async calDayReport(dt:IBetTable[]){
        const sdate:string=JDate.LocalDateStr;
        const dayR:IDayReport[]=[];
        dt.map((itm:IBetTable)=>{
            const f=dayR.find(dr=>dr.SDate===sdate && dr.UpId===itm.UpId
                && dr.UserID === itm.UserID && dr.GameID===itm.GameID && dr.BetType === itm.BetType);
            if(f){
                f.Total+=itm.Amt;
            } else {
                const tmp:IDayReport={
                    SDate:sdate,
                    UpId:itm.UpId,
                    UserID:itm.UserID,
                    GameID:itm.GameID,
                    BetType:itm.BetType,
                    Total:itm.Amt,
                }
                dayR.push(tmp);
            }
        })
        return await this.saveDayReport(dayR)
    }
    private async saveDayReport(dayR:IDayReport[]){
        let sql:string='insert into DayReport(SDate,UpId,UserID,GameID,BetType,Total) values';
        const dta:string[]=[];
        dayR.map(itm=>{
            dta.push(`('${itm.SDate}',${itm.UpId},${itm.UserID},${itm.GameID},${itm.BetType},${itm.Total}`);
        })
        sql+=dta.join(",") + ' on duplicate key update Total=Total+values(Total)';
        const ans = await doQuery(sql,this.conn);
        const msg:IMsg={ErrNo:0}
        if(!ans){
            msg.ErrNo=9;
        }
        return msg;
    }
    */
}
