// import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, {Request, Response} from "express";
import mariadb from "mariadb";
import MsgMan from "./components/class/Message/MsgMan";
import MsgToDB from "./components/class/Message/MsgToDB";
import ExpressPeerServerFactory from "./components/class/peer/ExpressPeerServerFactory";
import { ErrCode } from "./DataSchema/ENum";
import { IMsg } from "./DataSchema/if";
import {doQuery, getConnection, IAxParams, port} from "./func/db";
import {PreCheck} from "./func/middleware";
import adminRouter from "./router/AdminApi";
import agentApi from "./router/agentApi";
import apiRouter from "./router/api";
import CryptoCur from "./router/CryptoCur";
import GameCenter from "./router/FromCenter";

dotenv.config();
// const args: minimist.ParsedArgs = minimist(process.argv.slice(2), {});
// console.log("minimist:", args);
// schedule.scheduleTest();
const app = express();
/*
dbPool.getConnection().then((conn) => {
});
*/
    // define a route handler for the default home page
const crosOption: cors.CorsOptions = {
};
// app.use(bodyParser.json({limit: "50mb"}));
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({extended: true}));
app.use(cors(crosOption));

app.get("/", async (req: Request, res: Response) => {
    // console.log("root");
    const msg: IMsg = { ErrNo: ErrCode.PASS, ErrCon: "ok" };
    res.send(JSON.stringify(msg));
    });
// app.listen(port, () => {
app.listen(3000, "0.0.0.0", () => {
    console.log(`server started at http://localhost:${ port }`);
});
/*
}).catch((err) => {
    console.log("db error:", err);
});
*/
