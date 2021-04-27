import ASetSql from "./ASetSql";
import {IKeyVal, ITableData} from "./dbif";
export default class AddSqlString extends ASetSql<ITableData> {
  public getSql(t: ITableData): string {
    const fields: string[] = [];
    const values: string[] = [];
    if (t.fields) {
      t.fields.map((itm: IKeyVal) => {
        fields.push(itm.key);
        values.push(typeof(itm.value) === "string" ? `'${itm.value}'` : `${itm.value}`);
      });
    }
    return `Insert into ${t.TableName}(${fields.join(",")}) values(${values.join(",")})`;
  }
}
