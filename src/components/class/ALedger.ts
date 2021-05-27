import { PoolConnection } from "mariadb";
import JTable from "../../class/JTable";
import { AskTable, IHasID, IKeyVal, IMsg } from "../../DataSchema/if";

export default abstract class ALedger<T extends IHasID> {
  protected jtable: JTable<T>;
  constructor(protected conn: PoolConnection, tablename: string) {
    this.jtable = new JTable(this.conn, tablename);
  }
  public abstract add(ask: AskTable): Promise<IMsg>;
  public async get(UserID: number): Promise<IMsg> {
    const param: IKeyVal = {
      Key: "UserID",
      Val: UserID,
    };
    return this.jtable.Lists(param);
  }
}
