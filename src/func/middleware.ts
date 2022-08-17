import {Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import jwt from "jsonwebtoken";
import mariadb from "mariadb";
import { ErrCode } from "../DataSchema/ENum";
import { IDbAns, IMsg} from "../DataSchema/if";
import * as db from "../func/db";
import { ILoginInfo } from "../router/AdminApi";
const staytime: number = 3000000;   // sec

export const PreCheck = async (req: Request, res: Response, next) => {
  // console.log("CPreCheck:", req.body, req.query);
  const param = CheckParams(req);
  if (req.path.indexOf("getSysInfo") < 0 && req.path.indexOf("login") < 0 && req.path.indexOf("logout") < 0
    && req.path.indexOf("agentApi") < 0 && req.path.indexOf("member") < 0 && req.path.indexOf("GameCenter") < 0
    && req.path.indexOf("peers") < 0 && req.path.indexOf("peerjs") < 0 && req.path.indexOf("chat") < 0) {
    const msg: IMsg = {ErrNo: 0};
    const UserID: number|undefined = param.UserID;
    const sid: string|undefined = param.sid;
    // const UpId: number|undefined = param.UpId;
    // console.log("PreCheck header:", req.headers);
    // console.log("chk point", sid);
    if (!req.headers.authorization) {
        // if (!UserID || !sid) {
      if (param.NoCheck) {
        next();
      } else {
        // console.log("miss param", param, req.body);
        msg.ErrNo = ErrCode.MISS_PARAMETER;
        msg.ErrCon = "Missing parameter!!";
        res.send(JSON.stringify(msg));
      }
    } else {
      const authkey = req.headers.authkey ? req.headers.authkey as string : "";
      AuthChk(res, req.headers.authorization, authkey).then((msg1) => {
        if (msg1.ErrNo !== 0 ) { res.send(JSON.stringify(msg1)); } else {
          // console.log("next1", msg1);
          next();
        }
      }).catch((err) => {
        msg.ErrNo = ErrCode.NO_LOGIN;
        msg.debug = err;
        res.send(JSON.stringify(msg));
      });
    }
  } else {
    // console.log("next2");
    next();
  }
};
const CheckParams = (req: Request) => {
  let param: any;
  const remoteIP = getRemoteIP(req);
  // console.log("after remoteIP", remoteIP);
  if (req.method === "GET") {
    // req.query = CheckParams(req.query);
    req.query.remoteIP = remoteIP;
    param = ModifyParams(req.query);
  } else if (req.method === "POST") {
    // req.body = CheckParams(req.body);
    req.body.remoteIP = remoteIP;
    param = ModifyParams(req.body);
  }
  return param;
};

const ModifyParams = (param: any) => {
  Object.keys(param).map((key) => {
    param[key] = addslashes(param[key]);
  });
  return param;
};
const addslashes = (str) => {
  try {
    return str.replace(/\\/g, "\\\\").
        replace(/\u0008/g, "\\b").
        replace(/\t/g, "\\t").
        replace(/\n/g, "\\n").
        replace(/\f/g, "\\f").
        replace(/\r/g, "\\r").
        replace(/'/g, "\\'").
        replace(/"/g, '\\"');
  } catch (err) {
      return str;
  }
};
const AuthChk = async (res: Response, auth: string, authkey = "") => {
  const msg: IMsg = { ErrNo: ErrCode.NO_LOGIN };
  const info = jwt.verify(auth, db.JWT_KEY);
  // console.log("authchk:", typeof(info));
  if (info && typeof(info) === "object") {
    // console.log(DateFunc.toLocalString(info.iat ? info.iat * 1000 : info.iat));
    // console.log(DateFunc.toLocalString(info.exp ? info.exp * 1000 : info.exp));
    if (authkey === db.AuthKey) {
      console.log("do authkey:", authkey, db.AuthKey);
      const jsign = jwt.sign(info, db.JWT_KEY, { expiresIn: db.AuthExpire });
      const { id , sid } = info as ILoginInfo;
      res.setHeader("Authorization", jsign);
      res.setHeader("Access-Control-Expose-Headers", "Authorization");
      if (sid) { return LoginChk(id, sid); }
    }
    msg.ErrNo = ErrCode.PASS;
  }
  return msg;
};
const LoginChk = async (UserID: number, sid: string): Promise<IMsg> => {
  return new Promise(async (resolve) => {
    const msg: IMsg = {ErrNo: 0};
    db.getConnection().then(async (conn) => {
      if (conn) {
        chkLogin(UserID, sid, conn).then(async (res) => {
          if (res) { resolve(msg); } else {
            msg.ErrNo = ErrCode.NO_LOGIN;
            await conn.release();
            resolve(msg);
          }
        }).catch((err) => {
          msg.ErrNo = 9;
          msg.ErrCon = "Connect Fail!!";
        });
        await conn.release();
        resolve(msg);
      } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Connect Fail!!";
        resolve(msg);
      }
    }).catch((err) => {
      msg.ErrNo = 9;
      msg.ErrCon = "Connect Fail!!";
      resolve(msg);
    });
  });
};
const chkLogin = (uid: number, sid: string, conn: mariadb.PoolConnection) => {
  return new Promise(async (resolve) => {
    setLoginStatus(uid, sid, conn).then(async (res) => {
      if (res) {
        const dbas: IDbAns = res as IDbAns;
        // console.log("setLoginStatus ans", res);
        const sql = `select * from LoginInfo where uid=${uid} and isActive=1 and logkey='${sid}'`;
        // console.log("chkLogin sql", sql);
        db.doQuery(sql, conn).then((res1) => {
          if (res1[0]) {
            // console.log("chkLogin", sql, res1[0]);
            resolve(true);
          } else {
            resolve(false);
          }
        }).catch((err) => {
          console.log("chkLogin doQuery err:", err);
          resolve(false);
        });
      }
      resolve(false);
    }).catch((err) => {
      console.log("chkLogin err:", err);
      resolve(false);
    });
  });
};
const setLoginStatus = (uid: number, sid: string, conn: mariadb.PoolConnection, key?: number) => {
  return new Promise(async (resolve) => {
      const cond: string = key ? "timeproc=CURRENT_TIMESTAMP" : "isActive=0";
      const sql = `update LoginInfo set ${cond} where uid=${uid} and isActive=1
      and logkey='${sid}'
      and CURRENT_TIMESTAMP-timeproc${key ? "<" : ">"}${staytime}`;
      db.doQuery(sql, conn).then(async (res) => {
        // console.log("setLoginStatus", sql, res);
        if (!key) {
          const ans = await setLoginStatus(uid, sid, conn, 1);
          resolve(ans);
        } else {
          resolve(res);
        }
      }).catch((err) => {
        console.log("setLoginStatus", err);
        resolve(undefined);
      });
  });
};
const getRemoteIP = (req: Request) => {
  // console.log("remoteip:", req.socket.remoteAddress, req.headers);
  const headers: IncomingHttpHeaders = req.headers;
  const forwarded = headers["x-forwarded-for"];
  const forwardip = forwarded ? Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0] : null;
  return forwardip ? forwardip : req.socket.remoteAddress;
};
