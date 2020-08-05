import express, { Request, Response, response, Router } from "express";
import https from "https";
import {PoolConnection} from "mariadb";
import querystring from "querystring";
import CenterCall, {IFromCenter} from "../class/CenterCall";
import {IMsg} from "../DataSchema/if";
import {getConnection} from "../func/db";

const app: Router = express.Router();
app.get("doit", webFunc);
app.post("doit", webFunc);
async function webFunc(req: Request, res: Response) {
  let param: IFromCenter;
  let msg: IMsg = {ErrNo: 0, error: ""};
  if (req.query) { param = req.query; } else { param = req.body; }
  const conn: PoolConnection|undefined = await getConnection();
  if (conn) {
    const CC: CenterCall = new CenterCall(param, conn);
    if (param.op) {
      msg = await CC[param.op]();
    }
    conn.release();
  } else {
    msg.ErrNo = 9;
    msg.error = "Get connection error!!";
  }
  if (msg.ErrNo !== 0) {
    msg.error = msg.ErrCon;
    const ans = await sendMsg(msg.ErrCon as string);
    if (ans) {
      msg.slack = ans;
    }
    delete msg.ErrCon;
  }
  res.send(JSON.stringify(msg));
}

async function sendMsg(msg: string) {
  const Inputs: querystring.ParsedUrlQueryInput = {
    acc: "issues-james",
    msg
  };
  const Optons: https.RequestOptions = {
    headers: {"x-api-key": "7tFUAxk6tIayqq89vMTjK3NRX4qACEk39AniZJd5"}
  };
  const url: string = `https://nacauhh4p9.execute-api.ap-southeast-1.amazonaws.com/default/slackpush?${querystring.encode(Inputs)}`;
  return new Promise((resolve, reject) => {
    https.get(url, Optons, (res) => {
      console.log("sendMsg statusCode:", res.statusCode);
      console.log("sendMsg headers:", res.headers);
      res.on("data", (d) => {
        console.log("Receive from SendMsg:", d);
        resolve(d);
      }).on("error", (err) => {
        console.log("Error is raised by SendMsg:", err);
        reject(err);
      });
    });
  });
}
export default app;
