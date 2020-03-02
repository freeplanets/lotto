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
const mdOptions: object = {
    host: process.env.MDHOST,
    user: process.env.MDUSER,
    password: process.env.MDPASSWORD,
    database: process.env.MDDATABASE,
    port: process.env.MDPORT
};
const dbPool = mariadb.createPool(mdOptions);
export default dbPool;
