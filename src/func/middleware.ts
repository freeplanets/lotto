import {Request, Response } from "express";
import mariadb from "mariadb";
import { isRegExp } from "util";
import ErrCode from "../DataSchema/ErrCode";
import {IDbAns, IMsg} from "../DataSchema/if";
import * as db from "../func/db";
const staytime: number = 3000;   // sec

export const PreCheck = async (req: Request, res: Response, next) => {
  console.log("CPreCheck:", req.path, req.method);
  let param: any;
  if (req.method === "GET") {
    req.query = CheckParams(req.query);
    param = req.query;
  } else if (req.method === "POST") {
    req.body = CheckParams(req.body);
    param = req.body;
  }
  if (req.path.indexOf("login") < 0 && req.path.indexOf("logout") < 0 && req.path.indexOf("agentApi") < 0 && req.path.indexOf("member") < 0) {
    const msg: IMsg = {ErrNo: 0};
    const UserID: number|undefined = param.UserID;
    const sid: string|undefined = param.sid;
    // const UpId: number|undefined = param.UpId;
    if (!UserID || !sid) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "Missing parameter!!";
      res.send(JSON.stringify(msg));
    } else {
      await LoginChk(UserID, sid).then((msg1) => {
        if (msg1.ErrNo !== 0 ) { res.send(JSON.stringify(msg1)); } else {
          console.log("next1", msg1);
          next();
        }
      }).catch((err) => {
        msg.ErrNo = ErrCode.NOT_DEFINED_ERR;
        msg.debug = err;
        res.send(JSON.stringify(msg));
      });
    }
  } else {
    console.log("next2");
    next();
  }
};
const CheckParams = (param) => {
  Object.keys(param).map((key) => {
    param[key] = ModifyParams(param[key]);
  });
  console.log("CheckParams", param);
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

const LoginChk = async (UserID: number, sid: string, UpId?: number): Promise<IMsg> => {
  return new Promise(async (resolve, reject) => {
    const msg: IMsg = {ErrNo: 0};
    await db.getConnection().then(async (conn) => {
      if (conn) {
        await chkLogin(UserID, sid, conn).then((res) => {
          if (res) { resolve(msg); } else {
            msg.ErrNo = ErrCode.NO_LOGIN;
            conn.release();
            resolve(msg);
          }
        }).catch((err) => {
          msg.ErrNo = 9;
          msg.ErrCon = "Connect Fail!!";
        });
        conn.release();
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
  /*
  const msg: IMsg = {ErrNo: 0};
  const conn = await db.getConnection();
  if (conn) {
    const ans = await chkLogin(UserID, sid, conn, UpId);
    if (!ans) {
      msg.ErrNo = ErrCode.NO_LOGIN;
    }
  } else {
    msg.ErrNo = 9;
    msg.ErrCon = "Connect Fail!!";
  }
  return msg;
  */
};
const chkLogin = (uid: number, sid: string, conn: mariadb.PoolConnection) => {
  return new Promise(async (resolve, reject) => {
    await setLoginStatus(uid, sid, conn).then(async (res) => {
      if (res) {
        const dbas: IDbAns = res as IDbAns;
        console.log("setLoginStatus ans", res);
        const sql = `select * from LoginInfo where uid=${uid} and isActive=1 and logkey='${sid}'`;
        console.log("chkLogin sql", sql);
        await db.doQuery(sql, conn).then((res1) => {
          if (res1[0]) {
            console.log("chkLogin", sql, res1[0]);
            resolve(true);
          } else {
            resolve(false);
          }
        }).catch((err) => {
          console.log("chkLogin", err);
          reject(err);
        });
      }
      resolve(false);
    }).catch((err) => {
      reject(err);
    });
  });
  /*
  let ans = await setLoginStatus(uid, sid, conn, UpId);
  if (ans) {
      console.log("setLoginStatus ans", ans);
      const sql = `select * from LoginInfo where uid=${uid} and isActive=1 and AgentID=${UpId ? UpId : 0} and logkey='${sid}'`;
      ans = await db.doQuery(sql, conn);
      if (ans) {
          // console.log("chkLogin", sql, ans);
          return true;
      }
  }
  return false;
  */
};
const setLoginStatus = (uid: number, sid: string, conn: mariadb.PoolConnection, key?: number) => {
  return new Promise(async (resolve, reject) => {
      const cond: string = key ? "timeproc=CURRENT_TIMESTAMP" : "isActive=0";
      const sql = `update LoginInfo set ${cond} where uid=${uid} and isActive=1
      and logkey='${sid}'
      and CURRENT_TIMESTAMP-timeproc${key ? "<" : ">"}${staytime}`;
      await db.doQuery(sql, conn).then(async (res) => {
        console.log("setLoginStatus", sql, res);
        if (!key) {
          const ans = await setLoginStatus(uid, sid, conn, 1);
          resolve(ans);
        } else {
          resolve(res);
        }
      }).catch((err) => {
        console.log("setLoginStatus", err);
        reject(err);
      });
  });
};
