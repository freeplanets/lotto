import express, {Request, Response, Router } from "express";
import mariadb from "mariadb";
// import {setPayRateData,setPayRate,isPayClassUsed,chkTermIsSettled,CreateOddsData,getGameList,getBtList} from '../API/ApiFunc';
import * as afunc from "../API/ApiFunc";
import {getOddsData, getPayClass, getUsers} from "../API/MemberApi";
import Zadic from "../class/Animals";
import {Bet} from "../class/Bet";
import {Gets} from "../class/Gets";
import JDate from "../class/JDate";
import JTable from "../class/JTable";
import {SaveNums} from "../class/Settlement";
import {IBasePayRateItm, IBetItem, IBTItem, ICommonParams, IGameItem, IMOdds, IMsg } from "../DataSchema/if";
import {IDBAns, IGame, IPayClassParam, IPayRateItm, ITerms, IUser} from "../DataSchema/user";
import {doQuery, getConnection} from "../func/db";
import apiRouter from "./api";

const app: Router = express.Router();
app.get("/getGames", async (req, res) => {
  // const conn = await dbPool.getConnection();
  const conn = await getConnection();
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
      const sql = "select id,name,GType from Games order by id";
      const ans = await doQuery(sql, conn);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Games not found!!";
      }
      conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
  }
  res.send(JSON.stringify(msg));
  /*
  await conn.query(sql).then((v) => {
      conn.release();
      res.send(JSON.stringify(v));
  }).catch((err) => {
      console.log("saveGames", err);
      res.send(err);
  });
  */
});
app.post("/saveBtClass", async (req, res) => {
  const conn = await getConnection();
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
      conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
  }
  res.send(JSON.stringify(msg));
});
app.get("/getBtClass", async (req, res) => {
  const conn = await getConnection();
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
      const param = req.query;
      const params = [param.GameID];
      const sql = "select id,BCName,BetTypes from BetClass where GameID = ?";
      const ans = await doQuery(sql, conn, params);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrCon = "BetClass Not found!!";
      }
      conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
  }
  res.send(JSON.stringify(msg));
});
app.get("/delBtClass", async (req, res) => {
  const conn = await getConnection();
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
      const param = req.query;
      const params = [param.GameID, param.BCName];
      const sql = "delete from BetClass where GameID=?  and BCName=?";
      const ans = await doQuery(sql, conn, params);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrCon = "BetClass delete fail!!";
      }
      conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
  }
  res.send(JSON.stringify(msg));
});
app.get("/getPayClass", async (req, res) => {
  const conn = await getConnection();
  const msg: IMsg = {ErrNo: 0};
  if (conn) {
    const param = req.query;
    const ans = await getPayClass(conn, param.GameID);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = ans;
    }
    conn.release();
  } else {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
  }
  res.send(JSON.stringify(msg));
});
app.post("/savePayClass", async (req, res) => {
  const msg: IMsg = {ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.body;
  console.log("param chk", param);
  const params = [param.GameID, param.PayClassName, param.ModifyID];
  const sql = `insert into PayClass(GameID,PayClassName,ModifyID) values(?,?,?) on duplicate key update PayClassName=values(PayClassName),ModifyID=values(ModifyID)`;
  let rlt: IDBAns = {
      affectedRows: 0,
      insertId: 0,
      warningStatus: 0
  };
  await conn.query(sql, params).then((v) => {
      // console.log("savePayClass", v);
      // res.send(JSON.stringify(v));
      rlt = v;
  }).catch((err) => {
      console.log("savePayClass error", err);
      conn.release();
      msg.ErrNo = 9;
      msg.debug = err;
      res.send(JSON.stringify(msg));
  });
  let ans;
  if (param.data) {
      ans = await afunc.setPayRateData(param.GameID, rlt.insertId, param.ModifyID, param.data, conn);
  } else {
      const cond = JSON.parse(param.condition);
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
  console.log("savePayClass", msg);
  conn.release();
  res.send(JSON.stringify(msg));

});
app.get("/editPayClass", async (req, res) => {
  const param = req.query;
  const msg: IMsg = {ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  console.log("param chk", param);
  const params = [param.PayClassName, param.ModifyID, param.id];
  const sql = `update PayClass set PayClassName=?,ModifyID=? where id=?`;
  let rlt: IDBAns = {
      affectedRows: 0,
      insertId: 0,
      warningStatus: 0
  };
  await conn.query(sql, params).then((v) => {
      // console.log("savePayClass", v);
      // res.send(JSON.stringify(v));
      rlt = v;
      msg.data = rlt;
  }).catch((err) => {
      console.log("savePayClass error", err);
      msg.ErrNo = 9;
      msg.debug = err;
  });
  conn.release();
  res.send(JSON.stringify(msg));
});
app.get("/delPayClass", async (req, res) => {
  const param = req.query;
  const msg: IMsg = {ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  console.log("param chk", param);
  const params = [param.id];
  const chk = await afunc.isPayClassUsed(param.GameID, param.id, conn);
  console.log("delPayClass chk", chk);
  if (chk) {
      msg.ErrNo = 9;
      msg.ErrCon = "PayClass in used!!";
      conn.release();
      res.send(JSON.stringify(msg));
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
      // res.send(JSON.stringify(v));
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
  }
  if (msg.ErrNo === 0) {
      conn.commit();
  } else {
      conn.rollback();
  }
  conn.release();
  res.send(JSON.stringify(msg));
});
app.get("/getBasePayRate", async (req, res) => {
  const conn = await getConnection();
  const msg: IMsg = {ErrNo: 0};
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  const params = [param.GameID];
  const sql = `select BetType,Title,SubTitle,SubType,NoAdjust,Profit,DfRate,TopRate,
        Probability,Steps,TopPay,OneHand,TotalNums,UseAvg,SingleNum,UnionNum,MinHand,MaxHand,
        BetForChange,StepsGroup,ChangeStart,PerStep from BasePayRate where GameID = ?`;
  await conn.query(sql, params).then((v) => {
      // console.log("getBasePayRate", v, params);
      conn.release();
      msg.data = v;
      res.send(JSON.stringify(msg));
  }).catch((err) => {
      console.log("getBasePayRate error", err);
      msg.ErrNo = 9;
      msg.debug = err;
      conn.release();
      res.send(JSON.stringify(msg));
  });
});
app.get("/getPayRate", async (req, res) => {
  const conn = await getConnection();
  const msg: IMsg = {ErrNo: 0};
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  const params = [param.PayClassID, param.GameID];
  const sql = `select p.BetType,p.SubType,b.DfRate,p.Rate,b.Probability,b.Steps,b.OneHand
      from  BasePayRate b left join PayRate p on b.GameID=p.GameID and b.BetType = p.BetType and b.SubType = p.SubType where p.PayClassID=? and p.GameID = ?`;
  await conn.query(sql, params).then((v) => {
      // console.log("getPayRate", v, params);
      conn.release();
      res.send(JSON.stringify(v));
  }).catch((err) => {
      console.log("getPayRate error", err);
      conn.release();
      res.send(JSON.stringify(err));
  });
});
app.post("/batch/saveBasePayRate", async (req, res) => {
    const conn = await getConnection();
    const msg: IMsg = {ErrNo: 0};
    if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "get connection error!!";
      res.send(JSON.stringify(msg));
      return;
    }
    const param = req.body;
    const datas: IBasePayRateItm[] = JSON.parse(param.data);
    datas.map((itm) => {
        itm.GameID = param.GameID;
        itm.ModifyID = param.ModifyID;
    });
    const jt: JTable<IBasePayRateItm> = new JTable(conn, "BasePayRate");
    const ans = jt.MultiUpdate(datas);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = 9;
    }
    res.send(JSON.stringify(msg));
});
app.post("/batch/saveBasePayRate1", async (req, res) => {
  const conn = await getConnection();
  const msg: IMsg = {ErrNo: 0};
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.body;
  // console.log(param);
  param.data = JSON.parse(param.data);
  const valstr: string[] = [];
  param.data.map((itm: IBasePayRateItm) => {
      if (!itm.SubTitle) { itm.SubTitle = ""; }
      if (!itm.Profit) { itm.Profit = 0; }
      if (!itm.DfRate) { itm.DfRate = 0; }
      if (!itm.TopRate) { itm.TopRate = 0; }
      if (!itm.Probability) { itm.Probability = 0; }
      if (!itm.Steps) { itm.Steps = 0; }
      const tmp = `(${param.GameID},${itm.BetType},'${itm.Title}','${itm.SubTitle}',${itm.SubType},${itm.NoAdjust},${itm.Profit},${itm.DfRate},${itm.TopRate},${itm.Probability},${itm.Steps},${itm.TopPay},${itm.OneHand},${param.ModifyID})`;
      valstr.push(tmp);
  });
  let sql = "insert into BasePayRate(GameID,BetType,Title,SubTitle,SubType,NoAdjust,Profit,DfRate,TopRate,Probability,Steps,TopPay,OneHand,ModifyID) values";
  sql += valstr.join(",");
  sql += " ON DUPLICATE KEY UPDATE NoAdjust=values(NoAdjust),Profit=values(Profit),DfRate=values(DfRate),TopRate=values(TopRate),Probability=values(Probability),Steps=values(Steps),TopPay=values(TopPay),OneHand=values(OneHand),ModifyID=values(ModifyID)";
  await conn.query(sql).then((v) => {
      console.log("getPayRate", sql, v);
      conn.release();
      res.send(JSON.stringify(v));
  }).catch((err) => {
      console.log("getPayRate error", err);
      conn.release();
      res.send(JSON.stringify(err));
  });
});
app.post("/batch/savePayRate", async (req, res) => {
  const conn = await getConnection();
  const msg: IMsg = {ErrNo: 0};
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.body;
  console.log("savePayRate", req.body);
  param.data = JSON.parse(param.data);
  const valstr: string[] = [];
  param.data.map((itm: IPayRateItm) => {
      const tmp = `(${param.PayClassID},${param.GameID},${itm.BetType},${itm.SubType},${itm.Rate})`;
      valstr.push(tmp);
  });
  let sql: string = "insert into PayRate(PayClassID,GameID,BetType,SubType,Rate) values";
  sql += valstr.join(",");
  sql += " ON DUPLICATE KEY UPDATE Rate=values(Rate)";
  await conn.query(sql).then((v) => {
      conn.release();
      res.send(JSON.stringify(v));
  }).catch((err) => {
      console.log("savePayRate error", err);
      conn.release();
      res.send(JSON.stringify(err));
  });
});
app.post("/saveTerms", async (req, res) => {
  const param: ITerms = req.body;
  const msg: IMsg = {
      ErrNo: 0,
      ErrCon: ""
  };
  let ans;
  if (param) {
      if (!param.TermID) {
          msg.ErrNo = 9;
          msg.ErrCon = "TermID is Empty!!";
      }
      if (!param.GameID) {
          msg.ErrNo = 9;
          msg.ErrCon = "TermID is Empty!!";
      }
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "All params is empty!!";
  }
  if (msg.ErrNo !== 0) {
      res.send(JSON.stringify(msg));
      return;
  }
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  ans = await afunc.chkTermIsSettled(param.GameID, conn);
  // console.log("chkTermIsSettled", ans);
  // res.send(JSON.stringify(ans));
  if (!ans) {
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
      await conn.query(sql, params).then((row) => {
          // res.send(JSON.stringify(row));
          ans = row;
          msg.ErrCon = row;
          tid = row.insertId;
      }).catch((err) => {
          // ans=err;
          console.log(err);
          msg.ErrNo = 8;
          msg.ErrCon = err;
          msg.debug = sql + ">>" + params.join(",");
          // res.send(JSON.stringify(err));
      });
      if (ans) {
          if (!param.id) {
              const codAns = await afunc.CreateOddsData(param.GameID, tid, conn);
              if (codAns.ErrNo !== 0) {
                      await conn.rollback();
                      conn.release();
                      res.send(JSON.stringify(codAns));
              }
          }
          await conn.commit();
      } else {
          await conn.rollback();
          msg.ErrNo = 9;
          msg.ErrCon = "Error!!";
      }
      conn.release();
      res.send(JSON.stringify(msg));
  }
});
app.get("/getTerms", async (req, res) => {
  const msg: IMsg = {
    ErrNo: 0,
    ErrCon: ""
  };
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  const sql = "select * from Terms where GameID=? order by id desc limit 0,10";
  await conn.query(sql, [param.GameID]).then((rows) => {
      // console.log("getTerms", rows);
      msg.data = rows;
  }).catch((err) => {
      msg.ErrNo = 9;
      msg.ErrCon = err;
  });
  conn.release();
  res.send(JSON.stringify(msg));
});
app.post("/createBetItems", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.body;
  const GameID = param.GameID;
  const ModifyID = param.ModifyID;
  // console.log("createBetItems data:", param.data);
  const data: IBetItem[] = JSON.parse(param.data);
  const val: string[] = [];
  data.map((itm) => {
      const tmp: string = `(${GameID},${itm.BetType},'${itm.Num}',${ModifyID})`;
      // console.log(tmp);
      val.push(tmp);
  });
  if (data.length <= 0) {
      msg.ErrNo = 9;
      msg.ErrCon = "No Data !!!";
      conn.release();
      res.send(JSON.stringify(msg));
  }
  let sql = "insert into dfOddsItems(GameID,BetType,Num,ModifyID) values";
  sql = sql + val.join(",");
  console.log("sql:", sql);
  await conn.query(sql).then((row) => {
      conn.release();
      res.send(JSON.stringify(row));
  }).catch((err) => {
      conn.release();
      res.send(JSON.stringify(err));
  });

});
app.get("/GameList", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const jt: JTable<IGame> = new JTable(conn, "Games");
  const games: IGame[] = await jt.List();
  // console.log("AdminApi /GameList", JSON.stringify(games));
  conn.release();
  res.send(JSON.stringify(games));
});
app.post("/UpdateGame", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const jt: JTable<IGame> = new JTable(conn, "Games");
  const param: IGame = req.body;
  const ans = await jt.Update(param);
  console.log("UpdateGame", ans);
  conn.release();
  res.send(JSON.stringify(ans));
});
app.post("/Save/:TableName", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const TableName = req.params.TableName;
  // console.log("/api/Save/TableName param", req.body);
  const data: IBasePayRateItm[] = JSON.parse(req.body.params.data);
  const jt: JTable<IBasePayRateItm> = new JTable(conn, TableName);
  const ans = await jt.MultiUpdate(data);
  // console.log("/api/Save/:TableName ans:", ans);
  if (ans) {
      msg.data = ans;
  } else {
      msg.ErrNo = 9;
      msg.error = ans;
  }
  conn.release();
  res.send(JSON.stringify(msg));
});
app.get("/member/getAnimals", (req, res) => {
  res.send(JSON.stringify(Zadic));
});
app.get("/member/wagerLotto", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  const games: IGameItem[] = await afunc.getGameList(conn);
  const btlist: IBTItem[] = await afunc.getBtList(param.GameID, conn);
  if (games) {
      msg.gameLists = games;
  }
  if (btlist) {
      msg.btLists = btlist;
  }
  conn.release();
  res.send(JSON.stringify(msg));
});
app.get("/member/getOddsItems", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  // console.log("/api/member/getOddsItems", param);
  const ans = await getOddsData(param.GameID, param.PayClassID, param.maxOID, conn);
  conn.release();
  res.send(JSON.stringify(ans));
});
app.post("/member/mwagermulti", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.body;
  // console.log("/api/member/mwagermulti", param);
  const UserID = param.UserID;
  const Account = param.Account;
  const tid = param.LNoID;
  const GameID = param.LottoID;
  const PayClassID = param.PayClassID;
  const UpId = param.UpId;
  // const btrans = await conn.beginTransaction();
  // console.log("Begin:", btrans);
  const snb: Bet = new Bet(UserID, Account, UpId , tid, GameID, PayClassID, conn);
  const ans: IMsg = await snb.AnaNum(param.WagerContent);
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
  conn.release();
  res.send(JSON.stringify(ans));
});
app.post("/member/mwagerjn", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.body;
  // console.log("/api/member/mwagerjn", param);
  const UserID = param.UserID;
  const Account = param.Account;
  const UpId = param.UpId;
  const tid = param.LNoID;
  const GameID = param.LottoID;
  const PayClassID = param.PayClassID;
  // const btrans = await conn.beginTransaction();
  // console.log("Begin:", btrans);
  const snb: Bet = new Bet(UserID, Account, UpId, tid, GameID, PayClassID, conn);
  const ans: IMsg = await snb.Parlay(param.wgtype, param.OddsID, param.JoinNumber, param.StakeMoney);
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
  conn.release();
  res.send(JSON.stringify(ans));
});
app.get("/member/getWagerItems", async (req, res) => {
  let msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  const gets: Gets = new Gets(conn);
  // console.log("/api/member/getWagerItems", param);
  if (param.data === "") {
      param.date = JDate.DateStr;
  }
  msg = await gets.getBetLists(param.UserID, param.date);
  conn.release();
  res.send(JSON.stringify(msg));
});
app.post("/SaveUser", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const jt: JTable<IUser> = new JTable(conn, "User");
  const param: IUser = req.body;
  console.log("SaveUser", param);
  let ans;
  if (param.id) {
      ans = await jt.Update(param);
  } else {
      ans = await jt.Insert(param);
  }
  conn.release();
  res.send(JSON.stringify(ans));
});
app.get("/getUsers", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  const ans = await getUsers(conn, param);
  if (ans) {
      msg.data = ans;
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "Get Users Error!!";
  }
  conn.release();
  res.send(JSON.stringify(msg));
});
app.get("/member/getPayClass", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  if (!param.GameID) {
      msg.ErrNo = 9;
      msg.ErrCon = "GameID is missing!!";
  } else {
      const ans = getPayClass(conn, param.GameID);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Get Pay Class Error!!";
      }
  }
  conn.release();
  res.send(JSON.stringify(msg));
});
/*
app.get("/getOpParams", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.query;
  if (!param.GameID) {
      msg.ErrNo = 9;
      msg.ErrCon = "GameID is missing!!";
  } else {
      const ans = await getOpParams(param.GameID, conn, !!param.onlySteps);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Get Open Params Error!!";
      }
  }
  conn.release();
  res.send(JSON.stringify(msg));
});
*/
app.post("/SaveNums", async (req, res) => {
  const msg: IMsg = { ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
    msg.ErrNo = 9;
    msg.ErrCon = "get connection error!!";
    res.send(JSON.stringify(msg));
    return;
  }
  const param = req.body.params;
  console.log("SaveNums", param);
  if (!param.GameID) {
      msg.ErrNo = 9;
      msg.ErrCon = "GameID is missing!!";
  }
  if (!param.Nums) {
      msg.ErrNo = 9;
      msg.ErrCon = "Nums is missing!!";
  }
  if (msg.ErrNo === 0) {
      const Nums = SaveNums(param.tid, param.GameID, param.Nums, conn, param.isSettled);
      msg.Data = Nums;
  }
  conn.release();
  res.send(JSON.stringify(msg));
});
app.get("/CurOddsInfo", async (req, res) => {
  // const conn = await dbPool.getConnection();
  const msg: IMsg = {ErrNo: 0};
  const conn = await getConnection();
  if (!conn) {
      msg.ErrNo = 9;
      msg.ErrCon = "Connection error!!";
      res.send(JSON.stringify(msg));
  } else {
      const param = req.query;
      let tid: number | undefined = 0;
      // console.log("CurOddsInfo", param);
      if (!param.GameID) {
          msg.ErrNo = 9;
          msg.ErrCon = "GameID is missing!!";
          res.send(JSON.stringify(msg));
      }
      if (!param.tid) {
          tid = await afunc.getCurTermId(param.GameID, conn);
          if (!tid) {
              msg.ErrNo = 9;
              msg.ErrCon = "Get data error!!";
              res.send(JSON.stringify(msg));
          }
      } else {
          tid = param.tid;
      }
      msg.tid = tid;
      let MaxOddsID: number = 0;
      if (param.MaxOddsID) {
          MaxOddsID = parseInt(param.MaxOddsID, 10);
      }
      const ans = await afunc.getCurOddsInfo(tid as number, param.GameID, MaxOddsID, conn);
      if (ans) {
        msg.data = ans;
        // console.log("CurOddsInfo MaxOdDsID:", typeof MaxOddsID, MaxOddsID);
        if (MaxOddsID === 0) {
          const stp = await afunc.getOpStep(param.GameID, conn);
          if (stp) {
              msg.Steps = stp;
          }
        }
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Get Odds error!";
      }
      conn.release();
  }
  res.send(JSON.stringify(msg));
});
app.get("/setOdds", async (req, res) => {
  const msg: IMsg = {ErrNo: 0};
  const conn: mariadb.PoolConnection|undefined = await getConnection();
  if (!conn) {
      msg.ErrNo = 8;
      msg.ErrCon = "Database busy!!";
  } else {
      const param = req.query;
      console.log("setOdds param", param);
      if (param.Step) {
          const fOdds: IMOdds|undefined = await afunc.getOddsInfo(param.tid, param.GameID, param.BT, param.Num, conn);
          if (fOdds) {
              // msg.data = ans;
              // const step: number = param.Step;
              let odds: number = fOdds.Odds + param.Add * param.Step;
              console.log("before setOdds", odds, param.Add, param.Step);
              if (odds > fOdds.MaxOdds) {
                  odds = fOdds.MaxOdds;
              }
              if (odds !== fOdds.Odds) {
                  const ans = await afunc.setOdds(param.tid, param.GameID, param.BT, param.Num, odds, param.UserID, conn);
                  if (ans) {
                      msg.data = ans;
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
      conn.release();
  }
  res.send(JSON.stringify(msg));
});
app.get("/setStop", async (req, res) => {
  const msg: IMsg = {ErrNo: 0};
  const conn: mariadb.PoolConnection|undefined = await getConnection();
  if (!conn) {
      msg.ErrNo = 8;
      msg.ErrCon = "Database busy!!";
  } else {
      const param = req.query;
      console.log("setStop param", param);
      const ans = await afunc.setStop(param.tid, param.GameID, param.isStop, param.UserID, conn, param.BetTypes, param.Num);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Set stop error!!";
      }
      conn.release();
  }
  res.send(JSON.stringify(msg));
});
app.post("/saveComments", async (req, res) => {
  const param = req.body;
  const msg: IMsg = { ErrNo: 0 };
  if (!param.PageName) {
      msg.ErrNo = 9;
      msg.ErrCon = "PageName is missing!!";
  }
  const conn: mariadb.PoolConnection | undefined = await getConnection();
  if (conn) {
      // console.log("saveComments:", param);
      const ans = await afunc.saveComments(param.PageName, param.Comments, conn);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Save comments error!";
      }
      conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "Get Connection error!";
  }
  res.send(JSON.stringify(msg));
});
app.post("/getComments", async (req, res) => {
  const param = req.body;
  const msg: IMsg = { ErrNo: 0 };
  if (!param.PageName) {
      msg.ErrNo = 9;
      msg.ErrCon = "PageName is missing!!";
  }
  const conn: mariadb.PoolConnection | undefined = await getConnection();
  if (conn) {
      // console.log("getComments:", param);
      const ans = await afunc.getComments(param.PageName, conn);
      if (ans) {
          msg.data = ans;
      } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Get comments error!";
      }
      conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "Get Connection error!";
  }
  res.send(JSON.stringify(msg));
});
app.get("/getBetHeaders", async (req, res) => {
  const param = req.query;
  const msg: IMsg = { ErrNo: 0 };
  const conn: mariadb.PoolConnection | undefined = await getConnection();
  if (conn) {
        const uids: number[] = [];
        if (param.UpName) {
            let upid: number[]|undefined = [];
            const uparam = {
                findString: param.UpName
            };
            upid = await getUsers(conn, uparam);
            if (!upid || upid.length === 0) {
                msg.ErrNo = 9;
                msg.ErrCon = "Get BetLists error!";
                conn.release();
                res.send(JSON.stringify(msg));
            }
            param.UpId = upid;
        }
        const users = await getUsers(conn, param);
        if (users) {
            users.map((itm) => {
                uids.push(itm.id);
            });
        }
        console.log("getbetHeaders:", param);
        const ans = await afunc.getBetHeaders(param, conn, uids);
       // console.log("AdminApi /getBetHeaders ans", ans);
        if (ans) {
          msg.data = ans;
          msg.users = users;
        } else {
          msg.ErrNo = 9;
          msg.ErrCon = "Get BetLists error!";
        }
        conn.release();
  } else {
      msg.ErrNo = 9;
      msg.ErrCon = "Get Connection error!";
  }
  res.send(JSON.stringify(msg));
});
app.get("/getTermIDByGameID", async (req: Request, res: Response) => {
    // await getCurTermId();
    const conn = await getConnection();
    let msg: IMsg = {ErrNo: 0};
    if (conn) {
        msg = await getTermIds(req.query.GameID, conn);
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get Connection error!";
    }
    res.send(JSON.stringify(msg));
});
app.get("/getBetTotal", async (req, res) => {
    const param: ICommonParams = req.query;
    const sql: string = getBetTotalSql(param);
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection();
    if (conn) {
        const data = await doQuery(sql, conn);
        const ids: number[] = [];
        if (data) {
            msg.data = data;
            data.map((itm) => {
                ids.push(itm.UpId);
            });
        }
        if (ids.length > 0) {
            const sqlusr = `select id,Account from User where id in (${ids.join(",")})`;
            const usr = await doQuery(sqlusr, conn);
            if (usr) {
                msg.User = usr;
            }
        }
        conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Connection error!!";
    }
    res.send(JSON.stringify(msg));
});
app.get("/getLastTerm", async (req, res) => {
    const msg: IMsg = { ErrNo: 0 };
    const conn = await getConnection();
    if (conn) {
        const param = req.query;
        const term = await afunc.getLastTerm(param.GameID, conn);
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
    res.send(JSON.stringify(msg));
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
    const tse: string|undefined = getCondTSE("CreateTime", param.SDate, param.EDate);
    if (tse) {
        cond.push(tse);
    }
    if (param.Ledger) {
        extField = ",BetType";
    }
    const sql: string = `SELECT UpId${extField},sum(Amt) Total,sum(WinLose) WinLose FROM BetTable
        WHERE ${cond.length > 0 ? cond.join("and") : 1 }
        group by UpId${extField}`;
    return sql;
}
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
export default app;
