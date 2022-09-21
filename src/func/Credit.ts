import { PoolConnection } from "mariadb";
import StrFunc from "../components/class/Functions/MyStr";
import { IDbAns } from "../DataSchema/if";
import { doQuery } from "./db";

interface CreditMemo {
    Type?: number;
    Amount?: number;
}

export async function ModifyCredit(uid: number, Account: string,
                                   AgentId: number, money: number, idenkey: string, conn: PoolConnection, justquery?: boolean) {
    let  balance: number = await getUserCredit(uid, conn);
    if (justquery) {
        return { balance, orderId: 0};
    }
    balance = balance + money;
    if (balance < 0) {
        // console.log("ModifyCredit chk balanace:", balance, "Money:", money);
        return false;
    }
    const sql = `insert into UserCredit(uid,Account,AgentID,idenkey,DepWD,Balance,memo) values(?,?,?,?,?,?,?)`;
    const memo: CreditMemo = {};
    if (money > 0) {
        memo.Type = 0;
        memo.Amount = money;
    } else {
        memo.Type = 1;
        memo.Amount = money;
    }
    const param = [uid, Account, AgentId, idenkey, money, balance, StrFunc.stringify(memo)];
    // const dbans: IDbAns = await conn.query(sql, param);
    const dbans: IDbAns = await doQuery(sql, conn, param);
    // console.log("ModifyCredit:", sql, dbans);
    if (dbans.affectedRows > 0) {
    // return true;
        const bans =  await ModifyUserCredit(uid, balance, conn);
        if (bans) {
            return { balance, orderId: dbans.insertId};
        }
    }
    return false;
}
async function ModifyUserCredit(uid: number, balance: number, conn: PoolConnection) {
    const sql = `update Member set Balance=${balance} where id=${uid}`;
    const ans: IDbAns = await doQuery(sql, conn);
    if (ans.affectedRows > 0) { return true; }
    return false;
}

export function getUserCredit(uid: number, conn: PoolConnection) {
    return new Promise<number>(async (resolve) => {
        const sql = `select sum(DepWD) balance from UserCredit where uid=?`;
        doQuery(sql, conn, [uid]).then((res) => {
            let balance: number = 0;
            if (res[0]) {
                balance = balance + res[0].balance;
            }
            resolve(balance);
        }).catch((err) => {
            console.log("getUserCredit error", err);
            resolve(0);
        });
    });
}
