import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, HasUID, IMsg } from "../../DataSchema/if";
import AskTableAccess from "./AskTableAccess";

export default class NewOrder extends AskTableAccess<HasUID> {
  public async doit(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask: AskTable = this.ask as AskTable;
    await this.conn.beginTransaction();
    if(ask.BuyType===0){
      ask.Fee = ask.Amount * ask.AskFee;
      const credit = ask.Amount + ask.Fee;
      msg = await this.creditA.ModifyCredit(credit * -1);
      if (msg.ErrNo !== ErrCode.PASS) {
        await this.conn.rollback();
        return msg;
      }
    }
    let AskID = 0;
    msg = await this.tb.Insert(ask);
    if (msg.ErrNo !== 0) {
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      await this.conn.rollback();
      return msg;
    }
    AskID = msg.insertId as number;
    this.conn.commit();
    msg.data = await this.tb.getOne(AskID);
    return msg;
  }
}
