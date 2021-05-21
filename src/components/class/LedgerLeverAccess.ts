import { PoolConnection } from 'mariadb';
import { LedgerLever, AskTable, IMsg } from '../../DataSchema/if';
import ErrCode from '../../DataSchema/ErrCode';
import JTable from '../../class/JTable';
import ALedger from './ALedger';

export default class LedgerLeverAccess extends ALedger {
  async add(ask:AskTable, conn:PoolConnection):Promise<IMsg> {
    let msg:IMsg = { ErrNo: ErrCode.PASS };
    const jt = new JTable<LedgerLever>(conn,'LedgerLever');
    if(ask.USetID || ask.SetID) {

    } else {
      return await this.CreateNew(ask, jt);
    }
    return msg
  }
  private async SettleOne(ask:AskTable, jt:JTable<LedgerLever>):Promise<IMsg>{
    let msg:IMsg = { ErrNo: ErrCode.PASS };
    let SearchID = ask.SetID ? ask.SetID : 0;
    if(ask.USetID) SearchID = ask.USetID;
    const ldg:LedgerLever|false = await jt.List({BuyID: SearchID});
    if (ldg) {
      ldg.SellID = ask.id;
      ldg.SellPrice = ask.Price;
      ldg.GainLose = (ldg.BuyPrice - ldg.SellPrice)* ldg.ItemType * ldg.Lever;
      ldg.SellTime = ask.DealTime;
      return await jt.Update(ldg);
    } else {
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      msg.ErrCon = "LedgerLever record not found!";
      return msg;
    }

  }
  private async CreateNew(ask:AskTable, jt:JTable<LedgerLever>):Promise<IMsg> {
    const ledger:LedgerLever = {
      id: 0,
      UserID: ask.UserID,
      ItemID: ask.ItemID,
      ItemType: ask.ItemType,
      BuyID: ask.id,
      BuyPrice: ask.Price,
      Qty: ask.Qty,
      Lever: ask.Lever as number,
      BuyTime: ask.DealTime as number,
    }
    return await jt.Insert(ledger);
  }
}