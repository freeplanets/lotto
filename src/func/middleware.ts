import {Request, Response } from "express";
import mariadb from "mariadb";
import { ErrCode } from "../DataSchema/ENum";
import {IDbAns, IMsg} from "../DataSchema/if";
import * as db from "../func/db";
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
    if (!UserID || !sid) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "Missing parameter!!";
      res.send(JSON.stringify(msg));
    } else {
      await LoginChk(UserID, sid).then((msg1) => {
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

const LoginChk = async (UserID: number, sid: string, UpId?: number): Promise<IMsg> => {
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
