import { PoolConnection } from "mariadb";
import { CreditType, ErrCode, MemoType } from "../../../DataSchema/ENum";
import { AskTable, CreditMemo, HasUID, IDbAns, IMsg, MemoCryptoCur } from "../../../DataSchema/if";
import LedgerFactor from "../../LedgerFactor";
import DataAccess from "../DataBase/DataAccess";
import AskTableAccess from "./AskTableAccess";

export default class DealOrder extends AskTableAccess<HasUID> {
  private DecimalPlaces = 2;
  private SettleServiceID = 0;
  constructor(ask: HasUID, conn: PoolConnection, tableName: string, SettleServiceID?: number) {
    super(ask, conn, tableName);
    if (SettleServiceID) { this.SettleServiceID = SettleServiceID; }
  }
  public async doit(): Promise<IMsg> {
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask = this.ask as AskTable;
    msg.UserID = ask.UserID;
    if (ask.Amount === 0 && ask.BuyType === 0 ) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "Amount=0";
      return msg;
    }
    await this.conn.beginTransaction();
    this.tb.ExtFilter = " ProcStatus < 2 ";
    if (ask.CreateTime) { delete ask.CreateTime; }
    if (ask.ModifyTime) { delete ask.ModifyTime; }
    if (ask.AskFee) { ask.Fee = ask.AskFee * ask.Amount; }
    if (ask.TermFee) { ask.TFee =  parseFloat((ask.TermFee * ask.Amount).toFixed(this.DecimalPlaces)); }
    // console.log("DealOrder before", JSON.stringify(ask));
    let update: IMsg = {};
    if (this.SettleServiceID) {
      const da = new DataAccess(this.conn);
      update = await da.ServiceSettleMark(ask.id, this.SettleServiceID);
      if ( update.ErrNo !== ErrCode.PASS ) {
        await this.conn.rollback();
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        msg.Error = update.Error;
        return msg;
      }
    }
    update = await this.tb.Update(ask);
    if ( update.ErrNo !== ErrCode.PASS ) {
      await this.conn.rollback();
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      msg.Error = update.Error;
      return msg;
    }
    // console.log("DealOrder doit after update:", msg, ask.ProcStatus);
    if (ask.BuyType === 1) {
      const Fee = ask.Fee ? ask.Fee : 0;
      const TFee = ask.TFee ? ask.TFee : 0;
      const Credit = ask.Amount - Fee - TFee;
      const memoMsg: MemoCryptoCur = {
        Type: ask.BuyType ? MemoType.SETTLE : MemoType.NEW,
        AskID: ask.id,
        ItemID: ask.ItemID,
        ItemType: ask.ItemType,
        Amount: ask.Amount,
        Fee: ask.Fee,
        TFee: ask.TFee,
        Qty: ask.Qty
      };
      const memo: CreditMemo = {
        Type: CreditType.CRYPTOCUR,
        Message: memoMsg,
      };
      const modifycredit = await this.creditA.ModifyCredit(Credit, memo);
      if ( modifycredit.ErrNo !== ErrCode.PASS ) {
        await this.conn.rollback();
        msg.ErrNo = ErrCode.NO_CREDIT;
        return msg;
      }
      // console.log("ModifyCredit", modifycredit);
    }

    const lgmsg = await this.AddToLedger(ask);
    if (lgmsg.ErrNo !== ErrCode.PASS) {
      await this.conn.rollback();
      return msg;
    }
    // console.log("AddToLedger", JSON.stringify(lgmsg));

    let NewAsk: AskTable|undefined;
    if (ask.Lever) {
      let tmsg: IMsg = { ErrNo: ErrCode.PASS };
      if (ask.BuyType) {
        const bAskID = ask.SetID ? ask.SetID : ask.USetID;
        if (bAskID) {
          tmsg = await this.ItemTotal.reduceDeal(ask.ItemID, bAskID);
        }
      } else {
        tmsg = await this.ItemTotal.addDeal(ask.ItemID, ask.Amount * ask.Lever * ask.ItemType);
      }
      if (tmsg.ErrNo !== ErrCode.PASS) {
        msg.ErrNo = tmsg.ErrNo;
      } else if (!ask.SetID && !ask.USetID ) {
        const csa = await this.CreateSettleAsk(ask);
        if (csa.ErrNo !== ErrCode.PASS) {
          await this.conn.rollback();
          msg.ErrNo = ErrCode.DB_QUERY_ERROR;
          msg.Error = csa.Error;
          return msg;
        }
        if (csa.NewAsk) { NewAsk = csa.NewAsk as AskTable; }
      }
    }
    // console.log("DealOrder doit before commit", msg);
    await this.conn.commit();
    const askOne = await this.tb.getOne(ask.id);
    // console.log("DealOrder askOne", JSON.stringify(askOne));
    const tmp: AskTable[] = [];
    if (askOne) { tmp.push(askOne as AskTable); }
    if (NewAsk) {
      console.log("DealOrder has NewAsk", JSON.stringify(NewAsk));
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
    // console.log("DealOrder doit done:", JSON.stringify(msg));
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
    ask.GainPrice = this.GainPrice(ask);
    ask.LosePrice = this.LosePrice(ask);
    ask.ProcStatus = 1;
    const msg = await this.tb.Insert(ask);
    // console.log("DealOrder CreateSettleAsk:", msg);
    const ans = msg as IDbAns;
    if (ans.insertId) {
      const tmp = await this.tb.getOne(ans.insertId);
      // console.log("CreateSettleAsk after getOne:", tmp);
      if (tmp) { msg.NewAsk = tmp; }
    }
    return msg;
  }
  private GainPrice(ask: AskTable): number {
    const StopGain = ask.StopGain ? ask.StopGain : 0;
    const Lever = ask.Lever ? ask.Lever : 1;
    const LeverCredit = ask.LeverCredit ? ask.LeverCredit : 0;
    const addPrice = ((StopGain * LeverCredit * ask.ItemType) / Lever) / ask.Qty;
    const price = ask.AskPrice ? ask.AskPrice : 0;
    // console.log("GainPrice", addPrice , StopGain, LeverCredit, ask.ItemType, Lever, ask.Qty);
    return addPrice + price;
  }
  private LosePrice(ask: AskTable): number {
    const StopLose = ask.StopLose ? ask.StopLose : 0;
    const Lever = ask.Lever ? ask.Lever : 1;
    const LeverCredit = ask.LeverCredit ? ask.LeverCredit : 0;
    const addPrice = ((((1 - StopLose) * LeverCredit - LeverCredit) * ask.ItemType) / Lever) / ask.Qty;
    const price = ask.AskPrice ? ask.AskPrice : 0;
    // console.log("LosePrice", addPrice , StopLose, LeverCredit, ask.ItemType, Lever, ask.Qty);
    return addPrice + price;
  }
}
