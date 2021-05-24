import { PoolConnection } from "mariadb";
import { AskTable, IMsg } from "../DataSchema/if";
import ALedger from "./class/ALedger";
import LedgerAccess from "./class/LedgerAccess";
import LedgerLeverAccess from "./class/LedgerLeverAccess";

export default class LedgerFactor {
  private ledger: ALedger;
  constructor(private ask: AskTable, private conn: PoolConnection) {
    switch (ask.Lever) {
      case 0:
          this.ledger = new LedgerAccess();
          break;
      default:
          this.ledger = new LedgerLeverAccess();
    }
  }
  public async AddToLedger(): Promise<IMsg> {
    return await this.ledger.add(this.ask, this.conn);
  }
}
