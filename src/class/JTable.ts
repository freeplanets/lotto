import mariadb from "mariadb";
import FilterFactory from "../components/FilterFactory";
import { ErrCode } from "../DataSchema/ENum";
import { IDbAns, IHasID, IKeyVal, IMsg } from "../DataSchema/if";
import {doQuery} from "../func/db";
import eds from "./EncDecString";

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
    private query = doQuery;
    private extFilter = "";
    private defaultTableName = "";
    constructor(private conn: mariadb.PoolConnection, private TableName: string) {
        this.defaultTableName = TableName;
    }
    set ExtFilter(f: string) {
        this.extFilter = f;
    }
    public resetTableName() {
        this.TableName = this.defaultTableName;
    }
    public setTableName(tname: string) {
        this.TableName = tname;
    }
    public async getOne(id: number | IKeyVal | IKeyVal[], fields?: string | string[]): Promise<T|undefined> {
        const filter = new FilterFactory(id).getFilter();
        let field = "*";
        if (fields) { field = Array.isArray(fields) ? fields.join(",") : fields; }
        const sql = `select ${field} from ${this.TableName} where ${filter}`;
        let mb: T | undefined;
        // console.log("getone debug:", sql, id);
        const ans = await this.query(sql, this.conn);
        // console.log("JTable List mb", mb);
        if (ans) {
            if (ans.length > 0) {
                mb = ans[0] as T;
            }
        }
        return mb;
    }
    public async Lists(keys?: string | IKeyVal | IKeyVal[], fields?: string|string[], orderField?: string): Promise<IMsg> {
        const msg: IMsg = {ErrNo: 0};
        const ans = await this.List(keys, fields, orderField);
        if (ans) {
            msg.data = ans as T[];
        } else {
            msg.ErrNo = ErrCode.NO_DATA_FOUND;
            msg.ErrCon = "No Data!!";
        }
        return msg;
    }
    public async List(keys?: string | IKeyVal | IKeyVal[], fields?: string|string[], orderField?: string): Promise<T[] | undefined> {
        let filter = "";
        if (keys) {
            filter = new FilterFactory(keys).getFilter();
            /*
            if (Array.isArray(keys)) {
                const tmp = keys.map((itm) => {
                    return ` ${itm.Key} ${itm.Cond ? itm.Cond : "=" } ${typeof(itm.Val) === "number" ? itm.Val : "'" + itm.Val + "'" } `;

                });
                if (tmp.length > 0) { filter = tmp.join("and"); }
            } else {
                if(keys.Key){
                    filter = ` ${keys.Key} ${keys.Cond ? keys.Cond : "=" } ${typeof(keys.Val) === "number" ? keys.Val : "'" + keys.Val + "'"} `;
                } else {
                    const tmp = Object.keys(keys).map((key)=>{
                        let ftr = '';
                        switch(typeof keys[key]) {
                            case 'number':
                                ftr = `${key} = ${keys[key]}`;
                                break;
                            case 'boolean':
                                ftr = `${key}`;
                                break;
                            default:
                                ftr = `${key} = ''`
                        }
                        return ftr;
                    });
                }
            }
            */
        }
        if ( !filter ) { filter = "1"; }
        let fds = "*";
        if (fields) {
            if (Array.isArray(fields)) {
                if (fields.length > 0) { fds = fields.join(","); }
            } else {
                fds = fields;
            }
        }
        let sql = `select ${fds} from ${this.TableName} where ${filter}`;
        if (orderField) {
            sql = `${sql} order by ${orderField}`;
        }
        let mb: T[] | undefined;
        // console.log("JTable List sql", sql, keys);
        await this.conn.query(sql).then((row) => {
            mb = row;
        }).catch((err) => {
            // mb = false;
            console.log(err);
        });
        // console.log("JTable List mb", mb);
        return mb;
    }
    /**
     * update table where field 'id'
     * @param v
     */
    public async Delete(id: number|number[]) {
        let ans;
        const sql = `delete from ${this.TableName} where id ${typeof(id) === "number" ? "=" + id : " in " + "(" + id.join(",") + ")" } `;
        await this.conn.query(sql).then((row) => {
            ans = row;
            // console.log("JTable Upate ans:", ans);
        }).catch((err) => {
            ans = false;
            console.log("JTable Delete err:", err);
        });
        return ans;
    }
    public async Update(v: T ): Promise<IMsg> {
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
            if (typeof(v[key]) === "undefined") { return; }
            fields.push( key + "=?");
            params.push(v[key]);
        });
        if (v.id) {
            params.push(v.id);
        }
        const ans: IMsg = { ErrNo: ErrCode.PASS };
        let sql = `update ${this.TableName} set ` + fields.join(",") + " where id = ?";
        if (this.extFilter) {
            sql = `${sql} and ${this.extFilter}`;
            // console.log("Update with extFilter:", sql, params);
        }
        // console.log("JTable Update", sql, params);
        await this.conn.query(sql, params).then((row: IDbAns) => {
            if (row.affectedRows === 0) {
                ans.ErrNo = ErrCode.DB_QUERY_ERROR;
                ans.ErrCon = "Update Error!!";
                // ans.debug = sql;
                // ans.debugParam = params;
            }
            // console.log("JTable Update ans:", row);
        }).catch((err) => {
            // ans = false;
            console.log("JTable Upate err:", err);
            ans.ErrNo = ErrCode.DB_QUERY_ERROR;
            ans.Error = err;
            ans.debug = sql;
        });
        return ans;
    }
    public async Insert(v: T): Promise<IMsg> {
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
        let ans: IMsg = { ErrNo: ErrCode.PASS };
        await this.conn.query(sql, params).then((rows) => {
            ans = rows;
            ans.ErrNo = ErrCode.PASS;
        }).catch((err) => {
            // ans = err;
            // console.log(err);
            ans.ErrNo = ErrCode.DB_QUERY_ERROR;
            ans.Error = err;
            ans.Params = params;
            // ans = false;
        });
        return ans;
    }
    public async MultiInsert(v: T[]): Promise<IMsg> {
        const fields: string[] = [];
        const vals: string[] = [];
        let cnt = 0;
        let ans: IMsg = { ErrNo: ErrCode.PASS};
        try {
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
            // console.log("JTable Multi Insert:", sql);

            await this.conn.query(sql).then((rows) => {
                ans = rows as IMsg;
                ans.ErrNo = ErrCode.PASS;
            }).catch((err) => {
                // ans = err;
                console.log(err);
                // ans = false;
                ans.ErrNo = ErrCode.DB_QUERY_ERROR;
                ans.Error =  err;
            });
        } catch (err) {
            ans.ErrNo = ErrCode.TRY_CATCH_ERROR,
            ans.Error = err;
        }
        return ans;
    }
    public async MultiUpdate(data: T[], isAdd: boolean= false, onIdkey: boolean = false) {
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
            if (onIdkey) {
                if (key === "id") { return; }
            }
            keys.push(key);
            ff.push("?");
            if (key !== "id") {
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
            // console.log("batch update:", res);
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
