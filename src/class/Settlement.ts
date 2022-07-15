import mariadb from "mariadb";
import { saveParamLog } from "../API/ApiFunc";
import { getGTypeByGameID } from "../API/MemberApi";
import GenHashNum from "../components/class/GetHash/GenHashNum";
import { ErrCode } from "../DataSchema/ENum";
import { GameType, IMsg, IParamLog, ISqlProc} from "../DataSchema/if";
import { doQuery } from "../func/db";
// const SettleMethods=MarkSixST['MarkSix'];
import CancelTermF from "./DBFunction/CancelTerm";
import CurOddsInfo from "./DBFunction/CurOddsInfo";
import DayReport from "./DBFunction/DayReport";
// import NumPack from "./NumPack/Pack";
import {AlwaysSetl} from "./Settlement/AlwaysSetl";
import {BTCHashSetl} from "./Settlement/BTCHashSetl";
import {CarsSetl} from "./Settlement/CarsSetl";
import {D3DSetl} from "./Settlement/D3DSetl";
import {Happy8Setl} from "./Settlement/Happy8Setl";
import {HappySetl} from "./Settlement/HappySetl";
import { HashSixSetl} from "./Settlement/HashSixSetl";
// import {CMarkSixMum, IMSResult} from "./Settlement/CMarkSixMum";
import { MarkSixSetl} from "./Settlement/MarkSixSetl";
import {SGPoolsSetl} from "./Settlement/SGPoolsSetl";
import {Speed3Setl} from "./Settlement/Speed3Setl";
import {VNNorthSetl} from "./Settlement/VNNorthSetl";

// 重結 isSettled =3 轉成 status = 4 提供平台視別
export async function SaveNums(tid: number, GameID: number, num: string, conn: mariadb.PoolConnection, isSettled?: number, PLog?: IParamLog[]) {
    let GType: string|undefined;
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    // const g = await getGame(GameID, conn);
    const g = await getGTypeByGameID(GameID, conn);
    if (g) {
        // num = new NumPack(num, g).Nums; // 賓果時時彩，賓果賽車，用台灣賓果的號碼產生
        // console.log("before checkNum");
        GType = g.GType;
        num = new GenHashNum().get(num, GType);
        msg = await checkNum(g, num, conn);
        // console.log("after checkNum", msg);
        if (msg.ErrNo !== ErrCode.PASS ) { return msg; }
    } else {
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        return msg;
    }
    let sql: string = "";
    // let sqls: string[];
    let sqls: ISqlProc = {
        pre: [],
        common: [],
        final: ""
    };
    const SettleStatus: number = isSettled ? 3 : 1;
    await conn.query("SET AUTOCOMMIT=0;");
    await conn.beginTransaction();
    sql = `update CurOddsInfo set isStop=1 where tid=${tid}`;
    await conn.query(sql).then(async (res) => {
        // console.log( "SaveNums", sql, res);
        // ans = true;
        if (PLog) {
            // console.log("SaveNums", PLog);
            await saveParamLog(PLog, conn);
        }
    }).catch(async (err) => {
        console.log(sql, err);
        await conn.rollback();
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        msg.error = err;
        // ans = false;
    });
    if (msg.ErrNo === ErrCode.PASS) {
        sql = `update BetTableEx set Opened=0 where tid=${tid} and GameID=${GameID}`;
        await conn.query(sql).then(async (res) => {
            console.log("BetTableEx set open zero:", sql, res);
        }).catch(async (err) => {
            console.log("update BetTableEx set Opened=0", err);
            await conn.rollback();
            msg.ErrNo = ErrCode.DB_QUERY_ERROR;
            msg.error = err;
            // ans = false;
        });
    }
    if (msg.ErrNo === ErrCode.PASS) {
        // 還原結帳檢查結果,併預設會員為輸 WinLose=Amt*-1
        sql = `update BetTable set WinLose=Amt*-1,validAmt=Amt,OpNums=0,OpSP=0,isSettled=${SettleStatus} where tid=${tid} and GameID=${GameID} and isCancled=0`;
        // console.log("Update Settle Status", sql);
        await conn.query(sql).then((res) => {
            // console.log("WinLose=Amt*-1", sql, res);
            msg.resetBetTable = res;
            // ans = true;
        }).catch(async (err) => {
            console.log("WinLose=Amt*-1 err 1", err);
            await conn.rollback();
            msg.ErrNo = ErrCode.DB_QUERY_ERROR;
            msg.error = err;
            // ans = false;
        });
    }
    if (msg.ErrNo === ErrCode.PASS) {
        // winlose update check
        sql = `select count(*) cnt from BetTable where tid=${tid} and GameID=${GameID} and isCancled=0 and WinLose=0`;
        await conn.query(sql).then((res) => {
            // console.log("WinLose=0", sql, res);
            // ans = true;
            msg.cntBetTable = res;
        }).catch(async (err) => {
            console.log("WinLose=0", err);
            msg.ErrNo = ErrCode.DB_QUERY_ERROR;
            msg.error = err;
        });
    }
    if (msg.ErrNo !== ErrCode.PASS) {
        // return imsr;
        await conn.query("SET AUTOCOMMIT=1;");
        return msg;
    }
    // 搜尋有下注的BetType
    sql = `SELECT BetType,COUNT(*) cnt FROM BetTable WHERE tid=${tid} and GameID=${GameID} and isCancled=0 group by BetType order by BetType`;
    let rtn;
    await conn.query(sql).then( (res) => {
        rtn = res;
        // console.log("搜尋有下注的BetType", sql, res);
    }).catch(async (err) => {
        console.log("WinLose=Amt*-1 err 2", err);
        await conn.rollback();
        // ans = false;
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        msg.error = err;
    });
    if (rtn) {
        // console.log("rtn chk:", sql, rtn);
        sqls = doBT(tid, GameID, num, rtn, conn, GType);
        // console.log("after do BT:", sqls);
        let needBreak: boolean = false;
        if (sqls.pre.length > 0) {
            await Promise.all(sqls.pre.map(async (itm) => {
                if (needBreak) { return; }
                const ans = await doQuery(itm, conn);
                if (!ans) {
                    console.log("err rollback 0", itm);
                    needBreak = true;
                    // await conn.rollback();
                    // await conn.query("SET AUTOCOMMIT=1;");
                    msg.ErrNo = ErrCode.DB_QUERY_ERROR;
                    if (!msg.ErrSql) { msg.ErrSql = []; }
                    msg.ErrSql.push(itm);
                    // return false;
                }
            }));
        }
        await Promise.all(sqls.common.map(async (itm) => {
            if (needBreak) { return; }
            // console.log("sqls.common:", itm);
            const ans = await doQuery(itm, conn);
            if (!ans) {
                console.log("err rollback 1", itm);
                needBreak = true;
                // await conn.rollback();
                // await conn.query("SET AUTOCOMMIT=1;");
                msg.ErrNo = ErrCode.DB_QUERY_ERROR;
                if (!msg.ErrSql) { msg.ErrSql = []; }
                msg.ErrSql.push(itm);
                // return false;
            }
        }));
    }
    // console.log("batch:", ans);
    if (msg.ErrNo === ErrCode.PASS) {
        // sql = `update Terms set Result='${imsr.RegularNums.join(",")}',SpNo='${imsr.SPNo}',ResultFmt='${JSON.stringify(imsr)}',isSettled=${SettleStatus} where id=${tid}`;
        sql = sqls.final;
        const ans = await doQuery(sql, conn, [SettleStatus]);
        if (ans) {
            // console.log("commit 1");
            await conn.commit();
            await new DayReport(conn).Cal(tid);
            await new CurOddsInfo(conn).Save(tid, GameID);
        } else {
            console.log("err rollback 2", sql);
            await conn.rollback();
            msg.ErrNo = ErrCode.DB_QUERY_ERROR;
            msg.ErrCon = sql;
        }
    } else {
        console.log("err rollback 3", msg);
        await conn.rollback();
    }
    await conn.query("SET AUTOCOMMIT=1;");
    // console.log("SQL:", ans);
    return msg;
}
export async function CancelTerm(tid: number, conn: mariadb.PoolConnection) {
    const CT = new CancelTermF(tid, conn);
    return CT.doit();
}
function doBT(tid: number, GameID: number, imsra: any, rtn: any, conn: mariadb.PoolConnection, GType?: string): ISqlProc {
    let ans: ISqlProc|undefined;
    switch (GType) {
        case "3D":
            ans = D3DSetl(tid, GameID, imsra, rtn, conn);
            break;
        case "Happy":
            ans = HappySetl(tid, GameID, imsra, rtn, conn);
            break;
        case "Happy8":
            ans = Happy8Setl(tid, GameID, imsra, rtn, conn);
            break;
        case "Cars":
            ans = CarsSetl(tid, GameID, imsra, rtn, conn);
            break;
        case "Always":
            ans = AlwaysSetl(tid, GameID, imsra, rtn, conn);
            break;
        case "Speed3":
            ans = Speed3Setl(tid, GameID, imsra, rtn, conn);
            break;
        case "BTCHash":
            ans = BTCHashSetl(tid, GameID, imsra, rtn, conn);
            break;
        case "HashSix":
            ans = HashSixSetl(tid, GameID, imsra, rtn, conn);
            break;
        case "SGPools":
            ans = SGPoolsSetl(tid, GameID, imsra, rtn, conn);
            break;
        case "VNNorth":
            ans = VNNorthSetl(tid, GameID, imsra, rtn, conn);
            break;
        default:
            ans = MarkSixSetl(tid, GameID, imsra, rtn, conn);
    }
    /**
     * update header
     */
    let sql = `insert into BetHeader(id,WinLose,isSettled) select betid id,sum(WinLose) WinLose,isSettled from BetTable where tid=${tid} and GameID=${GameID} and isCancled=0 group by betid`;
    sql = sql + " on duplicate key update WinLose=values(WinLose),isSettled=values(isSettled)";
    // ans = ans.concat([sql]);
    ans.common.push(sql);
    // 損益歸戶
    sql = `insert into UserCredit(uid,GameID,tid,DepWD)
        select UserID uid,GameID,tid,sum(Total + WinLose) DepWD
        from BetHeader where tid=${tid} and GameID=${GameID} and isCancled=0 group by UserID,GameID,tid`;
    sql = sql + " on duplicate key update DepWD=values(DepWD)";
    // console.log("doBT:", sql);
    ans.common.push(sql);
    sql = "insert into Member(id,Balance) select uid id,sum(DepWD) Balance from UserCredit where 1 group by uid";
    sql = sql + " on duplicate key update Balance=values(Balance)";
    ans.common.push(sql);
    return ans;
}

async function checkNum(g: GameType, num: string, conn: mariadb.PoolConnection) {
    // const ans: GameType | undefined = await getGameType(GType, conn);
    // console.log("checkNum", ans);
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    const arr = num.split(",");
    if (arr.length < g.OpenNums) {
        msg.ErrNo = ErrCode.NOT_ENOUGH_NUM;
    } else {
        const newV = arr.map((v) => parseInt(v, 10));
        let pass = checkSameNum(newV, g.SameNum);
        if (pass) {
            pass = newV.every((v) => {
                return checkNumBG(v, g.StartNum, g.EndNum);
                });
            if (!pass) {
                msg.ErrNo = ErrCode.UNEXPECT_NUMBER;
                }
        } else {
            msg.ErrNo = ErrCode.NO_SAME_NUMBER;
        }
    }
    return msg;
}
function checkNumBG(num: number, start: number, end: number) {
    if (num >= start && num <= end) { return true; }
    return false;
}
function checkSameNum(nums: number[], allowSameNum = 0) {
    const newN: number[] = [];
    nums.map((n) => {
        const fIdx = newN.findIndex((v) => v === n);
        if (fIdx === -1) { newN.push(n); }
    });
    const hasNoSameNum = newN.length === nums.length;
    let ans = true;
    if (!hasNoSameNum) {
         if (!allowSameNum) { ans = false; }
    }
    return ans;
}
