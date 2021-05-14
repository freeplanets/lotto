import { PoolConnection } from "mariadb";
import JTable from "../../class/JTable";
import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, IHasID, IMsg } from "../../DataSchema/if";
import AskTableAccess from "./AskTableAccess";
import CreditAccess from "./CreditAccess";

export default class DealOrder extends AskTableAccess<IHasID> {
  private createA: CreditAccess;
  private UserID: number;
  constructor(ask: IHasID, conn: PoolConnection, tableName: string) {
    super(ask, conn, tableName);
    this.UserID = ask.UserID;
    this.createA = new CreditAccess(this.UserID, conn);
  }
  public async doit(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask: AskTable = this.ask as AskTable;
    if (ask.Amount === 0 ) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "Amount=0";
      return msg;
    }
    ask.Fee = ask.AskFee * ask.Amount;
    if (ask.AskType === 0) {
      msg = await this.createA.getUserCredit();
      if ( msg.ErrNo !== ErrCode.PASS ) { return msg; }
      const credit = msg.balance as number;
      if (credit < (ask.Amount + ask.Fee) ) {
        msg.ErrNo = ErrCode.NO_CREDIT;
        msg.ErrCon = "No credit found";
        return msg;
      }
    }
    await this.conn.beginTransaction();
    this.tb.ExtFilter = " ProcStatus = 0 ";
    msg = await this.tb.Update(ask);
    if ( msg.ErrNo !== ErrCode.PASS ) {
      await this.conn.rollback();
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      return msg;
    }
    const add = ask.AskType === 0 ? -1 : 1;
    if (add > 0) {
      ask.Credit = ask.Amount - ask.Fee;
    } else {
      ask.Credit = ask.Amount + ask.Fee;
    }
    msg = await this.createA.ModifyCredit( ask.Credit * add);
    if (msg.ErrNo !== ErrCode.PASS ) {
      await this.conn.rollback();
      msg.ErrNo = ErrCode.NO_CREDIT;
      return msg;
    }
    await this.conn.commit();
    return msg;
  }
}
