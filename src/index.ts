// import bodyParser from "body-parser";
import cors from "cors";
import express, {Request, Response} from "express";
import mariadb from "mariadb";
import { IMsg} from "./DataSchema/if";
import dbPool, {doQuery, getConnection, port} from "./func/db";
import {PreCheck} from "./func/middleware";
// import * as schedule from "./func/schedule";
import adminRouter from "./router/AdminApi";
import agentApi from "./router/agentApi";
import apiRouter from "./router/api";
import GameCenter from "./router/FromCenter";
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
app.use(PreCheck);

app.get("/", async (req: Request, res: Response) => {

       res.send("ok");
    });
app.get("/login", async (req, res) => {
        // console.log(req.query);
        const conn: mariadb.PoolConnection|undefined =  await getConnection();
        const msg: IMsg = { ErrNo: 0};
        if (conn) {
            const param = req.query;
            let sql: string = "";
            const params = [param.Account, param.Password];
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
            conn.release();
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Get connection error!!";
        }
        res.send(JSON.stringify(msg));
    });
    // start the Express server
app.get("/saveGames", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const params = [param.id, param.name];
        const sql = `insert into Games(id,name) values(?,?)`;
        console.log(sql, params);
        conn.query(sql, params).then((v) => {
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("saveGames", err);
            res.send(err);
        });
    });
app.use("/api", adminRouter);
app.use("/agentApi", agentApi);
app.use("/GameCenter", GameCenter);
app.use("/test", apiRouter);
// app.listen(port, () => {
app.listen(3000, "0.0.0.0", () => {
        console.log(`server started at http://localhost:${ port }`);
    });
/*
}).catch((err) => {
    console.log("db error:", err);
});
*/
