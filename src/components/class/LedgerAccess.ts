import { PoolConnection } from 'mariadb';
import { Query } from '../../func/db';
import { AskTable, Ledger, IMsg } from '../../DataSchema/if';
import ErrCode from '../../DataSchema/ErrCode';
import JTable from '../../class/JTable';
import ALedger from './ALedger';

export default class LedgerAccess extends ALedger {
  async add(ask:AskTable, conn:PoolConnection):Promise<IMsg>{
    const key = ask.BuyType === 0 ? 1 : -1;
    const ledger:Ledger = {
      id:0,
      UserID: ask.UserID,
      ItemID: ask.ItemID,
      AskID: ask.id,
      Qty: ask.Qty * key,
    }
    let jt = new JTable<Ledger>(conn,'Ledger');
    let msg:IMsg = await jt.Insert(ledger);
    if (msg.ErrNo === ErrCode.PASS ) {
      const sql=`insert into LedgerTotal(UserID,ItemID,Qty) 
          values(${ledger.UserID},${ledger.ItemID},${ledger.Qty}) 
          on duplicate key update Qty = Qty + values(Qty)`;
      return  await Query(sql,conn);
    } else {
      return msg;
    }
  }
}