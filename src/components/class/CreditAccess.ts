import { PoolConnection } from "mariadb";
import ErrCode from "../../DataSchema/ErrCode";
import { IDbAns, IMsg } from "../../DataSchema/if";

export default class CreditAccess {
  constructor(private UserID: number, private conn: PoolConnection) {}
  public getUserCredit(): Promise<IMsg> {
    return new Promise<IMsg>(async (resolve) => {
        const msg: IMsg = { ErrNo: ErrCode.PASS };
        const sql = `select sum(DepWD) balance from UserCredit where uid=?`;
        this.conn.query(sql, [this.UserID]).then((res) => {
            let balance: number = 0;
            if (res[0]) {
                balance = balance + res[0].balance;
            }
            msg.balance = balance;
            resolve(msg);
        }).catch((err) => {
            console.log("getUserCredit error", err);
            // reject(err);
            msg.ErrNo = ErrCode.DB_QUERY_ERROR;
            msg.ErrCon = "getUserCredit error";
            msg.error = err;
            resolve(msg);
        });
    });
  }
  public ModifyUserCredit(balance: number) {
    return new Promise<IMsg>(async (resolve) => {
      const msg: IMsg = { ErrNo: ErrCode.PASS };
      const sql = `update Member set Balance=${balance} where id=${this.UserID}`;
      this.conn.query(sql).then((res: IDbAns) => {
        if (res.affectedRows > 0) {
          resolve(msg);
        }
        msg.ErrNo = ErrCode.NO_CREDIT;
        resolve(msg);
      }).catch((error) => {
        console.log("ModifyUserCredit", error);
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        msg.ErrCon = "ModifyUserCredit";
        msg.error = error;
        resolve(msg);
      });
    });
  }
  public async ModifyCredit(money: number, justquery?: boolean): Promise<IMsg> {
    const  msg = await this.getUserCredit();
    if (justquery) {
      msg.orderId = 0;
      return msg;
    }
    if (msg.ErrNo === ErrCode.PASS) {
      let balance = msg.balance as number;
      balance = balance + money;
      if (balance < 0) {
        // console.log("ModifyCredit chk balanace:", balance, "Money:", money);
        msg.ErrNo = ErrCode.NO_CREDIT;
        msg.ErrCon = "Insufficient credit.";
        return msg;
      }
      const idenkey = `${new Date().getTime()}ts${this.UserID}`;
      const sql = `insert into UserCredit(uid,idenkey,DepWD,Balance) values(?,?,?,?)`;
      const param = [this.UserID, idenkey, money, balance];
      const dbans: IDbAns = await this.conn.query(sql, param);
      // console.log("ModifyCredit:", sql, dbans);
      if (dbans.affectedRows > 0) {
        // return true;
        const bans =  await this.ModifyUserCredit(balance);
        if (bans.ErrNo === ErrCode.PASS) {
          msg.balance = balance;
          msg.orderId = dbans.insertId;
          return msg;
          // return { balance, orderId: dbans.insertId};
        }
      }
    }
    return msg;
  }
}
