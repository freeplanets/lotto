import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, HasUID, IMsg } from "../../DataSchema/if";
import AskTableAccess from "./AskTableAccess";

export default class DeleteOrder extends AskTableAccess<HasUID> {
  public async doit(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ans = await this.tb.getOne(this.ask.id);
    if (ans) {
      this.conn.beginTransaction();
      const ask = ans as AskTable;
      const credit = ask.Amount + ( ask.Fee ? ask.Fee : 0 );
      msg = await this.creditA.ModifyCredit(credit);
      if ( msg.ErrNo !== ErrCode.PASS ) {
        await this.conn.rollback();
        return msg;
      }
      this.tb.ExtFilter = " ProcStatus < 2 ";
      msg = await this.tb.Update(this.ask);
      if (msg.ErrNo === ErrCode.PASS) {
        const ansAsk = await this.tb.getOne(this.ask.id);
        if (ansAsk) { msg.Ask = ansAsk as AskTable; }
      } else {
        await this.conn.rollback();
        return msg;
      }
      await this.conn.commit();
    } else {
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
    }
    msg.Balance = await this.getBalance();
    return msg;
  }
}
