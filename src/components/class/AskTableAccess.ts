import { PoolConnection } from "mariadb";
import JTable from "../../class/JTable";
import { IHasID, IMsg } from "../../DataSchema/if";
export default abstract class AskTableAccess<T extends IHasID> {
  protected tb: JTable<T>;
  constructor(protected ask: T, protected conn: PoolConnection, tableName: string) {
    this.tb = new JTable(conn, tableName);
  }
  public abstract doit(): Promise<IMsg>;
}
