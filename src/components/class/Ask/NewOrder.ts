import { CreditType, ErrCode, MemoType } from "../../../DataSchema/ENum";
import { AskTable, CreditMemo, HasUID, IMsg, MemoCryptoCur } from "../../../DataSchema/if";
import AskTableAccess from "./AskTableAccess";

export default class NewOrder extends AskTableAccess<HasUID> {
  public async doit(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask: AskTable = this.ask as AskTable;
    await this.conn.beginTransaction();
    // console.log("NewOrder doit:", JSON.stringify(ask));
    if (ask.BuyType === 0) {
      ask.Fee = ask.Amount * ask.AskFee;
      const credit = ask.Amount + ask.Fee;
      const memoMsg: MemoCryptoCur = {
        Type: MemoType.NEW,
        // AskID: ask.id,
        ItemID: ask.ItemID,
        ItemType: ask.ItemType,
        Amount: ask.Amount,
        Fee: ask.Fee,
        Qty: ask.Qty,
      };
      const memo: CreditMemo = {
        Type: CreditType.CRYPTOCUR,
        Message: memoMsg,
      };
      msg = await this.creditA.ModifyCredit(credit * -1, memo);
      if (msg.ErrNo !== ErrCode.PASS) {
        await this.conn.rollback();
        return msg;
      }
    }
    let AskID = 0;
    if (ask.id) {
      console.log("NewOrder doit update");
      msg = await this.tb.Update(ask);
      AskID = ask.id;
    } else {
      msg = await this.tb.Insert(ask);
      AskID = msg.insertId as number;
    }
    if (msg.ErrNo !== 0) {
      console.log("NewOrder doit error:", msg);
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      await this.conn.rollback();
      return msg;
    }
    this.conn.commit();
    const hasOne = await this.tb.getOne(AskID);
    if (hasOne) { msg.Ask = hasOne as AskTable; }
    msg.Balance = await this.getBalance();
    // console.log("NewOrder doit before return:", JSON.stringify(msg));
    return msg;
  }
}
