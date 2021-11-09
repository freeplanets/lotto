import { PoolConnection } from "mariadb";

export default abstract class ATrans {
	constructor(protected conn: PoolConnection) {}
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
