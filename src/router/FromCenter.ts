import express, { Request, Response, Router } from "express";
import https from "https";
import {PoolConnection} from "mariadb";
import querystring from "querystring";
// import CCManager from "../class/CenterCall/CCManager";
import CenterCall, {IFromCenter} from "../class/CenterCall/CenterCall";
import {IMsg} from "../DataSchema/if";
import {getConnection} from "../func/db";

const app: Router = express.Router();
app.get("/doit", webFunc);
app.post("/doit", webFunc);
async function webFunc(req: Request, res: Response) {
  let param: any;
  let msg: IMsg = {ErrNo: 0, error: ""};
  if (req.query.op) {
    // console.log("query", req.query);
    param = req.query;
  } else {
    // console.log("body", req.body);
    param = req.body;
  }
  console.log("webFunc", JSON.stringify(param));
  /*
  const ccm = CCManager.getInstance();
  ccm.Add(param);
  res.send(`${JSON.stringify(param)} accepted!!`);
  */
  const conn: PoolConnection|undefined = await getConnection();
  if (conn) {
    const params: IFromCenter = {
      issueno: "",
      lrid: "",
      openbet: "",
      lastresultissue: "",
      op: "",
      Method: "",
      result: "",
    };
    Object.keys(param).map((key) => {
      params[key] = param[key] as string;
    });
    const CC: CenterCall = new CenterCall(param, conn);
    if (param.op) {
      if (typeof(CC[param.op]) === "function") {
        msg = await CC[param.op]();
      } else {
        msg.ErrNo = 9;
        msg.error = `op:${param.op} has no funcion ,${JSON.stringify(param)}`;
      }
    }
    await conn.release();
  } else {
    msg.ErrNo = 9;
    msg.error = "Get connection error!!";
  }
  if (msg.ErrNo === 9) {
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
  return new Promise((resolve) => {
    https.get(url, Optons, (res) => {
      // console.log("sendMsg statusCode:", res.statusCode);
      // console.log("sendMsg headers:", res.headers);
      res.on("data", (d) => {
        // console.log("Receive from SendMsg:", d);
        resolve(d);
      }).on("error", (err) => {
        console.log("Error is raised by SendMsg:", err);
        resolve(undefined);
      });
    });
  });
}
export default app;
