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
  protected decimalPlaces = 2;
  constructor(protected ask: T, protected conn: PoolConnection, tableName: string) {
    this.tb = new JTable(this.conn, tableName);
    this.creditA = new CreditAccess(ask.UserID, this.conn);
    this.ItemTotal = new ItemTotalAccess(this.conn);
  }
  public abstract doit(): Promise<IMsg>;
  protected getBalance(): Promise<number> {
    return getUserCredit(this.ask.UserID, this.conn);
  }
  protected async BeginTrans() {
    await this.conn.query("SET AUTOCOMMIT=0;");
    await this.conn.beginTransaction();
  }
  protected async RollBack() {
    await this.conn.rollback();
    await this.conn.query("SET AUTOCOMMIT=1;");
  }
  protected async Commit() {
    await this.conn.commit();
    await this.conn.query("SET AUTOCOMMIT=1;");
  }
}
