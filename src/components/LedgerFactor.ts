import { PoolConnection } from "mariadb";
import { ErrCode } from "../DataSchema/ENum";
import { AskTable, IHasID, IMsg } from "../DataSchema/if";
import ALedger from "./class/ALedger";
import LedgerAccess from "./class/LedgerAccess";
import LedgerLeverAccess from "./class/LedgerLeverAccess";

export default class LedgerFactor {
  private ledger: ALedger<IHasID>;
  constructor(private ask: AskTable, private conn: PoolConnection) {
    switch (ask.Lever) {
      case 0:
          this.ledger = new LedgerAccess(conn, "Ledger");
          break;
      default:
          this.ledger = new LedgerLeverAccess(conn, "LedgerLever");
    }
  }
  public async AddToLedger(): Promise<IMsg> {
    return this.ledger.add(this.ask);
  }
  public async GetLedger(): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    if ( this.ask.Lever === 0) {
      const ans = await this.ledger.get(this.ask.UserID);
      if ( ans.ErrNo === ErrCode.PASS) {
        msg.LedgerTotal = ans.data;
      } else {
        msg = ans;
      }
    } else {
      msg.ErrNo = ErrCode.NO_DATA_FOUND;
    }
    return msg;
  }
}
