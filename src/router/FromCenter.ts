import express, { Request, Response, Router } from "express";
import https from "https";
// import {PoolConnection} from "mariadb";
import querystring from "querystring";
import CCManager from "../class/CenterCall/CCManager";
import StrFunc from "../components/class/Functions/MyStr";
// import CenterCall, {IFromCenter} from "../class/CenterCall/CenterCall";
// import {IMsg} from "../DataSchema/if";
// import {getConnection} from "../func/db";

CCManager.getInstance();

const app: Router = express.Router();
app.get("/doit", webFunc);
app.post("/doit", webFunc);
async function webFunc(req: Request, res: Response) {
  let param: any;
  if (req.query.op) {
    // console.log("query", req.query);
    param = req.query;
  } else {
    // console.log("body", req.body);
    param = req.body;
  }
  console.log("webFunc", StrFunc.stringify(param));
  /// *
  const ccm = CCManager.getInstance();
  ccm.Add(param);
  res.send(`${StrFunc.stringify(param)} accepted!!`);
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
