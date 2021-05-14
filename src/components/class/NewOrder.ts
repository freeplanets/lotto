import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, IHasID, IMsg } from "../../DataSchema/if";
import AskTableAccess from "./AskTableAccess";

export default class NewOrder extends AskTableAccess<IHasID> {
  public async doit(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    const ask: AskTable = this.ask as AskTable;
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
