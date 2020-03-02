import mariadb from "mariadb";
import eds from "./EncDecString";
interface IHasID {
    id: number;
}
const ED = new eds();
export default class JTable<T extends IHasID> {
    constructor(private conn: mariadb.PoolConnection, private TableName: string) {}
    public async List() {
        const sql = `select * from ${this.TableName} where 1`;
        let mb: T[] | any;
        console.log("JTable List sql", sql);
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
        }).catch((err) => {
            ans = err;
        });
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
        console.log("JTable Insert:", sql, params);
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
    public async MultiInsert(v: T[]) {
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
        console.log("JTable Multi Insert:", sql);
        let ans;
        await this.conn.query(sql).then((rows) => {
            ans = rows;
        }).catch((err) => {
            // ans = err;
            console.log(err);
            ans = false;
        });
        return ans;
    }
}
