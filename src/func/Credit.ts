import { Connection } from "mariadb";
import { IDbAns } from "../DataSchema/if";

export async function ModifyCredit(uid: number, Account: string,
                                   AgentId: string, money: number, idenkey: string, conn: Connection) {
    let  balance: number = await getUserCredit(uid, conn);
    balance = balance + money;
    if (balance < 0) { return false; }
    const sql = `insert into usercredit(uid,Account,AgentID,idenkey,DepWD,Balance) values(?,?,?,?,?,?)`;
    const param = [uid, Account, AgentId, idenkey, money, balance];
    const dbans: IDbAns = await conn.query(sql, param);
    if (dbans.affectedRows > 0) {
    // return true;
        const bans =  await ModifyUserCredit(uid, balance, conn);
        if (bans) {
            return { balance, orderId: dbans.insertId};
        }
    }
    return false;
}
async function ModifyUserCredit(uid: number, balance: number, conn: Connection) {
    const sql = `update user set Balance=${balance} where id=${uid}`;
    const ans: IDbAns = await conn.query(sql);
    if (ans.affectedRows > 0) { return true; }
    return false;
}

export function getUserCredit(uid: number, conn: Connection) {
    return new Promise<number>(async (resolve) => {
        const sql = `select balance from usercredit where uid=? order by id desc limit 0,1`;
        const ans = await conn.query(sql, [uid]);
        let balance: number = 0;
        if (ans[0]) {
            balance = balance + ans[0].balance;
        }
        resolve(balance);
    });
}
