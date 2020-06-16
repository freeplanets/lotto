import mariadb from "mariadb";
import {IParamLog, ISqlProc} from "../DataSchema/if";
import {saveParamLog} from "../router/AdminApi";
import {CMarkSixMum,IMSResult} from "./Settlement/CMarkSixMum";
import {doBT,getEx} from "./Settlement/MarkSixSetl";
//const SettleMethods=MarkSixST['MarkSix'];

// 重結 isSettled =3 轉成 status = 4 提供平台視別
export async function SaveNums(tid: number, GameID: number, num: string, conn: mariadb.PoolConnection, isSettled?: number, PLog?: IParamLog[]) {
    const imsr: IMSResult = new CMarkSixMum(num).Nums;
    let ans;
    let sql: string = "";
    // let sqls: string[];
    let sqls: ISqlProc = {
        pre: [],
        common: []
    };
    const SettleStatus: number = isSettled ? 3 : 1;
    await conn.beginTransaction();
    sql = `update BetTableEx set Opened=0 where tid=${tid} and GameID=${GameID}`;
    await conn.query(sql).then(async (res) => {
        console.log("BetTableEx set open zero:", sql, res);
        ans = true;
        if (PLog) {
            console.log("SaveNums", PLog);
            await saveParamLog(PLog, conn);
        }
    }).catch(async (err) => {
        console.log("WinLose=Amt*-1 err 1", err);
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
        return imsr;
        //return ans;
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
        sqls = doBT(tid, GameID, imsr, rtn, conn);
        if (sqls.pre.length > 0) {
            await Promise.all(sqls.pre.map(async (itm) => {
                ans = await doSql(itm, conn);
                if (!ans) {
                    console.log("err rollback 0");
                    await conn.rollback();
                    return imsr;
                }
            }));
            sql = `select * from BetTableEx
                where tid=${tid} and GameID=${GameID} `;
            let strs: string[] = [];
            await conn.query(sql).then((res) => {
                strs = getEx(res);
            }).catch(async (err) => {
                console.log("Ex proc error", err);
                await conn.rollback();
                return imsr;
            });
            if (strs.length > 0) {
                await Promise.all(strs.map(async (str) => {
                    ans = await doSql(str, conn);
                    if (!ans) {
                        console.log("err rollback ex modify:");
                        await conn.rollback();
                        return imsr;
                    }
                }));
            }
        }
        let needBreak: boolean = false;
        await Promise.all(sqls.common.map(async (itm) => {
            if (needBreak) { return; }
            ans = await doSql(itm, conn);
            if (!ans) {
                console.log("err rollback 1");
                needBreak = true;
                await conn.rollback();
                return imsr;
            }
        }));
    }
    console.log("batch:", ans);
    if (ans) {
        sql = `update Terms set Result='${imsr.RegularNums.join(",")}',SpNo='${imsr.SPNo}',ResultFmt='${JSON.stringify(imsr)}',isSettled=${SettleStatus} where id=${tid}`;
        ans = await doSql(sql, conn);
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
    }
    // console.log("SQL:", ans);
    return imsr;
}


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
