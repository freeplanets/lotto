import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { HasUID, IMsg } from "../../../DataSchema/if";
import { getUserCredit } from "../../../func/Credit";
import CreditAccess from "../Credit/CreditAccess";
import ItemTotalAccess from "./ItemTotalAccess";

export default abstract class AskTableAccess<T extends HasUID> {
  protected tb: JTable<T>;
  protected creditA: CreditAccess;
  protected ItemTotal: ItemTotalAccess;
  constructor(protected ask: T, protected conn: PoolConnection, tableName: string) {
    this.tb = new JTable(conn, tableName);
    this.creditA = new CreditAccess(ask.UserID, conn);
    this.ItemTotal = new ItemTotalAccess(this.conn);
  }
  public abstract doit(): Promise<IMsg>;
  protected getBalance(): Promise<number> {
    return getUserCredit(this.ask.UserID, this.conn);
  }
}
