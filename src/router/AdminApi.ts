import express, {Request, Response, Router } from "express";
// import jwt from "jsonwebtoken";
import mariadb from "mariadb";
// import BetParam from "src/class/BetParam";
// import {setPayRateData,setPayRate,isPayClassUsed,chkTermIsSettled,CreateOddsData,getGameList,getBtList} from '../API/ApiFunc';
import * as afunc from "../API/ApiFunc";
import {getGame, getOddsData, getPayClass, getTermDateNotSettled, getUsers} from "../API/MemberApi";
import getAnimals from "../class/Animals";
import {Bet} from "../class/Bet";
import EDS from "../class/EncDecString";
import {getOtherSide} from "../class/Func";
import {Gets} from "../class/Gets";
import GoogleAuth, {IGAValidate, IParamForGoogleAuth} from "../class/GoogleAuth";
import JDate from "../class/JDate";
import JTable from "../class/JTable";
import {SaveNums} from "../class/Settlement";
import {CancelTerm} from "../class/Settlement";
import StrFunc from "../components/class/Functions/MyStr";
import HasHash from "../components/class/GetHash/HasHash";
import { ErrCode } from "../DataSchema/ENum";
import { AnyObject, HasUpID, IBasePayRateItm, IBetItem, IBTItem, ICommonParams, IDayReport, IDbAns, IDfOddsItems,
    IGameDataCaption , IGameItem , IGameResult, IHashAna, IHasID, IMOdds, IMsg, IParamLog, IProbTable} from "../DataSchema/if";
import {IDBAns, IGame, IPayClassParam, IPayRateItm, ITerms, IUser, IUserPartial} from "../DataSchema/user";
import { AddAuthHeader } from "../func/ccfunc";
import { getUserCredit } from "../func/Credit";
import { doQuery, getConnection, IAxParams, JWT_KEY } from "../func/db";
import { getUserLogin } from "./agentApi";

const app: Router = express.Router();
const eds = new EDS(process.env.NODE_ENV);
interface IProgs {
    id: number;
    Title: string;
    Paths: string;
    icon: string;
    Funcs: string;
}
interface IPClass {
    GameID: number;
    PayClassID: number;
}
export interface ILoginInfo extends AnyObject {
    id: number;
    Account: string;
    uid: string;    // 唯一值 unigue key for all sites
    meta?: AnyObject;
    exp?: number;    // 資料到期截止時間
    sid?: string;
    Levels?: number;
    Types?: number;
    isTwoPassAsked?: number;
    forcePWChange?: number;
    isChkGA?: number;
    Progs?: IProgs[];
    PayClass?: IPClass[];
}
app.get("/login", async (req: Request, res: Response) => {
    // console.log("AdminApi login param:", req.query);
    const conn: mariadb.PoolConnection|undefined =  await getConnection("AdminApi login");
    const msg: IMsg = { ErrNo: 0};
    let logkey: string|undefined;
    if (conn) {
        const param: any = req.query;
        let login: any = null;
        if (param.token) {
            const Account = param.userCode as string;
            const token = param.token as string;
            if (!Account || !token) {
                msg.ErrNo = ErrCode.MISS_PARAMETER;
                msg.ErrCon = "Miss Parameters!!";
                await conn.release();
                res.send(StrFunc.stringify(msg));
                return;
            }
            login = await getUserLogin(Account, token, conn);
        }
        let sql: string = "";
        let params: any = [];
        if (!login) {
            const Account: string = `${param.Account}`;
            const Password: string = `${param.Password}`;
            params = [Account, Password];
            sql = `Select * from User where Account= ? and Password=Password(?)`;
        } else {
            params = [login.uid];
            sql = `Select * from User where id = ?`;
        }
        // console.log("AdminApi login", sql, params);
        const ans = await doQuery(sql, conn, params);
        if (ans) {
            if (ans.length > 0) {
                const user: IUser = ans.pop();
                const info: ILoginInfo = {
                    id: user.id,
                    Account: user.Account,
                    uid: `${JWT_KEY}@${user.Account}@${user.id}`,
                    Levels: user.Levels,
                    Types: user.Types,
                    isTwoPassAsked: user.isTwoPassAsked,
                    forcePWChange: user.forcePWChange,
                    isChkGA: user.isChkGA,
                    Progs: []
                };
                if (user.PayClass) {
                    // console.log("PayClass:", user.PayClass);
                    info.PayClass = JSON.parse(user.PayClass.replace(/\\/g, "")) as IPClass[];
                }
                const programs = user.Programs ? user.Programs : "";
                const progs = await afunc.getPrograms(user.Levels, programs, conn);
                if (progs) {
                    info.Progs = progs as IProgs[];
                }
                logkey = await setLogin(param.remoteIP, user.id, user.Account, conn);
                if (logkey) {
                    info.sid = logkey ;
                    msg.data = info;
                    msg.wsServer = process.env.WS_SERVER;
                    msg.chatServer = process.env.WS_CHATSERVER;
                    // msg.chatServer = "6ojrsmeztg.execute-api.ap-southeast-1.amazonaws.com/dev";
                    msg.chatSite = process.env.SITE_NAME;
                } else {
                    msg.ErrNo = 9;
                    msg.ErrCon = "login error!!";
                }
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "user not found";
            }
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "user not found";
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    if (msg.data) {
        /*
        const jsign = jwt.sign(msg.data as ILoginInfo, JWT_KEY, {expiresIn: AuthExpire});
        res.setHeader("AuthKey", AuthKey);
        res.setHeader("Authorization", jsign);
        res.setHeader("AuthLimit", AuthLimit);
        res.setHeader("Access-Control-Expose-Headers", "Authorization, AuthKey, AuthLimit");
        */
        const user = msg.data as ILoginInfo;
        user.uid = user.Account;
        user.meta = { nickname: user.Account };
        user.site = process.env.SITE_NAME;
        user.identity = 1;
        res = AddAuthHeader(user, res);
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/logout", async (req, res) => {
    const conn: mariadb.PoolConnection|undefined =  await getConnection("AdminApi logout");
    const msg: IMsg = { ErrNo: 0};
    if (conn) {
        const param = req.query;
        const UserID: number = param.UserID ? parseInt(param.UserID as string, 10) : 0;
        const sid: string = `${param.sid}`;
        const params: IAxParams = [UserID, sid];
        const sql = `update LoginInfo set isActive=0 where uid=? and logkey=?`;
        const ans = await doQuery(sql, conn, params);
        if (ans) {
            msg.data = ans;
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getGAImg", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const param = req.query;
    if (!param.UserID) {
        msg.ErrNo = 9;
        msg.ErrCon = "Missing UserID!!";
    }
    if (!param.AppName) {
        msg.ErrNo = 9;
        msg.ErrCon = "Missing AppName!!";
    }
    if (msg.ErrNo !== 0) {
        res.send(StrFunc.stringify(msg));
    }
    const conn = await getConnection("AdminApi getGAImg");
    if (conn) {
        const jt: JTable<IUser> = new JTable(conn, "User");
        const AppName: string = param.AppName ? `param.AppName` : "";
        const UserID: number = param.UserID ? parseInt(param.UserID as string, 10) : 0;
        const user: IUser|undefined = await jt.getOne(UserID);
        if (user) {
            const GA = new GoogleAuth();
            const p: IParamForGoogleAuth = {
                AppName,
                AppInfo: user.Account,
                SecretCode: GA.SecretCode,
            };
            const ans = await GA.getIMG(p);
            console.log("getGAImg", ans);
            if (ans) {
                msg.ErrCon = ans;
                const userp: IUserPartial = {
                    id: UserID,
                    isChkGA: 1
                };
                userp.GAAppName = p.AppName;
                userp.GACode = p.SecretCode;
                const tmp = await afunc.setUser(userp, conn);
                if (!tmp) {
                    msg.ErrNo = 9;
                    msg.ErrCon = "Save user error!!";
                }
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Error!!";
            }
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Find  user error!!";
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/GAValidate", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const param = req.query;
    if (!param.UserID) {
        msg.ErrNo = 9;
        msg.ErrCon = "Missing UserID!!";
    }
    if (!param.Pin) {
        msg.ErrNo = 9;
        msg.ErrCon = "Missing Pin Code!!";
    }
    if (msg.ErrNo !== 0) {
        res.send(StrFunc.stringify(msg));
    }
    const conn = await getConnection("AdminApi GAValidate");
    if (conn) {
        const jt: JTable<IUser> = new JTable(conn, "User");
        const UserID: number = param.UserID ? parseInt(param.UserID as string, 10) : 0;
        const user: IUser|undefined = await jt.getOne(UserID);
        if (user) {
            const GA = new GoogleAuth();
            const p: IGAValidate = {
                Pin: `${param.Pin}`,
                SecretCode: user.GACode ? user.GACode : ""
            };
            const ans = await GA.Validate(p);
            // console.log("Validate", ans);
            if (ans === "True") {
                msg.ErrCon = ans as string;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Error!!";
            }
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Find  user error!!";
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getPrograms", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("AdminApi getPrograms");
    if (conn) {
        const ans = await afunc.getPrograms(9, "", conn);
        if (!ans) {
            msg.ErrNo = 9;
            msg.ErrCon = "get Programs error!!";
        } else {
            msg.data = ans;
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getProbTable", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const param = req.query;
    if (!param.GType) {
        msg.ErrNo = 9;
        msg.ErrCon = "Missing GType!!";
    }
    if (msg.ErrNo !== 0) {
        res.send(StrFunc.stringify(msg));
    }
    const conn = await getConnection("AdminApi getProbTable");
    if (conn) {
       const jt: JTable<IProbTable> = new JTable(conn, "ProbabilityTable");
       const ans = await jt.List({Key: "GType", Val: `${param.GType}`});
       if (ans) {
           msg.data = ans;
       } else {
           msg.ErrNo = 9;
           msg.ErrCon = "Data not found!!!";
       }
       await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/SetUser", async (req, res) => {
    const param = req.query;
    const msg: IMsg = {ErrNo: 0};
    let SetUserID: number = param.SetUserID ? parseInt(param.SetUserID as string, 10) : 0;
    if (!SetUserID) {
        SetUserID =  param.UserID ? parseInt(param.UserID as string, 10) : 0;
    }
    const user: IUserPartial = {
        id: SetUserID
    };
    if (param.isTwoPassAsked) { user.isTwoPassAsked = parseInt(param.isTwoPassAsked as string, 10); }
    if (param.Programs) { user.Programs = `${param.Programs}`; }
    if (param.isChkGA) { user.isChkGA = parseInt(param.isChkGA as string, 10); }
    // console.log("SetUser", param, user);
    const conn = await getConnection("AdminApi SetUser");
    if (conn) {
        const ans = await afunc.setUser(user, conn);
        if (!ans) {
            msg.ErrNo = 9;
            msg.ErrCon = "Upate user error!!!";
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.post("/ResetPassword", async (req, res) => {
    const conn: mariadb.PoolConnection|undefined =  await getConnection("AdminApi ResetPassword");
    const msg: IMsg = { ErrNo: 0};
    if (conn) {
        const param = req.body;
        console.log("ResetPassword param", param);
        // const chk = await chkLogin(param.UserID, param.sid, conn);
        // if (chk) {
        const sql = `update User set Password=PASSWORD(?),forcePWChange=0 where id=?`;
        const ans = await doQuery(sql, conn, [param.NPassword, param.WhosID]);
        if (ans) {
                console.log("ChangePassword", ans);
                msg.data = ans;
                const dbAns: IDbAns = ans as IDbAns;
                if (dbAns.affectedRows < 1) {
                    msg.ErrNo = 9;
                    msg.ErrCon = "Fail!!";
                }
            }
        // } else {
        //    msg.ErrNo = ErrCode.NO_LOGIN;
        //    msg.ErrCon = "NO LOGIN INFO";
        // }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.post("/ChangePassword", async (req, res) => {
    const conn: mariadb.PoolConnection|undefined =  await getConnection("AdminApi ChangePassword");
    const msg: IMsg = { ErrNo: 0};
    if (conn) {
        const param = req.body;
        console.log("ChangePassword param", param);
        // const chk = await chkLogin(param.UserID, param.sid, conn);
        // if (chk) {
        const sql = `update User set Password=PASSWORD(?),forcePWChange=0 where id=? and Password=PASSWORD(?)`;
        const ans = await doQuery(sql, conn, [param.NPassword, param.UserID, param.OPassword]);
        if (ans) {
                console.log("ChangePassword", ans);
                msg.data = ans;
                const dbAns: IDbAns = ans as IDbAns;
                if (dbAns.affectedRows < 1) {
                    msg.ErrNo = 9;
                    msg.ErrCon = "Fail!!";
                }
            }
        // } else {
        //    msg.ErrNo = ErrCode.NO_LOGIN;
        //    msg.ErrCon = "NO LOGIN INFO";
        // }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getSysInfo", async (req, res) => {
    const conn = await getConnection("AdminApi getSysInfo");
    const msg: IMsg = {ErrNo: 0};
    if (conn) {
        const sql = "select * from SysInfo limit 0,1";
        const ans = await doQuery(sql, conn);
        if (ans) {
            msg.data = ans[0];
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "SysInfo not found!!";
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getGames", async (req, res) => {
  const conn = await getConnection("AdminApi getGames");
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
      const param = req.query;
      const sql = `select id,name,GType,OpenNums from Games
        where ${parseInt(param.showall as string, 10) ? 1 : "GType != ''"}
        order by ${parseInt(param.order as string, 10) ? "MbrIfOrder" : "id"}`;
      // console.log("getGames:", param, sql);
      const ans = await doQuery(sql, conn);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Games not found!!";
      }
      await conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
  }
  res.send(StrFunc.stringify(msg));
});
app.get("/member/GameResult", async (req, res) => {
    const conn = await getConnection("AdminApi GameResult");
    const msg: IMsg = {ErrNo: 0};
    if (conn) {
        const param = req.query;
        console.log("m_stirsbead_result", param);
        const sql = "select TermID,PTime,Result,SpNo,isSettled from Terms where GameID = ? and isSettled order by id desc limit 0,20";
        const ans = await doQuery(sql, conn, [parseInt(param.GameID as string, 10)]);
        if (ans) {
            const gr: IGameResult[] = [];
            ans.map((itm) => {
                const tmp: IGameResult = {
                    GameTime: itm.PTime,
                    NumberNormal: itm.Result,
                    NumberSpecial: itm.SpNo,
                    SerialNo: itm.TermID,
                    isCancel: itm.isSettled === 2 ? "1" : "0"
                };
                gr.push(tmp);
            });
            msg.data = gr;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Games not found!!";
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.post("/saveBtClass", async (req, res) => {
  const conn = await getConnection("AdminApi saveBtClass");
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
      const param = req.body;
      const params = [param.GameID, param.BCName, param.BetTypes, param.ModifyID];
      const sql = "insert into BetClass(GameID,BCname,BetTypes,ModifyID) values(?,?,?,?) on duplicate key update BetTypes=values(BetTypes),ModifyID=values(ModifyID)";
      const ans = await doQuery(sql, conn, params);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrCon = "Save BetType class error!!";
      }
      await conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
  }
  res.send(StrFunc.stringify(msg));
});
app.get("/getBtClass", async (req, res) => {
  const conn = await getConnection("AdminApi getBtClass");
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
      const param = req.query;
      const params = [parseInt(param.GameID as string, 10)];
      const sql = "select id,BCName,BetTypes from BetClass where GameID = ?";
      const ans = await doQuery(sql, conn, params);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrCon = "BetClass Not found!!";
      }
      await conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
  }
  res.send(StrFunc.stringify(msg));
});
app.get("/delBtClass", async (req, res) => {
  const conn = await getConnection("AdminApi delBtClass");
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
      const param = req.query;
      const params = [parseInt(param.GameID as string, 10), `${param.BCName}`];
      const sql = "delete from BetClass where GameID=?  and BCName=?";
      const ans = await doQuery(sql, conn, params);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrCon = "BetClass delete fail!!";
      }
      await conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
  }
  res.send(StrFunc.stringify(msg));
});
app.get("/getPayClass", async (req, res) => {
  const conn = await getConnection("AdminApi getPayClass");
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
    const param = req.query;
    const ans = await getPayClass(conn, param.GameID as string);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = ans;
    }
    await conn.release();
  } else {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
  }
  res.send(StrFunc.stringify(msg));
});
app.post("/savePayClass", async (req, res) => {
  const msg: IMsg = {ErrNo: 0};
  const conn = await getConnection("AdminApi savePayClass");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.body;
  // console.log("param chk", param);
  const params = [param.GameID, param.PayClassName, param.ModifyID];
  const sql = `insert into PayClass(GameID,PayClassName,ModifyID) values(?,?,?) on duplicate key update PayClassName=values(PayClassName),ModifyID=values(ModifyID)`;
  let rlt: IDBAns = {
      affectedRows: 0,
      insertId: 0,
      warningStatus: 0
  };
  await conn.query(sql, params).then((v) => {
      // console.log("savePayClass", v);
      // res.send(StrFunc.stringify(v));
      rlt = v;
  }).catch(async (err) => {
      console.log("savePayClass error", err);
      await conn.release();
      msg.ErrNo = 9;
      msg.debug = err;
      res.send(StrFunc.stringify(msg));
  });
  let ans;
  if (param.data) {
      ans = await afunc.setPayRateData(param.GameID, rlt.insertId, param.ModifyID, param.data, conn);
  } else {
      const cond = JSON.parse(param.condition.replace(/\\/g, ""));
      const p: IPayClassParam = {
          GameID: param.GameID,
          PayClassID : rlt.insertId,
          ModifyID: param.ModifyID ,
          RateType: cond.type
      };
      if (cond.type < 3) {
          p.RateDiff = cond.param;
          ans = await afunc.setPayRate(p, conn);
      } else {
          p.RateCond = cond.param;
          ans = await afunc.setPayRate(p, conn);
      }
  }
  if (!ans) {
      msg.ErrNo = 9;
  }
  msg.debug = ans;
  // console.log("savePayClass", msg);
  await conn.release();
  res.send(StrFunc.stringify(msg));

});
app.get("/editPayClass", async (req, res) => {
  const param = req.query;
  const msg: IMsg = {ErrNo: 0};
  const conn = await getConnection("AdminApi editPayClass");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  // console.log("param chk", param);
  const params = [param.PayClassName, param.ModifyID, param.id];
  const sql = `update PayClass set PayClassName=?,ModifyID=? where id=?`;
  let rlt: IDBAns = {
      affectedRows: 0,
      insertId: 0,
      warningStatus: 0
  };
  await conn.query(sql, params).then((v) => {
      // console.log("savePayClass", v);
      // res.send(StrFunc.stringify(v));
      rlt = v;
      msg.data = rlt;
  }).catch((err) => {
      console.log("savePayClass error", err);
      msg.ErrNo = 9;
      msg.debug = err;
  });
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.get("/delPayClass", async (req, res) => {
  const param = req.query;
  const msg: IMsg = {ErrNo: 0};
  const conn = await getConnection("AdminApi delPayClass");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  // console.log("param chk", param);
  const params = [param.id];
  const chk = await afunc.isPayClassUsed(param.GameID as string, param.id as string, conn);
  // console.log("delPayClass chk", chk);
  if (chk) {
      msg.ErrNo = 9;
      msg.ErrCon = "PayClass in used!!";
      await conn.release();
      res.send(StrFunc.stringify(msg));
  }
  await conn.beginTransaction();
  let sql = `delete from  PayClass where id=?`;
  let rlt: IDBAns = {
      affectedRows: 0,
      insertId: 0,
      warningStatus: 0
  };
  await conn.query(sql, params).then((v) => {
      // console.log("savePayClass", v);
      // res.send(StrFunc.stringify(v));
      rlt = v;
      if (rlt.affectedRows <= 0) {
          msg.ErrNo = 9;
          msg.ErrCon = "Delete PayClass Error!!";
      }
  }).catch((err) => {
      console.log("savePayClass error", err);
      msg.ErrNo = 9;
      msg.debug = err;
  });
  if (msg.ErrNo === 0) {
      sql = "delete from PayRate where PayClassID=?";
      await conn.query(sql, params).then((v) => {
          if (!v) {
            msg.ErrNo = 9;
            msg.ErrCon = "Delete PayRate Error!!";
          }
          /*
          if (rlt.affectedRows <= 0) {
              msg.ErrNo = 9;
              msg.ErrCon = "Delete PayRate Error!!";
          }
          */
      }).catch((err) => {
          console.log("savePayRate error", err);
          msg.ErrNo = 9;
          msg.debug = err;
      });
  }
  if (msg.ErrNo === 0) {
      conn.commit();
  } else {
      conn.rollback();
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.get("/getBasePayRate", async (req, res) => {
  const conn = await getConnection("AdminApi getBasePayRate");
  const msg: IMsg = {ErrNo: 0};
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.query;
  const params = [param.GameID as string];
  const sql = `select p.BetType,p.SubType,NoAdjust,Profit,DfRate,TopRate,
        p.Probability,p.isParlay,Steps,TopPay,OneHand,TotalNums,UseAvg,SingleNum,UnionNum,MinHand,MaxHand,
        BetForChange,StepsGroup,ChangeStart,PerStep,ChaseNum
        from ProbabilityTable p left join BasePayRate b on  p.GType=b.GType and p.BetType=b.BetType and p.SubType=b.SubType where GameID = ?`;
  // console.log("getBasePayRate:", sql, params);
  let ans = await doQuery(sql, conn, params);
  if (ans) {
      if (ans.length) {
        msg.data = ans;
      } else {
        ans = createBasePayRate(param.GameID, conn);
        if (ans) {
            ans = await doQuery(sql, conn, params);
            if (ans) {
                msg.data = ans;
            }
        }
      }
  }
  if (!msg.data) {
    msg.ErrNo = 9;
    msg.ErrCon = "getBasePayRate error";
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.get("/getPayRate", async (req, res) => {
  const conn = await getConnection("AdminApi getPayRate");
  const msg: IMsg = {ErrNo: 0};
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.query;
  /*
  const params = [param.PayClassID, param.GameID];
  const sql = `select p.BetType,p.SubType,b.DfRate,p.Rate,a.Probability,b.PerStep,b.MinHand,b.MaxHand
      from ProbabilityTable a left join BasePayRate b
        on a.GType=b.GType and a.BetType=b.BetType and a.SubType=b.SubType
        left join PayRate p
        on b.GameID=p.GameID and b.BetType = p.BetType and b.SubType = p.SubType
        where p.PayClassID=? and p.GameID = ?`;
   */
  const params = [param.GameID as string, param.GameID as string, param.PayClassID as string];
  const sql = `select k.*,p.Rate from
    (select b.GameID,b.SubType,a.BetType,b.DfRate,a.Probability,b.PerStep,b.MinHand,b.MaxHand
        from ProbabilityTable a LEFT join BasePayRate b
        on a.GType=b.GType and a.BetType=b.BetType and a.SubType=b.SubType where b.GameID=?) as k
        left join
    (select * from PayRate where GameID=? and PayClassID = ? ) as p
        on k.GameID=p.GameID and k.BetType = p.BetType and k.SubType = p.SubType where 1`;
  const ans = await doQuery(sql, conn, params);
  if (ans) {
      msg.data = ans;
  } else {
      msg.ErrNo = ErrCode.NOT_DEFINED_ERR;
      msg.ErrCon = "getPayRate error";
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.get("/getGameType", async (req, res) => {
    const conn = await getConnection("AdminApi getGameType");
    const msg: IMsg = {ErrNo: 0};
    if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
      res.send(StrFunc.stringify(msg));
      return;
    }
    const sql = `select GType,OpenNums,OpenSP,StartNum,EndNum,SameNum from GameType where 1`;
    const ans = await doQuery(sql, conn);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = ErrCode.NOT_DEFINED_ERR;
        msg.ErrCon = "getGameType error";
    }
    await conn.release();
    res.send(StrFunc.stringify(msg));
});
app.post("/batch/saveBasePayRate", async (req, res) => {
    const conn = await getConnection("AdminApi saveBasePayRate");
    const msg: IMsg = {ErrNo: 0};
    if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
      res.send(StrFunc.stringify(msg));
      return;
    }
    const param = req.body;
    // console.log("saveBasePayRate", param);
    const datas: IBasePayRateItm[] = JSON.parse(param.data.replace(/\\/g, ""));
    console.log("saveBasePayRate", datas);
    datas.map((itm) => {
        itm.GameID = param.GameID;
        itm.GType = param.GType;
        // itm.StepsGroup = StrFunc.stringify(itm.StepsGroup);
        itm.ModifyID = param.ModifyID;
    });
    const jt: JTable<IBasePayRateItm> = new JTable(conn, "BasePayRate");
    const ans = jt.MultiUpdate(datas);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = 9;
    }
    await conn.release();
    res.send(StrFunc.stringify(msg));
});
app.post("/batch/saveBasePayRate1", async (req, res) => {
  const conn = await getConnection("AdminApi saveBasePayRate1");
  const msg: IMsg = {ErrNo: 0};
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.body;
  // console.log(param);
  param.data = JSON.parse(param.data.replace(/\\/g, ""));
  const valstr: string[] = [];
  param.data.map((itm: IBasePayRateItm) => {
      if (!itm.SubTitle) { itm.SubTitle = ""; }
      if (!itm.Profit) { itm.Profit = 0; }
      if (!itm.DfRate) { itm.DfRate = 0; }
      if (!itm.TopRate) { itm.TopRate = 0; }
      // if (!itm.Probability) { itm.Probability = 0; }
      if (!itm.Steps) { itm.Steps = 0; }
      const tmp = `(${param.GameID},${itm.BetType},'${itm.Title}','${itm.SubTitle}',${itm.SubType},${itm.NoAdjust},${itm.Profit},${itm.DfRate},${itm.TopRate},${itm.Steps},${itm.TopPay},${itm.OneHand},${param.ModifyID})`;
      valstr.push(tmp);
  });
  let sql = "insert into BasePayRate(GameID,BetType,Title,SubTitle,SubType,NoAdjust,Profit,DfRate,TopRate,Steps,TopPay,OneHand,ModifyID) values";
  sql += valstr.join(",");
  sql += " ON DUPLICATE KEY UPDATE NoAdjust=values(NoAdjust),Profit=values(Profit),DfRate=values(DfRate),TopRate=values(TopRate),Steps=values(Steps),TopPay=values(TopPay),OneHand=values(OneHand),ModifyID=values(ModifyID)";
  await conn.query(sql).then(async (v) => {
      console.log("getPayRate", sql, v);
      await conn.release();
      res.send(StrFunc.stringify(v));
  }).catch(async (err) => {
      console.log("getPayRate error", err);
      await conn.release();
      res.send(StrFunc.stringify(err));
  });
});
app.post("/batch/savePayRate", async (req, res) => {
  const conn = await getConnection("AdminApi savePayRate");
  const msg: IMsg = {ErrNo: 0};
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.body;
  // console.log("savePayRate", req.body);
  param.data = JSON.parse(param.data.replace(/\\/g, ""));
  const valstr: string[] = [];
  param.data.map((itm: IPayRateItm) => {
      const tmp = `(${param.PayClassID},${param.GameID},${itm.BetType},${itm.SubType},${itm.Rate})`;
      valstr.push(tmp);
  });
  let sql: string = "insert into PayRate(PayClassID,GameID,BetType,SubType,Rate) values";
  sql += valstr.join(",");
  sql += " ON DUPLICATE KEY UPDATE Rate=values(Rate)";
  await conn.query(sql).then(async (v) => {
      await conn.release();
      res.send(StrFunc.stringify(v));
  }).catch(async (err) => {
      console.log("savePayRate error", err);
      await conn.release();
      res.send(StrFunc.stringify(err));
  });
});
app.post("/batch/saveProbTable", async (req, res) => {
    const conn = await getConnection("AdminApi saveProbTable");
    const msg: IMsg = {ErrNo: 0};
    if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
      res.send(StrFunc.stringify(msg));
      return;
    }
    const param = req.body;
    // console.log("saveBasePayRate", param);
    const datas: IProbTable[] = JSON.parse(param.data.replace(/\\/g, ""));
    // console.log("saveProbTable", datas);
    datas.map((itm) => {
        // itm.StepsGroup = StrFunc.stringify(itm.StepsGroup);
        itm.ModifyID = param.ModifyID;
    });
    const jt: JTable<IProbTable> = new JTable(conn, "ProbabilityTable");
    const ans = jt.MultiUpdate(datas);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = 9;
    }
    await conn.release();
    res.send(StrFunc.stringify(msg));
});
app.post("/saveTerms", async (req, res) => {
  const param: ICommonParams = req.body;
  let msg: IMsg = {
      ErrNo: 0,
      ErrCon: ""
  };
  let GameID: number|string = 0;
  let GType: string = "";
  let ans;
  if (param) {
      if (!param.TermID) {
          msg.ErrNo = 9;
          msg.ErrCon = "TermID is Empty!!";
      }
      if (!param.GameID) {
          msg.ErrNo = 9;
          msg.ErrCon = "GameID is Empty!!";
      } else {
          GameID = param.GameID;
      }
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "All params is empty!!";
  }
  if (msg.ErrNo !== 0) {
      res.send(StrFunc.stringify(msg));
      return;
  }
  const conn = await getConnection("AdminApi saveTerms");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  ans = await afunc.chkTermIsSettled(GameID, conn);
  // console.log("chkTermIsSettled", ans);
  // res.send(StrFunc.stringify(ans));
  if (!ans) {
      const gans = await getGame(GameID as number, conn);
      if (gans) {
          GType = gans.GType;
      }
      if (!GType) {
        msg.ErrNo = 9;
        msg.ErrCon = "find GType error!!";
        await conn.release();
        res.send(StrFunc.stringify(msg));
        return;
      }
      const term: ITerms = {
            id: param.id ? param.id : 0,
            GameID: param.GameID ? param.GameID as number : 0,
            TermID: param.TermID as string,
            PDate: param.PDate as string,
            PTime: param.PTime as string,
            StopTime: param.StopTime as string,
            StopTimeS: param.StopTimeS as string,
            ModifyID: param.ModifyID ? param.ModifyID : 0
        };
      msg = await afunc.createTerms(GType, term, conn, param.PLog as IParamLog[]);
      await conn.release();
      res.send(StrFunc.stringify(msg));
        /*
      const params = [
          param.GameID, param.TermID, param.PDate, param.PTime, param.StopTime, param.StopTimeS, param.ModifyID];
      const fields = ["GameID", "TermID", "PDate", "PTime", "StopTime", "StopTimes", "ModifyID"];
      const values = ["?", "?", "?", "?", "?", "?", "?"];
      const extSql = ` on duplicate key update
          TermID=values(TermID),PDate=values(PDate),PTime=values(PTime),
          StopTime=values(StopTime),StopTimeS=values(StopTimeS),ModifyID=values(ModifyID)
      `;
      if (param.id) {
          params.push(param.id);
          fields.push("id");
          values.push("?");
      }
      let sql = `insert into Terms(${fields.join(",")})
          values(${values.join(",")})`;
      if (param.id) {
          sql = sql + extSql;
      }
      let tid;
      await conn.beginTransaction();
      await conn.query(sql, params).then(async (row) => {
          // res.send(StrFunc.stringify(row));
          ans = row;
          msg.ErrCon = row;
          tid = row.insertId;
          if (param.ParamLog) {
            await saveParamLog(param.ParamLog as IParamLog[], conn);
          }
      }).catch((err) => {
          // ans=err;
          console.log(err);
          msg.ErrNo = 8;
          msg.ErrCon = err;
          msg.debug = sql + ">>" + params.join(",");
          // res.send(StrFunc.stringify(err));
      });
      if (ans) {
          if (!param.id) {
              const codAns = await afunc.CreateOddsData(GameID, GType, tid, conn);
              if (codAns.ErrNo !== 0) {
                      await conn.rollback();
                      await conn.release();
                      res.send(StrFunc.stringify(codAns));
              }
          }
          await conn.commit();
      } else {
          await conn.rollback();
          msg.ErrNo = 9;
          msg.ErrCon = "Error!!";
      }
      await conn.release();
      res.send(StrFunc.stringify(msg));
      */
  }
});
app.get("/getTerms", async (req, res) => {
  const msg: IMsg = {
    ErrNo: 0,
    ErrCon: ""
  };
  const conn = await getConnection("AdminApi getTerms");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.query;
  const pa: string[] = [];
  const GameID: number = parseInt(param.GameID as string, 10);
  const ans = await getGame(GameID, conn);
  let GType = "";
  if (ans) {
      msg.Game = ans;
      GType = ans.GType;
  }
  const pdate = await getTermDateNotSettled(GameID, conn);
  if (pdate) {
      msg.PDate = pdate;
  }
  let sql = "select t.*,u.Nickname UserName from Terms t left join User u on t.ModifyID = u.id  where GameID=? ";
  pa.push(param.GameID as string);
  if (param.SDate) {
      sql = sql + " and PDate=? ";
      pa.push(param.SDate as string);
  }
  sql = sql + "order by t.id desc limit 0,20";
  // console.log("getTerms", sql, pa);
  const tans = await doQuery(sql, conn, pa);
  await new HasHash().check(tans, msg.Game.GType);
  // console.log("end HasHash");
  msg.data = tans;
  /*
  if (tans) {
        let chkAnimal = false;
        let hasZero = false;
        if (GType === "MarkSix") {
            chkAnimal = true;
        } else if (GType === "HashSix") {
            chkAnimal = true;
            hasZero = true;
        }
        tans = tans.map((itm: AnyObject) => {
            if (chkAnimal) { itm.Zodaic = getAnimals(hasZero, DateFunc.getDate(itm.PDate)); }
            itm.GType = GType;
            return itm;
        });
        msg.data = tans;
  }
  */
  /*
  await conn.query(sql, pa).then((rows) => {
      // console.log("getTerms", rows);
      msg.data = rows;
  }).catch((err) => {
      msg.ErrNo = 9;
      msg.ErrCon = err;
  });
  */
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.post("/createBetItems", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi createBetItems");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.body;
  if (!param.GType) {
    msg.ErrNo = 9;
    msg.ErrCon = "Miss param GType!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  if (!param.ModifyID) {
    msg.ErrNo = 9;
    msg.ErrCon = "Miss param ModifyID!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const GType = param.GType;
  const ModifyID = param.ModifyID;
  // console.log("createBetItems data:", param.data);
  const data: IBetItem[] = JSON.parse(param.data.replace(/\\/g, ""));
  const val: string[] = [];
  data.map((itm) => {
      const tmp: string = `('${GType}',${itm.BetType},'${itm.Num}',${ModifyID})`;
      // console.log(tmp);
      val.push(tmp);
  });
  if (data.length <= 0) {
      msg.ErrNo = 9;
      msg.ErrCon = "No Data !!!";
      await conn.release();
      res.send(StrFunc.stringify(msg));
  }
  let sql = "insert into dfOddsItems(GType,BetType,Num,ModifyID) values";
  sql = sql + val.join(",");
  console.log("sql:", sql);
  await conn.query(sql).then(async (row) => {
      msg.data = row;
      await conn.release();
      res.send(StrFunc.stringify(msg));
  }).catch(async (err) => {
      msg.error = err;
      msg.ErrNo = 9;
      await conn.release();
      res.send(StrFunc.stringify(msg));
  });

});
app.get("/getDfOddsItem", async (req, res) => {
    const msg: IMsg = { ErrNo: 0};
    const conn = await getConnection("AdminApi getDfOddsItem");
    if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
      res.send(StrFunc.stringify(msg));
      return;
    }
    const sql = "select * from dfOddsItems where 1";
    const ans = await doQuery(sql, conn);
    if (ans) {
        msg.data = ans;
    } else {
        console.log("getDfoddsItem", ans);
    }
    await conn.release();
    res.send(StrFunc.stringify(msg));
});
app.post("/saveGameCaption", async (req, res) => {
    const msg: IMsg = { ErrNo: 0};
    const conn = await getConnection("AdminApi saveGameCaption");
    if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
      res.send(StrFunc.stringify(msg));
      return;
    }
    const jt: JTable<IGameDataCaption> = new JTable(conn, "GameDataCaption");
    const param = req.body;
    const Game = param.Game;
    const BetType = param.BetType;
    const gdc: IGameDataCaption = {
        id: 1,
        Game: param.Game.replace(/\\"/g, '"'),
        BetType: param.BetType.replace(/\\"/g, '"')
    };
    // console.log("UpdateGame", param);
    const ans = await jt.Update(gdc);
    if (ans) {
        msg.data = ans;
    } else {
       msg.ErrNo = 9;
       msg.ErrCon = "GameDataCaption update error!!";
    }
    // console.log("UpdateGame", ans);
    await conn.release();
    res.send(StrFunc.stringify(msg));
});
app.get("/GameList", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi GameList");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const jt: JTable<IGame> = new JTable(conn, "Games");
  const games: IGame[] | undefined = await jt.List();
  // console.log("AdminApi /GameList", StrFunc.stringify(games));
  if (games) {
      msg.data = games;
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.post("/UpdateGame", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi UpdateGame");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const jt: JTable<IGame> = new JTable(conn, "Games");
  const param = req.body;
  const UserID = param.UserID;
  const sid = param.sid;
  if (UserID) { delete param.UserID; }
  if (sid) { delete param.sid; }
  console.log("UpdateGame", param);
  const ans = await jt.Update(param as IGame);
  if (ans) {
      msg.data = ans;
  } else {
     msg.ErrNo = 9;
     msg.ErrCon = "Game data update error!!";
  }
  // console.log("UpdateGame", ans);
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.post("/Save/:TableName", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi /Save/:TableName");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const TableName = req.params.TableName;
  // console.log("/api/Save/TableName param", req.body);
  const data: IBasePayRateItm[] = JSON.parse(req.body.params.data.replace(/\\/g, ""));
  const jt: JTable<IBasePayRateItm> = new JTable(conn, TableName);
  const ans = await jt.MultiUpdate(data);
  // console.log("/api/Save/:TableName ans:", ans);
  if (ans) {
      msg.data = ans;
  } else {
      msg.ErrNo = 9;
      msg.error = ans;
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.post("/SaveDfOddsItem", async (req, res) => {
    const msg: IMsg = { ErrNo: 0};
    const conn = await getConnection("AdminApi SaveDfOddsItem");
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "get connection error!!";
        res.send(StrFunc.stringify(msg));
        return;
    }
    // const param = req.body;
    // console.log("SaveDfOddsItem:", req.body);
    const table = "dfOddsItems";
    if (req.body.GType) {
        const sql = `delete from ${table} where GType = '${req.body.GType}'`;
        const dAns = await doQuery(sql, conn);
        if (!dAns) {
            msg.ErrNo = 9;
            msg.ErrCon = "Delete " + req.body.GType + " data error!!";
            res.send(StrFunc.stringify(msg));
            return;
        }
        console.log("Delete " + req.body.GType + ":", dAns);
    }
    const data: IDfOddsItems[] = JSON.parse(req.body.data.replace(/\\/g, ""));
    const jt: JTable<IDfOddsItems> = new JTable(conn, table);

    const ans = await jt.MultiInsert(data);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = 9;
        msg.error = ans;
    }
    await conn.release();
    res.send(StrFunc.stringify(msg));
});
app.get("/member/getAnimals", (req, res) => {
  res.send(StrFunc.stringify(getAnimals(true)));
});
app.get("/member/wagerLotto", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi wagerLotto");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.query;
  const games: IGameItem[] = await afunc.getGameList(conn);
  const btlist: IBTItem[] = await afunc.getBtList(param.GameID as string, conn);
  if (games) {
      msg.gameLists = games;
  }
  if (btlist) {
      msg.btLists = btlist;
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.get("/member/getOddsItems", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi getOddsItems");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.query;
  const UserID = parseInt(`${param.UserID}`, 10);
  const ans = await getOddsData(param.GameID as string, parseInt(param.PayClassID as string, 10), parseInt(param.maxOID as string, 10), conn);
  ans.Balance = await getUserCredit(UserID, conn);

  await conn.release();
  res.send(StrFunc.stringify(ans));
});
app.get("/member/mybalance", async (req, res) => {
    const msg: IMsg = { ErrNo: 0};
    const conn = await getConnection("AdminApi mybalance");
    if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
      res.send(StrFunc.stringify(msg));
      return;
    }
    const param = req.query;
    const UserID = parseInt(`${param.UserID}`, 10);
    msg.Balance = await getUserCredit(UserID, conn);

    await conn.release();
    res.send(StrFunc.stringify(msg));
});
app.post("/member/mwagermulti", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi mwagermulti");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.body;
  const UserID = param.UserID;
  const Account = param.Account;
  const tid = param.LNoID;
  const GameID = param.LottoID;
  const PayClassID = param.PayClassID;
  const UpId = param.UpId;
  // const btrans = await conn.beginTransaction();
  // console.log("Begin:", btrans);
  const snb: Bet = new Bet(UserID, Account, UpId , tid, GameID, PayClassID, conn);
  const ans: IMsg = await snb.AnaNum(param.WagerContent, param.ExtNumInfo);
  // console.log("mwagermulti:", ans);
  // if (ans.warningStatus === 0) {
  /*
  if (ans.ErrNo === 0) {
      const cmm = await conn.commit();
      console.log("Commit:", cmm);
  } else {
      const rback = await conn.rollback();
      console.log("Rollback:", rback);
  }
  */
  await conn.release();
  res.send(StrFunc.stringify(ans));
});
app.post("/member/mwagerone", async (req, res) => {
    const msg: IMsg = { ErrNo: 0};
    const conn = await getConnection("AdminApi mwagerone");
    if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
      res.send(StrFunc.stringify(msg));
      return;
    }
    const param = req.body;
    const UserID = param.UserID;
    const Account = param.Account;
    const UpId = param.UpId;
    const tid = param.LNoID;
    const GameID = param.LottoID;
    const PayClassID = param.PayClassID;
    // const btrans = await conn.beginTransaction();
    // console.log("Begin:", btrans);
    const snb: Bet = new Bet(UserID, Account, UpId, tid, GameID, PayClassID, conn);
    const ans: IMsg = await snb.ParOne(parseInt(param.wgtype, 10), param.OddsID, param.JoinNumber, parseInt(param.StakeMoney, 10));
    // if (ans.warningStatus === 0) {
        /*
    if (ans.ErrNo === 0) {
        const cmm = await conn.commit();
        console.log("Commit:", cmm);
    } else {
        const rback = await conn.rollback();
        console.log("Rollback:", rback);
    }
    */
    await conn.release();
    res.send(StrFunc.stringify(ans));
  });
app.post("/member/mwagerjn", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi mwagerjn");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.body;
  const UserID = Number(param.UserID);
  const Account = String(param.Account);
  const UpId = Number(param.UpId);
  const tid = Number(param.LNoID);
  const GameID = Number(param.LottoID);
  const PayClassID = Number(param.PayClassID);
  // const btrans = await conn.beginTransaction();
  let ans;
  // console.log("Begin:", btrans);
  const snb: Bet = new Bet(UserID, Account, UpId, tid, GameID, PayClassID, conn);
  if (GameID === 36) {
    ans = await snb.Keno(parseInt(param.wgtype, 10), param.JoinNumber, parseInt(param.StakeMoney, 10));
  } else {
    ans = await snb.Parlay(parseInt(param.wgtype, 10), param.OddsID, param.JoinNumber, parseInt(param.StakeMoney, 10));
  }
  // if (ans.warningStatus === 0) {
      /*
  if (ans.ErrNo === 0) {
      const cmm = await conn.commit();
      console.log("Commit:", cmm);
  } else {
      const rback = await conn.rollback();
      console.log("Rollback:", rback);
  }
  */
  await conn.release();
  res.send(StrFunc.stringify(ans));
});
app.get("/member/getWagerItems", async (req, res) => {
  let msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi getWagerItems");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.query;
  const gets: Gets = new Gets(conn);
  if (param.data === "") {
      param.date = JDate.DateStr;
  }
  msg = await gets.getBetLists(parseInt(param.UserID as string, 10), param.date as string);
  if (msg.ErrNo === ErrCode.PASS) {
      if (msg.items) {
          const gids = Object.keys(msg.items).map((key) => key);
          if (gids.length > 0) {
              const jt: JTable<IHasID> = new JTable(conn, "Games");
              const filter = `id in (${gids.join(",")})`;
              const fields = ["id", "GType"];
              const ans = await jt.List(filter, fields);
              // console.log("getWagerItems GType", ans);
              msg.GTypes = ans;
          }
      }
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.post("/SaveUser", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi SaveUser");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const qstring = req.body;
  if (qstring.UserID) {
      delete qstring.UserID;
      delete qstring.sid;
  }
  const param: IUser = qstring as IUser;
  const TableName: string = param.TableName ? param.TableName : "Member";
  const jt: JTable<IUser> = new JTable(conn, TableName);
  // console.log("SaveUser", param);
  let ans;
  if (param.id) {
      ans = await jt.Update(param);
  } else {
      ans = await jt.Insert(param);
  }
  await conn.release();
  res.send(StrFunc.stringify(ans));
});
app.get("/getUsers", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi getUsers");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.query;
  const params: ICommonParams = {};
  if (param.findString) {
      params.findString = param.findString as string;
  }
  if (param.userType !== undefined) {
    params.userType = parseInt(param.userType as string, 10);
  }
  if (param.UpId) {
      params.UpId = parseInt(param.UpId as string, 10);
  }
  if (param.OnlyID) {
      params.OnlyID = !!param.OnlyID;
  }
  let tb = "";
  if (param.userType === "0" ) { tb = "Member"; }
  const ans = await getUsers(conn, params, tb, true);
  if (tb) {
    const upids: number[] = [];
    ans.map((itm) => {
        const fid = upids.find((id) => id === itm.UpId);
        if (!fid) { upids.push(itm.UpId); }
    });
    if (upids.length > 0) {
        const up = await getUsers(conn, upids, "", true);
        ans.forEach((itm) => {
            const fup = up.find((upman) => upman.id === itm.UpId);
            if (fup) {
                itm.SiteName = fup.SiteName;
            }
            return itm;
        });
    }
  }
  if (ans) {
      msg.data = ans;
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "Get Users Error!!";
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.get("/member/getPayClass", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("AdminApi getPayClass");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.query;
  if (!param.GameID) {
      msg.ErrNo = 9;
      msg.ErrCon = "GameID is missing!!";
  } else {
      const ans = getPayClass(conn, param.GameID as string);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Get Pay Class Error!!";
      }
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});

app.post("/SaveNums", async (req, res) => {
  let msg: IMsg = { ErrNo: 0};
  const conn = await getConnection("SaveNums");
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(StrFunc.stringify(msg));
    return;
  }
  const param = req.body;
  // console.log("SaveNums", param);
  if (!param.GameID) {
      msg.ErrNo = 9;
      msg.ErrCon = "GameID is missing!!";
  }
  if (!param.Nums) {
      msg.ErrNo = 9;
      msg.ErrCon = "Nums is missing!!";
  }
  if (msg.ErrNo === 0) {
      msg = await SaveNums(param.tid, param.GameID, param.Nums, conn, param.isSettled, param.ParamLog);
      /*
      if (param.ParamLog) {
        await saveParamLog(param.ParamLog as IParamLog[], conn);
      }
      */
  }
  await conn.release();
  res.send(StrFunc.stringify(msg));
});
app.get("/CurOddsInfo", async (req, res) => {
  const msg: IMsg = {ErrNo: 0};
  const conn = await getConnection("AdminApi CurOddsInfo");
  if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "Connection error!!";
      res.send(StrFunc.stringify(msg));
  } else {
      const param = req.query;
      let tid: number | undefined = 0;
      if (!param.GameID) {
          msg.ErrNo = 9;
          msg.ErrCon = "GameID is missing!!";
          await conn.release();
          res.send(StrFunc.stringify(msg));
      }
      if (!param.tid) {
        // if (param.GameID === "21") { console.log("before getCurTermId", param.tid); }
        tid = await afunc.getCurTermId(param.GameID as string, conn);
        // if (param.GameID === "21") { console.log("before getCurTermId", tid); }
        if (!tid) {
              msg.ErrNo = 9;
              msg.ErrCon = "Get data error!!";
              await conn.release();
              res.send(StrFunc.stringify(msg));
          }
      } else {
          tid = parseInt(param.tid as string, 10);
      }
      msg.tid = tid;
      let MaxOddsID: number = 0;
      if (param.MaxOddsID) {
          MaxOddsID = parseInt(param.MaxOddsID as string, 10);
      }
      const PayClassID = param.PayClassID ? parseInt(String(param.PayClassID), 10) : 0;
      const ans = await afunc.getCurOddsInfo(tid as number, param.GameID as string, MaxOddsID, conn, PayClassID);
      if (ans) {
        msg.data = ans;
      } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get Odds error!";
      }
      await conn.release();
  }
  // console.log("CurOddsInfo", StrFunc.stringify(msg));
  try {
    res.send(StrFunc.stringify(msg));
  } catch (err) {
    console.log("Send to user error!!", err);
    res.send("");
  }
});
app.get("/setOdds", async (req, res) => {
  const msg: IMsg = {ErrNo: 0};
  const conn: mariadb.PoolConnection|undefined = await getConnection("AdminApi setOdds");
  if (!conn) {
      msg.ErrNo = 8;
      msg.ErrCon = "Database busy!!";
  } else {
      const param = req.query;
      // console.log("setOdds param", param);
      if (param.Step) {
        const tid = parseInt(param.tid as string, 10);
        const GameID = parseInt(param.GameID as string, 10);
        const BT = parseInt(param.BT as string, 10);
        const Num = parseInt(param.Num as string, 10);
        const UserID = parseInt(param.UserID as string, 10);
        const fOdds: IMOdds|undefined = await afunc.getOddsInfo(tid, GameID, BT, Num, conn);
        if (fOdds) {
              // msg.data = ans;
              // const step: number = param.Step;
              let odds: number = 0;
              let addOdds: number = 0;
              const Add: number = parseInt(param.Add as string, 10);
              const Step: number = parseFloat(param.Step as string);
              if (param.Add) {
                odds = fOdds.Odds + Add * Step;
              } else {
                addOdds = fOdds.Odds - Step;
                addOdds = addOdds - (addOdds % fOdds.Steps);
                odds = fOdds.Odds - addOdds;
              }
              console.log("before setOdds", odds, param.Add, Step, param.Step, fOdds);
              if (odds > fOdds.MaxOdds) {
                  odds = fOdds.MaxOdds;
              }
              if (odds < 1 ) { odds = 1; }
              if (odds !== fOdds.Odds) {
                  const ans = await afunc.setOdds(tid, GameID, BT, Num, odds, UserID, conn);
                  if (ans) {
                      msg.data = ans;
                      const isBSA = await afunc.isBothSideAdjust(GameID, BT, conn);
                      if (isBSA) {
                        const OTNum = getOtherSide(Num);
                        const OTOdds: IMOdds|undefined = await afunc.getOddsInfo(tid, GameID, BT, OTNum, conn);
                        console.log("BothSideAdjust", param.BT, param.Num, OTNum, OTOdds);
                        if (OTOdds) {
                            if (addOdds) {
                                odds = OTOdds.Odds + addOdds;
                            } else {
                                odds = OTOdds.Odds + Add * Step * -1;
                            }
                            if (odds > fOdds.MaxOdds) {
                                odds = fOdds.MaxOdds;
                            }
                            if (odds < 1) {
                                odds = 1;
                            }
                            if (odds !== OTOdds.Odds) {
                                await afunc.setOdds(tid, GameID, BT, OTNum, odds, UserID, conn);
                            }
                        }
                      }
                  } else {
                      msg.ErrNo = 9;
                      msg.ErrCon = "Set odds error!!";
                  }
              }
          } else {
              msg.ErrNo = 9;
              msg.ErrCon = "Get odds info error!!";
          }
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Odds error!!";
      }
      await conn.release();
  }
  res.send(StrFunc.stringify(msg));
});
app.get("/setStop", async (req, res) => {
  const msg: IMsg = {ErrNo: 0};
  const conn: mariadb.PoolConnection|undefined = await getConnection("AdminApi setStop");
  if (!conn) {
      msg.ErrNo = 8;
      msg.ErrCon = "Database busy!!";
  } else {
      const param = req.query;
      console.log("setStop param", param);
      const tid = parseInt(param.tid as string, 10);
      const GameID = parseInt(param.GameID as string, 10);
      const BetTypes = param.BetTypes as string;
      const Num = param.Num as string;
      const UserID = parseInt(param.UserID as string, 10);
      const isStop = parseInt(param.isStop as string, 10);
      const ans = await afunc.setStop(tid, GameID, isStop, UserID, conn, BetTypes, Num);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Set stop error!!";
      }
      await conn.release();
  }
  res.send(StrFunc.stringify(msg));
});
app.post("/saveComments", async (req, res) => {
  const param = req.body;
  const msg: IMsg = { ErrNo: 0 };
  if (!param.PageName) {
      msg.ErrNo = 9;
      msg.ErrCon = "PageName is missing!!";
  }
  const conn: mariadb.PoolConnection | undefined = await getConnection("AdminApi saveComments");
  if (conn) {
      // console.log("saveComments:", param);
      const ans = await afunc.saveComments(param.PageName, param.Comments, conn);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Save comments error!";
      }
      await conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "Get Connection error!";
  }
  res.send(StrFunc.stringify(msg));
});
app.post("/getComments", async (req, res) => {
  const param = req.body;
  const msg: IMsg = { ErrNo: 0 };
  if (!param.PageName) {
      msg.ErrNo = 9;
      msg.ErrCon = "PageName is missing!!";
  }
  const conn: mariadb.PoolConnection | undefined = await getConnection("AdminApi getComments");
  if (conn) {
      // console.log("getComments:", param);
      const ans = await afunc.getComments(param.PageName, conn);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Get comments error!";
      }
      await conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "Get Connection error!";
  }
  res.send(StrFunc.stringify(msg));
});
app.get("/getBetHeaders", async (req, res) => {
  const param = req.query;
  const msg: IMsg = { ErrNo: 0 };
  // console.log("getBetHeaders param:", param);
  const conn: mariadb.PoolConnection | undefined = await getConnection("getBetHeaders");
  if (conn) {
        let uids: number[] = [];
        let upid: IUser[]|undefined;
        const params: ICommonParams = {
            findString: param.findString ? param.findString as string : "",
        };
        const uparam = {
            findString: param.UpName ? param.UpName as string : "",
        };

        if (param.Types) {
            if (parseInt(param.Types + "", 10) < 3) {
                // params.UpId = parseInt(param.UserID as string, 10);
                param.UpId = param.UserID;
            }
        }
        if (!param.UpId && uparam.findString) {
            upid = await getUsers(conn, uparam);
            console.log("getUser upid", upid);
            if (!upid || upid.length === 0) {
                msg.ErrNo = ErrCode.NO_DATA_FOUND;
                msg.ErrCon = "Get up error!";
            } else {
                param.UpId = upid.map((u: IUser) => u.id.toString() );
            }
            console.log("get up:", msg);
        }
        if (msg.ErrNo === 0) {
            if (params.findString) {
                const ids = await getUsers(conn, params, "Member");
                // console.log("getBetHeaders findString:", ids);
                if (ids) {
                    ids.map((itm: IHasID) => {
                        uids.push(itm.id);
                    });
                }
            }
            // console.log("getbetHeaders:", param);
            const ans = await afunc.getBetHeaders(param as ICommonParams, conn, uids);
            // console.log("AdminApi /getBetHeaders ans", ans.length);
            if (ans) {
                params.UpId = 0;
                const tmp = ans as HasUpID[];
                uids = [];
                const upids: number[] = [];
                tmp.map((itm) => {
                    const fIdx = uids.findIndex((uid) => uid === itm.UserID);
                    if (fIdx === -1) { uids.push(itm.UserID); }
                    const uIdx = upids.findIndex((pid) => pid === itm.UpId);
                    if (uIdx === -1) { upids.push(itm.UpId); }
                });
                if (uids.length > 0) {
                    const users = await getUsers(conn, params, "Member", true);
                    msg.users = users;
                }
                if (upids.length > 0) {
                    upid = await getUsers(conn, upids, "", true);
                    msg.UpUser = upid;
                }
                msg.data = ans;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Get BetLists error!";
            }
        }
        // console.log("getBetHeaders before conn release");
        await conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "Get Connection error!";
  }
  res.send(StrFunc.stringify(msg));
});
app.get("/getTermIDByGameID", async (req: Request, res: Response) => {
    // await getCurTermId();
    const conn = await getConnection("AdminApi getTermIDByGameID");
    let msg: IMsg = {ErrNo: 0};
    if (conn) {
        const GameID = parseInt(req.query.GameID as string, 10);
        msg = await getTermIds(GameID, conn);
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get Connection error!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getBetTotal", async (req, res) => {
    const param = req.query;
    const params: ICommonParams = {};
    if (param.UpId) {
        params.UpId = parseInt(param.UpId as string, 10);
    }
    if (param.GameID) {
        params.GameID = parseInt(param.GameID as string, 10);
    }
    if (param.SDate) {
        params.SDate = param.SDate as string;
    }
    if (param.EDate) {
        params.EDate = param.EDate as string;
    }
    if (param.Ledger) {
        params.Ledger = param.Ledger as string;
    }
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("AdminApi getBetTotal");
    if (conn) {
        const userid = param.UserID ? parseInt(param.UserID as string, 10) : 0;
        if (userid) {
            const ans = await getUsers(conn, [userid], "", true);
            // console.log("getUsers:", ans);
            if (ans) {
                if (Array.isArray(ans)) {
                    if (ans[0].Types < 3) {
                        params.UpId = userid;
                    }
                }
            }
        }
        // const tmp = await doQuery('show variables like "%time_zone%";', conn);
        // console.log("timezone chk:", tmp);
        // await modifySDateForDayReport(conn);
        const sql: string = getBetTotalSql(params);
        // console.log("getBetTotal sql:", sql, params);
        const data = await doQuery(sql, conn);
        const ids: number[] = [];
        if (data) {
            msg.data = data;
            // console.log("after doQuery:", data);
            data.map((itm) => {
                ids.push(itm.UpId);
            });
        }
        if (ids.length > 0) {
            const sqlusr = `select id,Account from User where id in (${ids.join(",")})`;
            // console.log("getBetTotal user", sql);
            const usr = await doQuery(sqlusr, conn);
            if (usr) {
                msg.User = usr;
            }
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getLastTerm", async (req, res) => {
    const msg: IMsg = { ErrNo: 0 };
    const conn = await getConnection("AdminApi getLastTerm");
    if (conn) {
        const param = req.query;
        const GameID = parseInt(param.GameID as string, 10);
        const term = await afunc.getLastTerm(GameID, conn);
        if (term) {
            msg.data = term;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Data not found";
        }
    } else {
        msg.ErrNo = 9;
        msg.debug = "db connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getEditRecord", async (req, res) => {
    const msg: IMsg = { ErrNo: 0 };
    const conn = await getConnection("AdminApi getEditRecord");
    if (conn) {
        const param = req.query;
        const id = parseInt(param.id as string, 10);
        const tb = param.tb as string;
        const sql = "select p.*,u.NickName UserName from ParamsLog p left join User u on p.adminid = u.id where uid=? and tb=?";
        const ans = await doQuery(sql, conn, [id, tb]);
        if (ans) {
            msg.data = ans;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Data not found";
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.debug = "db connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/DelTerm", async (req, res) => {
    const msg: IMsg = { ErrNo: 0 };
    const param = req.query;
    const tid = parseInt(param.tid as string, 10);
    const conn = await getConnection("AdminApi DelTerm");
    if (conn) {
        const isEmpty: boolean = await isTermEmpty(tid, conn);
        console.log("after chk isTermEmpty", isEmpty);
        if (isEmpty) {
            let sql = "delete from Terms where id = ?";
            let delChk = await doQuery(sql, conn, [tid]);
            if (delChk) {
                const ans: IDBAns = delChk as IDBAns;
                if (ans.affectedRows > 0) {
                    sql = "delete from CurOddsInfo where tid = ?";
                    delChk = await doQuery(sql, conn, [tid]);
                }
            }
        } else {
            msg.ErrNo = ErrCode.DELETE_TERM_ERR;
            msg.ErrCon = "Not Empty!!";
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.debug = "db connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/CancelTerm", async (req, res) => {
    let msg: IMsg = { ErrNo: 0 };
    const param = req.query;
    const tid = parseInt(param.tid as string, 10);
    // console.log("CancelTerm", param);
    // res.send(StrFunc.stringify(param));
    if (tid) {
        const conn = await getConnection("AdminApi CancelTerm");
        if (conn) {
            msg = await CancelTerm(tid, conn);
            await conn.release();
        } else {
            msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
            msg.debug = "db connection error!!";
        }
    } else {
        msg.ErrNo = ErrCode.MISS_PARAMETER;
        msg.ErrCon = "tid is required!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getBTCHashTable", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("AdminApi getBTCHashTable");
    if (conn) {
        const p = req.query;
        const sql = `select height,hashvalue from btcBlocks limit ${p.idx},${p.steps}`;
        // console.log("getBTCHashTable:", sql);
        try {
            const ans = await doQuery(sql, conn);
            // console.log("getBTCHashTable end");
            if (ans) {
                msg.data = ans;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Data no found!!";
            }
        } catch (error) {
            console.log(error);
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/getHashAna", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("AdminApi getHashAna");
    if (conn) {
        const jt: JTable<IHashAna> = new JTable(conn, "HashAna");
        try {
            const ans = await jt.List();
            if (ans) {
                msg.data = ans;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Data no found!!";
            }
        } catch (error) {
            console.log(error);
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.post("/saveHashAna", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("AdminApi saveHashAna");
    if (conn) {
        const param = req.body;
        const jt: JTable<IHashAna> = new JTable(conn, "HashAna");
        const data: IHashAna = {
            id: 0,
            Cond: param.Cond,
            AnaData: param.AnaData.replace(/\\"/g, '"')
        };
        try {
            const ans = await jt.Insert(data);
            if (ans) {
                msg.data = ans;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Data no found!!";
            }
        } catch (error) {
            console.log(error);
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
app.get("/delHashAna", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("AdminApi delHashAna");
    if (conn) {
        const id = parseInt(req.query.id as string, 10);
        const jt: JTable<IHashAna> = new JTable(conn, "HashAna");
        try {
            const ans = await jt.Delete(id);
            if (ans) {
                msg.data = ans;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Delete data error!!";
            }
        } catch (error) {
            console.log(error);
        }
        await conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get connection error!!";
    }
    res.send(StrFunc.stringify(msg));
});
async function getTermIds(GameID: number, conn: mariadb.PoolConnection): Promise<IMsg> {
    const msg: IMsg = { ErrNo: 0 };
    const sql = `select id,TermID from Terms where GameID=? order by id desc`;
    await conn.query(sql, [GameID]).then((res) => {
        msg.data = res;
    }).catch((err) => {
        msg.ErrNo = 9;
        msg.debug = err;
    });
    return msg;
}
function getBetTotalSql(param: ICommonParams): string {
    const cond: string[] = [];
    let extField: string = "";
    if (param.UpId) {
        cond.push(` UpId = ${param.UpId} `);
    }
    if (param.GameID) {
        cond.push(` GameID = ${param.GameID} `);
    }
    const tse: string|undefined = getCondTSE("SDate", param.SDate, param.EDate, true);
    if (tse) {
        cond.push(tse);
    }
    if (param.Ledger === "1") {
        extField = ",BetType";
    }
    const sql: string = `SELECT UpId${extField}${param.Ledger === "2" ? ",SDate" : ""},sum(Total) Total,sum(WinLose) WinLose FROM DayReport
        WHERE ${cond.length > 0 ? cond.join("and") : 1 }
        group by UpId${extField}${param.Ledger === "2" ? ",SDate" : ""}`;
    // console.log("getBetTotalSql:", sql, param);
    return sql;
}
function getBetTotalSql_back(param: ICommonParams): string {
    const cond: string[] = [];
    let extField: string = "";
    if (param.UpId) {
        cond.push(` UpId = ${param.UpId} `);
    }
    if (param.GameID) {
        cond.push(` GameID = ${param.GameID} `);
    }
    const tse: string|undefined = getCondTSE("CreateTime", param.SDate, param.EDate);
    if (tse) {
        cond.push(tse);
    }
    if (param.Ledger === "1") {
        extField = ",BetType";
    }
    const sql: string = `SELECT UpId${extField}${param.Ledger === "2" ? ",UNIX_TIMESTAMP(CreateTime) UXTimeStamp" : ""},sum(Amt) Total,sum(WinLose) WinLose FROM BetTable
        WHERE ${cond.length > 0 ? cond.join("and") : 1 }
        group by UpId${extField}${param.Ledger === "2" ? ",convert(CreateTime,DATE)" : ""}`;
    console.log("getBetTotalSql:", sql, param);
    return sql;
}
function getCondTSE(field: string, start?: string, end?: string, noConv?: boolean): string|undefined {
    if (start) {
        if (!end) {
            end = start;
        }
    } else if (end) {
            start = end;
    } else {
        return;
    }
    if (noConv) {
        start = start.indexOf("/") > -1 ? start.split("/").join("-") : start;
        end = end.indexOf("/") > -1 ? end.split("/").join("-") : end;
        return ` ${field} BETWEEN '${start}' and '${end}' `;
    } else {
        return ` convert(${field},Date) BETWEEN '${start}' and '${end}' `;
    }
}
/*
function getCondTSE(field: string, start?: string, end?: string): string|undefined {
    if (start) {
        if (!end) {
            end = start;
        }
    } else if (end) {
            start = end;
    } else {
        return;
    }
    return ` ${field} BETWEEN '${start} 00:00:00' and '${end} 23:59:59' `;
}
*/
async function setLogin(remoteIP: string, uid: number, Account: string, conn: mariadb.PoolConnection, UpId?: number): Promise<string|undefined> {
    const upid: number = UpId ? UpId : 0;
    let sql: string = `update LoginInfo set isActive=0 where uid=${uid} and AgentID=${upid}`;
    let ans = await doQuery(sql, conn);
    const logkey = eds.KeyString;
    if (ans) {
        sql = `insert into LoginInfo(uid,Account,AgentID,logkey,remoteIP)
            value(${uid},'${Account}',${upid},'${logkey}','${remoteIP}')`;
        ans = await doQuery(sql, conn);
        if (ans) {
            return logkey;
        }
    }
    return;
}
async function isTermEmpty(tid: number, conn: mariadb.PoolConnection): Promise<boolean> {
    const sql = "select count(*) cnt from BetHeader where tid = ?";
    const ans = await doQuery(sql, conn, [tid]);
    console.log("isTermEmpty", ans);
    if (ans[0]) {
        if (ans[0].cnt === 0) { return true; }
    }
    return false;
}
async function createBasePayRate(GameID, conn: mariadb.PoolConnection) {
    const sql = `insert into BasePayRate(GameID,GType,BetType,SubType)
        select g.id GameID,p.GType,p.BetType,p.SubType from ProbabilityTable p left join Games g on p.GType=g.GType where g.id = ?`;
    const ans = await doQuery(sql, conn, [GameID]);
    return ans;
}
async function modifySDateForDayReport(conn: mariadb.PoolConnection) {
    const jt = new JTable<IDayReport>(conn, "DayReport");
    const msg = await jt.Lists();
    // console.log(msg);
    if (msg.ErrNo === ErrCode.PASS) {
        const dta = msg.data as IDayReport[];
        const tmp: IDayReport[] = [];
        dta.map((itm) => {
            const d = dateChk(itm.SDate);
            if (d) {
                itm.SDate = d;
                tmp.push(itm);
            }
        });
        if (tmp.length > 0) {
            await jt.MultiUpdate(tmp);
        }
    }
}
function dateChk(d: string) {
    if (d.indexOf("-") !== -1) { return false; }
    const tmp = d.split("/");
    const iTmp = tmp.map((itm) => parseInt(itm, 10));
    if (iTmp[0] > 2000 ) {
        return `${tmp[0]}-${tmp[1]}-${tmp[2]}`;
    } else {
        return `${tmp[2]}-${tmp[0]}-${tmp[1]}`;
    }
}
export default app;
