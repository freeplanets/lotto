import { PoolConnection } from "mariadb";
import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, IMsg, HasUID } from "../../DataSchema/if";
import AskTableAccess from "./AskTableAccess";

export default class DealOrder extends AskTableAccess<HasUID> {
  constructor(ask: HasUID, conn: PoolConnection, tableName: string) {
    super(ask, conn, tableName);
  }
  public async doit(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask: AskTable = this.ask as AskTable;
    if (ask.Amount === 0 ) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "Amount=0";
      return msg;
    }
    await this.conn.beginTransaction();
    this.tb.ExtFilter = " ProcStatus = 0 ";
    msg = await this.tb.Update(ask);
    if ( msg.ErrNo !== ErrCode.PASS ) {
      await this.conn.rollback();
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      return msg;
    }
    ask.Fee = ask.AskFee * ask.Amount;
    if (ask.BuyType === 1) {
      const Credit = ask.Amount - ask.Fee;
      msg = await this.creditA.ModifyCredit(Credit);
      if (msg.ErrNo !== ErrCode.PASS ) {
        await this.conn.rollback();
        msg.ErrNo = ErrCode.NO_CREDIT;
        return msg;
      }
    }
    await this.conn.commit();
    return msg;
  }
}
