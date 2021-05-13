import JTable from '../../class/JTable';
import AskTableAccess from './AskTableAccess';
import { AskTable, IMsg } from '../../DataSchema/if';
import CreditAccess from './CreditAccess';
import { PoolConnection } from 'mariadb';
import ErrCode from '../../DataSchema/ErrCode';

export default class Deal extends AskTableAccess<AskTable> {
  private createA:CreditAccess;
  private UserID:number;
  constructor(ask:AskTable, conn:PoolConnection, tableName:string){
    super(ask, conn, tableName);
    this.UserID = ask.UserID;
    this.createA = new CreditAccess(this.UserID, conn);
  }
  async doit():Promise<IMsg>{
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask = this.ask;
    if(ask.Amount === 0 ) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "Amount=0";
      return msg;
    }
    ask.Fee = ask.AskFee * ask.Amount;
    if(ask.AskType === 0) {
      const msg = await this.createA.getUserCredit();
      if( msg.ErrNo !== 0 ) return msg;
      const credit = msg.balance as number;
      if (credit < (ask.Amount + ask.Fee) ) {
        msg.ErrNo = ErrCode.NO_CREDIT;
        msg.ErrCon = "No credit found";
        return msg;
      }
    } 
    await this.conn.beginTransaction();
    this.tb.ExtFilter = ' ProcStatus = 0 ';
    msg = await this.tb.Update(ask);
    if ( msg.ErrNo !== ErrCode.PASS ) {
      await this.conn.rollback();
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      return msg;
    }
    const add = ask.AskType === 0 ? -1 : 1;
    if(add > 0){
      ask.Credit = ask.Amount - ask.Fee;
    } else {
      ask.Credit = ask.Amount + ask.Fee; 
    }
    msg = await this.createA.ModifyCredit( ask.Credit * add);
    if (msg.ErrNo !== ErrCode.PASS ) {
      await this.conn.rollback();
      msg.ErrNo = ErrCode.NO_CREDIT;
      return msg;
    }
    await this.conn.commit();
    return msg;    
  }
}