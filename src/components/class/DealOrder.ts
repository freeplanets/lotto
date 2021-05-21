import { PoolConnection } from "mariadb";
import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, HasUID, IDbAns, IMsg } from "../../DataSchema/if";
import AskTableAccess from "./AskTableAccess";
import LedgerFactor from "../LedgerFactor";

export default class DealOrder extends AskTableAccess<HasUID> {
  constructor(ask: HasUID, conn: PoolConnection, tableName: string) {
    super(ask, conn, tableName);
  }
  public async doit(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask: AskTable = this.ask as AskTable;
    if (ask.Amount === 0 && ask.BuyType ===0 ) {
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
    if (ask.Lever && !ask.SetID && !ask.USetID ) {
      msg = await this.CreateSettleAsk(ask);
      if (msg.ErrNo !== ErrCode.PASS) {
        await this.conn.rollback();
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        return msg;
      }
    }
    msg = await this.AddToLedger(ask);
    if(msg.ErrNo !== ErrCode.PASS) {
      await this.conn.rollback();
      return msg;
    }
    await this.conn.commit();
    return msg;
  }
  private async AddToLedger(ask:AskTable) {
    const ledgerF:LedgerFactor = new LedgerFactor(ask,this.conn);
     return await ledgerF.AddToLedger();
  }
  private async CreateSettleAsk(ask: AskTable): Promise<IMsg> {
    ask.AskPrice = 0,
    ask.Price = 0,
    ask.BuyType = 1;
    ask.SetID = ask.id;
    const msg = await this.tb.Insert(ask);
    const ans = msg as IDbAns;
    if (ans.insertId) {
      const tmp = await this.tb.getOne(ans.insertId);
      if (tmp) { msg.data = tmp; }
    }
    return msg;
  }
}
