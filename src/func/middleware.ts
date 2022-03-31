import {Request, Response } from "express";
import jwt from "jsonwebtoken";
import mariadb from "mariadb";
import DateFunc from "../components/class/Functions/MyDate";
import { ErrCode } from "../DataSchema/ENum";
import {AnyObject, IDbAns, IMsg} from "../DataSchema/if";
import * as db from "../func/db";
import { ILoginInfo } from "../router/AdminApi";
const staytime: number = 3000000;   // sec

export const PreCheck = async (req: Request, res: Response, next) => {
  // console.log("CPreCheck:", req.path, req.method);
  let param: any;
  if (req.method === "GET") {
    req.query = CheckParams(req.query);
    param = req.query;
  } else if (req.method === "POST") {
    req.body = CheckParams(req.body);
    param = req.body;
  }
  if (req.path.indexOf("getSysInfo") < 0 && req.path.indexOf("login") < 0 && req.path.indexOf("logout") < 0 && req.path.indexOf("agentApi") < 0 && req.path.indexOf("member") < 0 && req.path.indexOf("GameCenter") < 0) {
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
        msg.ErrNo = ErrCode.MISS_PARAMETER;
        msg.ErrCon = "Missing parameter!!";
        res.send(JSON.stringify(msg));
      }
    } else {
      const authkey = req.headers.authkey ? req.headers.authkey as string : "";
      await AuthChk(res, req.headers.authorization, authkey).then((msg1) => {
        if (msg1.ErrNo !== 0 ) { res.send(JSON.stringify(msg1)); } else {
          // console.log("next1", msg1);
          next();
        }
      }).catch((err) => {
        msg.ErrNo = ErrCode.NOT_DEFINED_ERR;
        msg.debug = err;
        res.send(JSON.stringify(msg));
      });
    }
  } else {
    // console.log("next2");
    next();
  }
};
const CheckParams = (param) => {
  Object.keys(param).map((key) => {
    param[key] = ModifyParams(param[key]);
  });
  // console.log("CheckParams", param);
  return param;
};

const ModifyParams = (param) => {
  return addslashes(param);
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
    await db.getConnection().then(async (conn) => {
      if (conn) {
        await chkLogin(UserID, sid, conn).then(async (res) => {
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
    await setLoginStatus(uid, sid, conn).then(async (res) => {
      if (res) {
        const dbas: IDbAns = res as IDbAns;
        // console.log("setLoginStatus ans", res);
        const sql = `select * from LoginInfo where uid=${uid} and isActive=1 and logkey='${sid}'`;
        // console.log("chkLogin sql", sql);
        await db.doQuery(sql, conn).then((res1) => {
          if (res1[0]) {
            // console.log("chkLogin", sql, res1[0]);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
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
      await db.doQuery(sql, conn).then(async (res) => {
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
