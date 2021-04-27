import dotenv from "dotenv";
import mariadb, { PoolConnection } from "mariadb";
dotenv.config();
// console.log("dotenv:", process.env);
export const port = process.env.SERVER_PORT;  // default port to listen
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
    timezone: "Asia/Taipei",
    charset: "UTF8"
};
const ccOptions: mariadb.PoolConfig = {
    host: process.env.CCHOST,
    user: process.env.CCUSER,
    password: process.env.CCPASSWORD,
    database: process.env.CCDATABASE,
    port: process.env.CCPORT ? parseInt(process.env.CCPORT, 10) : 3306,
    timezone: "Asia/Taipei",
    charset: "UTF8"
};
/**
 * 每個Pool預設會建立10個Connection，可依需要修改Config參數connectionLimit
 */
export const dbPool: mariadb.Pool = mariadb.createPool(mdOptions);
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

export function getConnection(pool?: mariadb.Pool, doHash?: boolean): Promise<PoolConnection|undefined> {
    // const pool: mariadb.Pool = dbPool;
    return new Promise((resolve, reject) => {
        // if (doHash) { pool = HHPool; }
        if (doHash) { reject(false); }
        // if (doHash) { reject({error: "No hash test now"}); }
        if (!pool) { pool = dbPool; }
        // console.log("idleConnection:" + pool.idleConnections());
        // console.log("pool info:", pool.totalConnections(), pool.activeConnections());
        pool.getConnection().then((conn: PoolConnection) => {
            resolve(conn);
        }).catch((err) => {
            console.log("getConnection error:", err);
            reject(false);
        });
    });
}
export function doQuery(sql: string, conn: PoolConnection, params?: IAxParams): Promise<any> {
    let query: Promise<any>;
    if (params) {
        query = conn.query(sql, params);
    } else {
        query = conn.query(sql);
    }
    // console.log("doQuery:", sql, params);
    return new Promise((resolve, reject) => {
        query.then((res) => {
            resolve(res);
        }).catch((err) => {
            // console.log("doQuery", sql, params, err);
            console.log("doQuery:", err, "SQL:", sql, "params:", params, "\nErrNo:", err.errno);
            Object.keys(err).map((key) => {
                console.log(key, ">", err[key]);
            });
            reject(false);
        });
    });
}
// export default dbPool;
