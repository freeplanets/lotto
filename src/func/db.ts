import dotenv from "dotenv";
import mariadb, { PoolConnection } from "mariadb";
import { ErrCode } from "../DataSchema/ENum";
import { IDbAns, IMsg } from "../DataSchema/if";
import myPool from "./NewPool";

dotenv.config();
// console.log("dotenv:", process.env);
export const port = process.env.SERVER_PORT;  // default port to listen
export const JWT_KEY = process.env.SITE_NAME ? process.env.SITE_NAME : "thisisjwtkey";
export const AuthKey = "refresh";
export const AuthLimit = 1800;  // 3600secs or  1 hour
export const AuthExpire = "30m"; // "1 hour"
/*
{
host: process.env.DBHOST,
user: process.env.DBUSER,
password: process.env.DBPASS,
port: process.env.DBPORT,
connectionLimit: process.env.DBCONNLIMIT,
rowsAsArray: true };
*/
// console.log("env:", process.env);
export interface IAxParams {
    [key: number]: number|string|boolean;
}
/*
const mdOptions: object = {
    host: process.env.MDHOST,
    user: process.env.MDUSER,
    password: process.env.MDPASSWORD,
    database: process.env.MDDATABASE,
    port: process.env.MDPORT,
};
*/
const mdOptions: mariadb.PoolConfig = {
    host: process.env.MDHOST,
    user: process.env.MDUSER,
    password: process.env.MDPASSWORD,
    database: process.env.MDDATABASE,
    port: process.env.MDPORT ? parseInt(process.env.MDPORT, 10) : 3306,
    // timezone: "Asia/Taipei",
    timezone: "+08:00",
    charset: "UTF8",
    // idleTimeout: 600,
    // connectionLimit: process.env.MAX_CONNECTIONS ? parseInt(process.env.MAX_CONNECTIONS, 10) : 30,
    connectionLimit: 30,
};
/*
const ccOptions: mariadb.PoolConfig = {
    host: process.env.CCHOST,
    user: process.env.CCUSER,
    password: process.env.CCPASSWORD,
    database: process.env.CCDATABASE,
    port: process.env.CCPORT ? parseInt(process.env.CCPORT, 10) : 3306,
    // timezone: "Asia/Taipei",
    timezone: "+08:00",
    charset: "UTF8"
};
*/
/**
 * 每個Pool預設會建立10個Connection，可依需要修改Config參數connectionLimit
 */
// const dbPool: mariadb.Pool = mariadb.createPool(mdOptions);
const dbPool: myPool = new myPool(mdOptions);
// export const ccPool: mariadb.Pool = mariadb.createPool(ccOptions);
/*
if (dbPool) {
    console.log("dbPool:", dbPool);
}
*/
/*
const HHOptions: mariadb.PoolConfig = {
    host: process.env.HASHHOST,
    user: process.env.HASHUSER,
    password: process.env.HASHPASSWORD,
    database: process.env.HASHDATABASE,
    port: process.env.HASHPORT ? parseInt(process.env.HASHPORT, 10) : 0,
    timezone: "Asia/Taipei",
    charset: "UTF8"
};
const HHPool: mariadb.Pool =  mariadb.createPool(HHOptions);
*/
export function getConnection(caller?: string): Promise<PoolConnection|undefined> {
    // const pool: mariadb.Pool = dbPool;
    return dbPool.getConnection(caller);
}
/**
 *
 * @param sql
 * @param conn
 * @param params
 * @returns connection query response or null when error occured
 */
export function doQuery(sql: string, conn: PoolConnection, params?: IAxParams): Promise<any> {
    return new Promise(async (resolve) => {
        let query: Promise<any>;
        await conn.ping();
        if (params) {
            query = conn.query(sql, params);
        } else {
            query = conn.query(sql);
        }
        // console.log("doQuery:", sql, params);
        query.then((res) => {
            // console.log("doQuery", res);
            if (res.meta) { delete res.meta; }
            resolve(res);
        }).catch((err) => {
            // console.log("doQuery", sql, params, err);
            console.log("doQuery:", err, "SQL:", sql, "params:", params, "\nErrNo:", err.errno);
            /*
            Object.keys(err).map((key) => {
                console.log(key, ">", err[key]);
            });
            */
            resolve(null);
        });
    });
}
export function Query(sql: string, conn: PoolConnection, params?: IAxParams): Promise<IMsg> {
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    // console.log("doQuery:", sql, params);
    return new Promise((resolve) => {
        conn.query(sql, params).then((res: IDbAns) => {
            // console.log("db Func Query res:", res);
            // console.log("db Func Query msg:", msg);
            msg = Object.assign(msg, res);
            if (msg.affectedRows === 0) {
                msg.debug = sql;
                msg.debugPaam = params;
            }
            // console.log("db Func Query after assign:", msg);
            resolve(msg);
            /*
            if (res.affectedRows > 0) {
                resolve(msg);
            } else {
                msg.ErrNo = ErrCode.DB_QUERY_ERROR;
                msg.debug = sql;
                msg.debugParam = params;
                msg.dbans = res;
                resolve(msg);
            }
            */
        }).catch((err) => {
            // console.log("doQuery", sql, params, err);
            // console.log("doQuery:", err, "SQL:", sql, "params:", params, "\nErrNo:", err.errno);
            Object.keys(err).map((key) => {
                console.log(key, ">", err[key]);
            });
            msg.ErrNo = ErrCode.DB_QUERY_ERROR;
            msg.error = err;
            resolve(msg);
        });
    });
}
export async function BeginTrans(conn: PoolConnection) {
    await conn.query("SET AUTOCOMMIT=0;");
    await conn.beginTransaction();
}
export async function RollBack(conn: PoolConnection) {
    await conn.rollback();
    await conn.query("SET AUTOCOMMIT=1;");
}
export async function Commit(conn: PoolConnection) {
    await conn.commit();
    await conn.query("SET AUTOCOMMIT=1;");
}
// export default dbPool;
