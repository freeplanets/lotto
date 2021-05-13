import AskTableAccess from './AskTableAccess';
import { IMsg, AskTable } from '../../DataSchema/if';
import ErrCode from '../../DataSchema/ErrCode';

export default class NewOrder extends AskTableAccess<AskTable>{
  async doit():Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask = this.ask;
    let AskID = 0;
    msg = await this.tb.Insert(ask);
    if (msg.ErrNo !== 0) {
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      return msg;
    }
    AskID = msg.insertId as number;  
    msg.data = await this.tb.getOne(AskID);
    return msg;    
  }
}