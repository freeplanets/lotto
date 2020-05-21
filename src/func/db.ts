import dotenv from "dotenv";
import mariadb from "mariadb";
dotenv.config();

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
interface IAxParams {
    [key: number]: number|string|boolean;
}
const mdOptions: object = {
    host: process.env.MDHOST,
    user: process.env.MDUSER,
    password: process.env.MDPASSWORD,
    database: process.env.MDDATABASE,
    port: process.env.MDPORT
};
const dbPool: mariadb.Pool = mariadb.createPool(mdOptions);

export function getConnection(): Promise<mariadb.PoolConnection|undefined> {
    return new Promise((resolve, reject) => {
        dbPool.getConnection().then((conn: mariadb.PoolConnection) => {
            resolve(conn);
        }).catch((err) => {
            console.log("getConnection error:", err);
            reject(err);
        });
    });
}
export function doQuery(sql: string, conn: mariadb.PoolConnection, params?: IAxParams): Promise<any> {
    let query: Promise<any>;
    if (params) {
        query = conn.query(sql, params);
    } else {
        query = conn.query(sql);
    }
    return new Promise((resolve, reject) => {
        query.then((res) => {
            resolve(res);
        }).catch((err) => {
            // console.log("doQuery", sql, params, err);
            console.log("doQuery:", err, "\nErrNo:", err.errno);
            Object.keys(err).map((key) => {
                console.log(key, ">", err[key]);
            });
            reject(err);
        });
    });
}
export default dbPool;
