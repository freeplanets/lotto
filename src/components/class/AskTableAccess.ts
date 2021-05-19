import { PoolConnection } from "mariadb";
import JTable from "../../class/JTable";
import { IMsg, HasUID } from "../../DataSchema/if";
import CreditAccess from './CreditAccess';

export default abstract class AskTableAccess<T extends HasUID> {
  protected tb: JTable<T>;
  protected creditA: CreditAccess
  constructor(protected ask: T, protected conn: PoolConnection, tableName: string) {
    this.tb = new JTable(conn, tableName);
    this.creditA = new CreditAccess(ask.UserID, conn);
  }
  public abstract doit(): Promise<IMsg>;
}
