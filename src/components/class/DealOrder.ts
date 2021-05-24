import { PoolConnection } from "mariadb";
import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, HasUID, IDbAns, IMsg } from "../../DataSchema/if";
import LedgerFactor from "../LedgerFactor";
import AskTableAccess from "./AskTableAccess";

export default class DealOrder extends AskTableAccess<HasUID> {
  constructor(ask: HasUID, conn: PoolConnection, tableName: string) {
    super(ask, conn, tableName);
  }
  public async doit(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask: AskTable = this.ask as AskTable;
    if (ask.Amount === 0 && ask.BuyType === 0 ) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "Amount=0";
      return msg;
    }
    await this.conn.beginTransaction();
    this.tb.ExtFilter = " ProcStatus < 2 ";
    msg = await this.tb.Update(ask);
    if ( msg.ErrNo !== ErrCode.PASS ) {
      await this.conn.rollback();
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      return msg;
    }
    // console.log("DealOrder doit after update:", msg, ask.ProcStatus);
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

    msg = await this.AddToLedger(ask);
    if (msg.ErrNo !== ErrCode.PASS) {
      await this.conn.rollback();
      return msg;
    }

    if (ask.Lever && !ask.SetID && !ask.USetID ) {
      msg = await this.CreateSettleAsk(ask);
      if (msg.ErrNo !== ErrCode.PASS) {
        await this.conn.rollback();
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        return msg;
      }
    }
    // console.log("DealOrder doit before commit", msg);
    await this.conn.commit();
    const askOne = await this.tb.getOne(ask.id);
    if (msg.NewAsk) {
      const tmp: AskTable[] = [];
      const newask = msg.NewAsk as AskTable;
      tmp.push(newask);
      if (askOne) { tmp.push(askOne as AskTable); }
      msg.data = tmp;
    }
    return msg;
  }
  private async AddToLedger(ask: AskTable) {
    const ledgerF: LedgerFactor = new LedgerFactor(ask, this.conn);
    const msg = await ledgerF.AddToLedger();
    // console.log("DealOrder AddToLedger:", msg);
    return msg;
  }
  private async CreateSettleAsk(ask: AskTable): Promise<IMsg> {
    ask.AskPrice = ask.Price,
    ask.LeverCredit = ask.Amount,
    ask.Price = 0,
    ask.Amount = 0,
    ask.Fee = 0,
    ask.AskFee = 0,
    ask.BuyType = 1;
    ask.SetID = ask.id;
    ask.ProcStatus = 1;
    const msg = await this.tb.Insert(ask);
    console.log("DealOrder CreateSettleAsk:", msg);
    const ans = msg as IDbAns;
    if (ans.insertId) {
      const tmp = await this.tb.getOne(ans.insertId);
      console.log("CreateSettleAsk after getOne:", tmp);
      if (tmp) { msg.NewAsk = tmp; }
    }
    return msg;
  }
}
