import ErrCode from "../../DataSchema/ErrCode";
import { IHasID, IMsg } from "../../DataSchema/if";
import AskTableAccess from "./AskTableAccess";

export default class DeleteOrder extends AskTableAccess<IHasID> {
  public async doit(): Promise<IMsg> {
    this.tb.ExtFilter = " ProcStatus = 0 ";
    const msg = await this.tb.Update(this.ask);
    if (msg.ErrNo === ErrCode.PASS) {
      const ans = await this.tb.getOne(this.ask.id);
      if (ans) { msg.data = ans; }
    }
    return msg;
  }
}
