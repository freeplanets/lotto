import mariadb from "mariadb";
import {saveParamLog} from "../API/ApiFunc";
import {getGame} from "../API/MemberApi";
import {IMsg, IParamLog, ISqlProc} from "../DataSchema/if";
import {ITerms} from "../DataSchema/user";
import {doQuery} from "../func/db";
import JTable from "./JTable";
import {AlwaysSetl} from "./Settlement/AlwaysSetl";
import {CarsSetl} from "./Settlement/CarsSetl";
import {D3DSetl} from "./Settlement/D3DSetl";
import {Happy8Setl} from "./Settlement/Happy8Setl";
import {HappySetl} from "./Settlement/HappySetl";
// import {CMarkSixMum, IMSResult} from "./Settlement/CMarkSixMum";
import {getEx, MarkSixSetl} from "./Settlement/MarkSixSetl";
import {Speed3Setl} from "./Settlement/Speed3Setl";
// const SettleMethods=MarkSixST['MarkSix'];

// 重結 isSettled =3 轉成 status = 4 提供平台視別
export async function SaveNums(tid: number, GameID: number, num: string, conn: mariadb.PoolConnection, isSettled?: number, PLog?: IParamLog[]) {
    let GType: string|undefined;
    const g = await getGame(GameID, conn);
    if (g) {
        GType = g.GType;
    } else {
        return false;
    }
    let ans;
    let sql: string = "";
    // let sqls: string[];
    let sqls: ISqlProc = {
        pre: [],
        common: [],
        final: ""
    };
    const SettleStatus: number = isSettled ? 3 : 1;
    await conn.beginTransaction();
    sql = `update CurOddsInfo set isStop=1 where tid=${tid}`;
    await conn.query(sql).then(async (res) => {
        console.log( "SaveNums", sql, res);
        ans = true;
        if (PLog) {
            console.log("SaveNums", PLog);
            await saveParamLog(PLog, conn);
        }
    }).catch(async (err) => {
        console.log(sql, err);
        await conn.rollback();
        ans = false;
    });
    sql = `update BetTableEx set Opened=0 where tid=${tid} and GameID=${GameID}`;
    await conn.query(sql).then(async (res) => {
        console.log("BetTableEx set open zero:", sql, res);
    }).catch(async (err) => {
        console.log("update BetTableEx set Opened=0", err);
        await conn.rollback();
        ans = false;
    });
    if (ans) {
        // 還原結帳檢查結果,併預設會員為輸 WinLose=Amt*-1
        sql = `update BetTable set WinLose=Amt*-1,validAmt=Amt,OpNums=0,OpSP=0,isSettled=${SettleStatus} where tid=${tid} and GameID=${GameID} and isCancled=0`;
        console.log("Update Settle Status", sql);
        await conn.query(sql).then((res) => {
            // console.log("WinLose=Amt*-1", sql, res);
            ans = true;
        }).catch(async (err) => {
            console.log("WinLose=Amt*-1 err 1", err);
            await conn.rollback();
            ans = false;
        });
    }
    if (ans) {
        // winlose update check
        sql = `select count(*) cnt from BetTable where tid=${tid} and GameID=${GameID} and isCancled=0 and WinLose=0`;
        await conn.query(sql).then((res) => {
            // console.log("WinLose=0", sql, res);
            ans = true;
        }).catch(async (err) => {
            console.log("WinLose=0", err);
            await conn.rollback();
            ans = false;
        });
    }
    if (!ans) {
        // return imsr;
        return ans;
    }
    // 搜尋有下注的BetType
    sql = `SELECT BetType,COUNT(*) cnt FROM BetTable WHERE tid=${tid} and GameID=${GameID} and isCancled=0 group by BetType order by BetType`;
    let rtn;
    await conn.query(sql).then( (res) => {
        rtn = res;
    }).catch(async (err) => {
        console.log("WinLose=Amt*-1 err 2", err);
        await conn.rollback();
        ans = false;
    });
    if (rtn) {
        sqls = doBT(tid, GameID, num, rtn, conn, GType);
        if (sqls.pre.length > 0) {
            await Promise.all(sqls.pre.map(async (itm) => {
                ans = await doQuery(itm, conn);
                if (!ans) {
                    console.log("err rollback 0");
                    await conn.rollback();
                    return false;
                }
            }));
            if (GType === "MarkSix") {  // 六合彩類 3中2 2中特 均成賠率或最小賠率檢查
                sql = `select * from BetTableEx
                    where tid=${tid} and GameID=${GameID} `;
                let strs: string[] = [];
                await conn.query(sql).then((res) => {
                    strs = getEx(res);
                }).catch(async (err) => {
                    console.log("Ex proc error", err);
                    await conn.rollback();
                    return false;
                });
                if (strs.length > 0) {
                    await Promise.all(strs.map(async (str) => {
                        ans = await doQuery(str, conn);
                        if (!ans) {
                            console.log("err rollback ex modify:");
                            await conn.rollback();
                            return false;
                        }
                    }));
                }
            }
        }
        let needBreak: boolean = false;
        await Promise.all(sqls.common.map(async (itm) => {
            if (needBreak) { return; }
            // console.log("sqls.common:", itm);
            ans = await doQuery(itm, conn);
            if (!ans) {
                console.log("err rollback 1");
                needBreak = true;
                await conn.rollback();
                return false;
            }
        }));
    }
    console.log("batch:", ans);
    if (ans) {
        // sql = `update Terms set Result='${imsr.RegularNums.join(",")}',SpNo='${imsr.SPNo}',ResultFmt='${JSON.stringify(imsr)}',isSettled=${SettleStatus} where id=${tid}`;
        sql = sqls.final;
        ans = await doQuery(sql, conn, [SettleStatus]);
        if (ans) {
            console.log("commit 1");
            await conn.commit();
        } else {
            console.log("err rollback 2");
            await conn.rollback();
        }
    } else {
        console.log("err rollback 3");
        await conn.rollback();
        return false;
    }
    // console.log("SQL:", ans);
    return true;
}
export async function CancelTerm(tid: number, conn: mariadb.PoolConnection) {
    const sqls: string[] = [];
    let sql: string = "";
    const msg: IMsg = {ErrNo: 0};
    const jt: JTable<ITerms> = new JTable(conn, "Terms");
    const term = await jt.getOne(tid);
    if (term) {
        sql = `update CurOddsInfo set isStop=1 where tid=${tid}`;
        sqls.push(sql);
        sql = `update Terms set isCanceled=1 where id=${tid}`;
        sqls.push(sql);
        sql = `update BetTable set isCancled=1,WinLose=0 where tid=${tid}`;  // and GameID=${term.GameID}`;
        sqls.push(sql);
        sql = `update BetHeader set isCancled=1,WinLose=0 where tid=${tid}`; // and GameID=${term.GameID}`;
        sqls.push(sql);
        // 損益歸戶
        sql = `insert into UserCredit(uid,GameID,tid,DepWD)
            select UserID uid,GameID,tid,sum(Total + WinLose) DepWD
            from BetHeader where tid=${tid} and isCancled=1 group by UserID,GameID,tid`;
        sql = sql + " on duplicate key update DepWD=values(DepWD)";
        sqls.push(sql);
        sql = "insert into Member(id,Balance) select uid id,sum(DepWD) Balance from UserCredit where 1 group by uid";
        sql = sql + " on duplicate key update Balance=values(Balance)";
        sqls.push(sql);
        const needBreak: boolean = false;
        await conn.beginTransaction();
        await Promise.all(sqls.map(async (qry) => {
            if (needBreak) { return; }
            console.log("CancelTerm:", qry);
            const ans = await doQuery(qry, conn);
            if (!ans) {
                await conn.rollback();
                msg.ErrNo = 9;
                msg.ErrCon = `error:${qry}`;
            }
        }));
        if (!needBreak) { await conn.commit(); }
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = `Term not found, ID= ${tid}`;
    }
    return msg;
}
/*
async function doSql(sql: string, conn: mariadb.PoolConnection): Promise<boolean> {
    return new Promise((resolve, reject) => {
        conn.query(sql).then((res) => {
            // if (res) { ans = true; }
            console.log("doSql:", sql, res);
            resolve(true);
        }).catch((err) => {
            console.log("doSql error:", sql, err);
            reject(err);
        });
    });
}
*/
/*
async function doSql(sql: string, conn: mariadb.PoolConnection) {
    let ans: boolean = false;
    let rows;
    await conn.query(sql).then((res) => {
        rows = res;
        if (res) { ans = true; }
    }).catch((err) => {
        console.log("doSql error:", sql, err);
    });
    console.log("doSql:", sql, rows);
    return ans;
}
*/
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
