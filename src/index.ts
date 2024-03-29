// import bodyParser from "body-parser";
import { exec, ExecException } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express, {Request, Response} from "express";
import mariadb from "mariadb";
import StrFunc from "./components/class/Functions/MyStr";
import MsgMan from "./components/class/Message/MsgMan";
import MsgToDB from "./components/class/Message/MsgToDB";
import ExpressPeerServerFactory from "./components/class/peer/ExpressPeerServerFactory";
import { WebSC  } from "./components/webSC";
import { ErrCode } from "./DataSchema/ENum";
import { IMsg } from "./DataSchema/if";
import {doQuery, getConnection, IAxParams, port} from "./func/db";
import {PreCheck} from "./func/middleware";
import * as schedule from "./func/schedule";
import adminRouter from "./router/AdminApi";
import agentApi from "./router/agentApi";
import apiRouter from "./router/api";
import chat from "./router/chat";
import CryptoCur from "./router/CryptoCur";
import GameCenter from "./router/FromCenter";

exec("node -v", (err: ExecException | null, stdout: string, stderr: string) => {
    if (err) {
      console.log("ExecException", err);
    } else if (stderr) {
      console.log("Error", stderr);
    } else {
      console.log("node version:", stdout);
    }
});

dotenv.config();
// const args: minimist.ParsedArgs = minimist(process.argv.slice(2), {});
// console.log("minimist:", args);
// schedule.scheduleTest();
if (process.env.WORKSTATUS !== "localhost") {
    console.log("Schedule Run");
    schedule.getHashResult();
    schedule.DelPriceTickDataBefortLast3Days();
} else {
    console.log("No Schedule");
    // schedule.getBTCHash("mis.uuss.net:8332");
}
const app = express();

    // define a route handler for the default home page
const crosOption: cors.CorsOptions = {
    // allowedHeaders: ['Content-Type', 'token', 'Authorization'],
};
// app.use(bodyParser.json({limit: "50mb"}));
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({extended: true}));
app.use(cors(crosOption));
app.use(PreCheck);

app.get("/", async (req: Request, res: Response) => {
    // console.log("root");
    const msg: IMsg = { ErrNo: ErrCode.PASS, ErrCon: "ok" };
    res.send(StrFunc.stringify(msg));
    });
app.get("/login", async (req, res) => {
        // console.log(req.query);
        const conn: mariadb.PoolConnection|undefined =  await getConnection("index login");
        const msg: IMsg = { ErrNo: 0};
        if (conn) {
            const param = req.query;
            let sql: string = "";
            const Account: string = `${param.Account}`;
            const Password: string = `${param.Password}`;
            const params: IAxParams = [Account, Password];
            sql = `Select * from Member where Account= ? and Password=Password(?)`;
            const ans = await doQuery(sql, conn, params);
            if (ans) {
                if (ans.length > 0) {
                    msg.data = ans.pop();
                }
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Member not found";
            }
            await conn.release();
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Get connection error!!";
        }
        res.send(StrFunc.stringify(msg));
    });
    // start the Express server
app.get("/saveGames", async (req, res) => {
        const conn = await getConnection("saveGames");
        const param = req.query;
        const id: number = param.id ? parseInt(param.id as string, 0) : 0;
        const name = param.name ? `${param.name}` : "";
        const params: IAxParams = [id, name];
        const sql = `insert into Games(id,name) values(?,?)`;
        console.log(sql, params);
        if (conn) {
            conn.query(sql, params).then(async (v) => {
                await conn.release();
                res.send(StrFunc.stringify(v));
            }).catch(async (err) => {
                console.log("saveGames", err);
                await conn.release();
                res.send(err);
            });
        } else {
            res.send(StrFunc.stringify({error: "connection error!!"}));
        }
    });
app.use("/api", adminRouter);
app.use("/api/cc", CryptoCur);
app.use("/agentApi", agentApi);
app.use("/GameCenter", GameCenter);
app.use("/test", apiRouter);
app.use("/api/chat", chat);
// app.listen(port, () => {
const server = app.listen(3000, "0.0.0.0", () => {
    console.log(`server v0.9166 started at http://localhost:${ port }`);
});
const peerServer = new ExpressPeerServerFactory(server, new MsgMan(new MsgToDB())).get();
app.use("/peerjs", peerServer);

const wSock = WebSC.getSock();
console.log("wSock Info:", wSock.Info);
/*
}).catch((err) => {
    console.log("db error:", err);
});
*/
