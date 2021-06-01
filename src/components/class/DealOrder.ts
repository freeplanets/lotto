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
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask: AskTable = this.ask as AskTable;
    if (ask.Amount === 0 && ask.BuyType === 0 ) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "Amount=0";
      return msg;
    }
    await this.conn.beginTransaction();
    this.tb.ExtFilter = " ProcStatus < 2 ";
    const update = await this.tb.Update(ask);
    if ( update.ErrNo !== ErrCode.PASS ) {
      await this.conn.rollback();
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      return msg;
    }
    // console.log("DealOrder doit after update:", msg, ask.ProcStatus);
    ask.Fee = ask.AskFee * ask.Amount;
    if (ask.BuyType === 1) {
      const Credit = ask.Amount - ask.Fee;
      const modifycredit = await this.creditA.ModifyCredit(Credit);
      if ( modifycredit.ErrNo !== ErrCode.PASS ) {
        await this.conn.rollback();
        msg.ErrNo = ErrCode.NO_CREDIT;
        return msg;
      }
      console.log("ModifyCredit", modifycredit);
    }

    const lgmsg = await this.AddToLedger(ask);
    if (lgmsg.ErrNo !== ErrCode.PASS) {
      await this.conn.rollback();
      return msg;
    }
    console.log("AddToLedger", JSON.stringify(lgmsg));

    let NewAsk: AskTable|undefined;
    if (ask.Lever && !ask.SetID && !ask.USetID ) {
      const csa = await this.CreateSettleAsk(ask);
      if (csa.ErrNo !== ErrCode.PASS) {
        await this.conn.rollback();
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        return msg;
      }
      if (csa.NewAsk) { NewAsk = csa.NewAsk as AskTable; }
    }
    // console.log("DealOrder doit before commit", msg);
    await this.conn.commit();
    const askOne = await this.tb.getOne(ask.id);
    const tmp: AskTable[] = [];
    if (askOne) { tmp.push(askOne as AskTable); }
    if (NewAsk) {
      tmp.push(NewAsk);
    }
    if ( tmp.length > 0 ) {
      if (tmp.length === 1 ) {
        msg.Ask = tmp[0];
      } else {
        msg.Asks = tmp;
      }
    }
    if ( lgmsg.LedgerTotal ) { msg.LedgerTotal = lgmsg.LedgerTotal; }
    msg.Balance = await this.getBalance();
    // console.log("DealOrder doit done:", msg);
    return msg;
  }
  private async AddToLedger(ask: AskTable) {
    const ledgerF: LedgerFactor = new LedgerFactor(ask, this.conn);
    const msg = await ledgerF.AddToLedger();
    if ( msg.ErrNo === ErrCode.PASS ) {
      const ldMsg = await ledgerF.GetLedger();
      // console.log("DealOrder AddToLedger:", ldMsg);
      if ( ldMsg.LedgerTotal) { msg.LedgerTotal = ldMsg.LedgerTotal; }
    }
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
