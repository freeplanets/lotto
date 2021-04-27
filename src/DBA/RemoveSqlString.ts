import ASetSql from "./ASetSql";
import {IKeyVal, ITableData} from "./dbif";
import UpdateSqlString from "./UpdateSqlString";
export default class RemoveSqlString extends ASetSql<ITableData> {
  private static uss: UpdateSqlString = new UpdateSqlString();
  public getSql(t: ITableData): string {
    const kv: IKeyVal = {key: "isCanceled", value: 1};
    t.fields?.push(kv);
    return RemoveSqlString.uss.getSql(t);
  }
}
