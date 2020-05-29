import mariadb from "mariadb";
import {IDbAns} from "../DataSchema/if";
import eds from "./EncDecString";
export interface IHasID {
    id: number;
}
interface ITableIndex {
    Table: string;
    Non_unique: number;
    Key_name: string;
    Seq_in_index: number;
    Column_name: string;
    Collation: string;
    Cardinality: number;
    Sub_part: null;
    Packed: null;
    Null?: null;
    Index_type: string;
    Comment: string;
    Index_comment: string;
}
interface ITBIdxes {
    [key: number]: ITableIndex;
}
const ED = new eds();
export default class JTable<T extends IHasID> {
    constructor(private conn: mariadb.PoolConnection, private TableName: string) {}
    public async getOne(id: number): Promise<T|undefined> {
        const sql = `select * from ${this.TableName} where id=${id}`;
        let mb: T | undefined;
        await this.conn.query(sql).then((row) => {
            if (row.length > 0) {
                mb = row[0];
                return mb;
            }
        }).catch((err) => {
            // mb = err;
            console.log("JTable getOne", err);
        });
        // console.log("JTable List mb", mb);
        return mb;
    }
    public async List() {
        const sql = `select * from ${this.TableName} where 1`;
        let mb: T[] | any;
        // console.log("JTable List sql", sql);
        await this.conn.query(sql).then((row) => {
            mb = row;
        }).catch((err) => {
            mb = err;
        });
        // console.log("JTable List mb", mb);
        return mb;
    }
    /**
     * update table where field 'id'
     * @param v
     */
    public async Update(v: T ) {
        const fields: string[] = [];
        const params: any[] = [];
        Object.keys(v).map((key) => {
            if (key === "id") { return; }
            if (key === "ModifyTime") { return; }
            if (key === "TableName") {
                if (v[key] === "User") {
                    const mykey = "Types";
                    if (v[mykey] === 1) {
                        fields.push( "DfKey=?");
                        params.push(ED.KeyString);
                    }
                }
                return;
            }
            fields.push( key + "=?");
            params.push(v[key]);
        });
        params.push(v.id);
        let ans;
        const sql = `update ${this.TableName} set ` + fields.join(",") + " where id = ?";
        await this.conn.query(sql, params).then((row) => {
            ans = row;
            // console.log("JTable Upate ans:", ans);
        }).catch((err) => {
            ans = err;
        });
        // console.log("JTable Upate after:", ans);
        return ans;
    }
    public async Insert(v: T) {
        const fields: string[] = [];
        const params: any[] = [];
        const vals: string[] = [];
        Object.keys(v).map((key) => {
            if (key === "id") { return; }
            if (key === "ModifyTime") { return; }
            if (key === "TableName") {
                if (v[key] === "User") {
                    const mykey = "Types";
                    if (v[mykey] === 1) {
                        fields.push("DfKey");
                        params.push(ED.KeyString);
                        vals.push("?");
                    }
                }
                return;
            }
            fields.push( key );
            if (key === "Password") {
                vals.push("PASSWORD(?)");
            } else {
                vals.push("?");
            }
            params.push(v[key]);
        });
        const sql = `
            insert into ${this.TableName}(${fields.join(",")}) values(${vals.join(",")})
        `;
        // console.log("JTable Insert:", sql, params);
        let ans;
        await this.conn.query(sql, params).then((rows) => {
            ans = rows;
        }).catch((err) => {
            // ans = err;
            console.log(err);
            ans = false;
        });
        return ans;
    }
    public async MultiInsert(v: T[]): Promise<IDbAns|undefined> {
        const fields: string[] = [];
        const vals: string[] = [];
        let cnt = 0;
        v.map((itm) => {
            const params: any[] = [];
            Object.keys(itm).map((key) => {
                if (key === "id") { return; }
                if (key === "ModifyTime") { return; }
                if (cnt === 0) {
                    fields.push( key );
                }
                if (typeof(itm[key]) === "number") {
                    params.push(itm[key]);
                } else {
                    params.push(`'${itm[key]}'`);
                }
            });
            cnt = cnt + 1;
            vals.push(`(${params.join(",")})`);
        });
        const sql = `
            insert into ${this.TableName}(${fields.join(",")}) values${vals.join(",")}
        `;
        //console.log("JTable Multi Insert:", sql);
        let ans: IDbAns|undefined;
        await this.conn.query(sql).then((rows) => {
            ans = rows as IDbAns;
        }).catch((err) => {
            // ans = err;
            console.log(err);
            // ans = false;
        });
        return ans;
    }
    public async MultiUpdate(data: T[], isAdd: boolean= false) {
        if (data.length === 0) { return false; }
        const keys: string[] = [];
        const updates: string[] = [];
        const ff: string[] = [];
        const values: any[][] = [];
        const ans = await this.getIndexes();
        let idx: string[] = [];
        if (ans) {
            idx = ans as string[];
        }
        Object.keys(data[0]).map((key) => {
            if (key !== "id") {
                keys.push(key);
                ff.push("?");
                const f = idx.find((itm) => itm === key);
                if (!f) {
                    if (isAdd) {
                        updates.push(`${key}=${key}+values(${key})`);
                    } else {
                        updates.push(`${key}=values(${key})`);
                    }
                }
            }
        });
        data.map((dta: T) => {
            const tmp: any[] = [];
            keys.map((fn) => {
                tmp.push(dta[fn]);
            });
            values.push(tmp);
        });
        const sql = `insert into ${this.TableName}(${keys.join(",")}) values(${ff.join(",")})
            on duplicate key update ${updates.join(",")}`;
        // console.log(`MultiUpdate ${this.TableName}:`, sql, values);
        let ans1;
        await this.conn.batch(sql, values).then((res) => {
            ans1 = res;
        }).catch((err) => {
            console.log("JTable MultiUpdate error", err, values);
            ans1 = false;
        });
        return ans1;
    }
    private async getIndexes(): Promise<string[] | boolean> {
        const sql = `show indexes from ${this.TableName}`;
        let ans: string[] | boolean = [];
        await this.conn.query(sql).then((res) => {
            // console.log("getIndexes res:", res);
            ans = this.anaIndexes(res);
        }).catch((err) => {
            console.log("JTable getIndexes error", err);
            ans = false;
        });
        return ans;
    }
    private anaIndexes(idx: ITableIndex[]): string[] {
        const idxes: string[] = [];
        idx.map((itm) => {
            if (itm) {
                // console.log("anaIndexes", itm);
                if (itm.Non_unique === 0) {
                    if (itm.Column_name !== "id") {
                        idxes.push(itm.Column_name);
                    }
                }
            }
        });
        return idxes;
    }
}
