import ASetSql from "./ASetSql";
import {IKeyVal, ITableData} from "./dbif";
export default class UpdateSqlString extends ASetSql<ITableData> {
  public getSql(t: ITableData): string {
    const keys: string[] = [];
    const updates: string[] = [];
    t.fields?.map((itm: IKeyVal) => {
      const val: string = typeof itm.value === "string" ? `'${itm.value}'` : `${itm.value}`;
      const f = t.keys?.find((key) => key === itm.key);
      if (f) {
        keys.push(`${itm.key}=${val}`);
      } else {
        updates.push(`${itm.key}=${val}`);
      }
    });
    return `update ${t.TableName} set ${updates.join(",")} where ${keys.join(" and ")}`;
  }
}
