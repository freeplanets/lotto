import mariadb from "mariadb";
import {getUsers} from "../API/MemberApi";
import JTable from "../class/JTable";
import {ICommonParams, IMsg} from "../DataSchema/if";
import {IGame, IPayClassParam, IPayRateItm} from "../DataSchema/user";
import {doQuery} from "../func/db";

export async function setPayRateData(GameID: number, PayClassID: number, ModifyID: number, data: any, conn: mariadb.PoolConnection): Promise<boolean> {
  const jt: JTable<IPayRateItm> = new JTable(conn, "PayRate");
  data.map((itm: IPayRateItm) => {
      itm.id = 0;
      itm.GameID = GameID;
      itm.PayClassID = PayClassID;
      itm.ModifyID = ModifyID;
  });
  const ans = await jt.MultiInsert(data);
  if (ans) {
      return true;
  }
  return false;
}

export async function setPayRate(param: IPayClassParam, conn: mariadb.PoolConnection) {
  let diff: string = "";
  if (param.RateType === 0) {
      diff = param.RateDiff as string;
  } else if (param.RateType === 1) {
      diff = `Round(${param.RateDiff}*Probability*Steps)*Steps`;
  } else {
      diff = `Round(((1-${param.RateDiff})/Probability-DfRate)/Steps)*Steps`;
  }

  const sql = `insert into PayRate(PayClassID,GameID,BetType,SubType,Rate,ModifyID)
      select ${param.PayClassID},GameID,BetType,SubType,${diff},${param.ModifyID}
      from BasePayRate where GameID = ?
  `;
  let ans;
  console.log("sql:", sql);
  await conn.query(sql, [param.GameID]).then((v) => {
      // console.log(JSON.stringify(v));
      ans = v;
  }).catch((err) => {
      console.log("setPayRate error", err);
      ans = err;
  });
  return ans;
}
export async function isPayClassUsed(GameID: string, PayClassID: string, conn: mariadb.PoolConnection): Promise<boolean> {
  let ans: boolean = false;
  const sql = "select PayClass from User where PayClass !=''";
  await conn.query(sql).then((res) => {
      const iPID: number = parseInt(PayClassID, 10);
      res.map((itm) => {
          const pc = JSON.parse(itm.PayClass);
          console.log("pc", pc);
          if (pc[GameID] === iPID) {
              ans = true;
              return ans;
          }
      });
  }).catch((err) => {
      console.log("isPayClassUsed Error:", err);
  });
  return ans;
}
export async function chkTermIsSettled(GameID: string|number, conn: mariadb.PoolConnection, tid?: number): Promise<boolean> {
  const param: number[] = [GameID as number];
  let sql: string = "select * from Terms where GameID=?";
  let ans: boolean = true;
  if (tid) {
      sql = sql + " and id=?";
      param.push(tid);
  } else {
      sql = sql + " and isSettled=0";
  }
  await conn.query(sql, param).then((rows) => {
      // console.log("chkTermIsSettled:", rows[0], sql, param);
      if (tid) {
          ans = !!rows[0].isSettled;
      } else {
          ans = rows.affectedRows > 0;
      }
  }).catch((err) => {
      console.log("chkTermIsSettled:", err);
      ans = true;
  });
  return ans;
}
export async function CreateOddsData(GameID: string|number, tid: number, conn: mariadb.PoolConnection) {
  let sql: string = "";
  sql = "select * from CurOddsInfo where tid = ? and GameID= ? limit 0,1";
  const params = [tid, GameID];
  let isEmpty: boolean = false;
  let msg: IMsg = {
      ErrNo: 0,
      ErrCon: "",
  };
  await conn.query(sql, params).then((row) => {
      if (row.affectedRows > 0) { isEmpty = true; }
  }).catch((err) => {
      console.log(err);
      msg.ErrNo = 6;
      msg.ErrCon = JSON.stringify(err);
      msg.debug =  sql + ">>" + params.join(",");
  });
  if (!isEmpty) {
      sql = `insert into CurOddsInfo(tid,OID,GameID,BetType,Num,Odds,MaxOdds,Steps)
          SELECT ${tid} tid,1 OID,d.GameID,d.BetType,d.Num,b.DfRate Odds,TopRate MaxOdds,Steps
      FROM dfOddsItems d left join BasePayRate b on d.GameID=b.GameID and d.BetType = b.BetType and d.SubType = b.SubType
      where d.GameID= ${GameID}
      `;
      await conn.query(sql).then((row) => {
          msg.ErrCon = JSON.stringify(row);
      }).catch((err) => {
          console.log(err);
          msg.ErrNo = 7;
          msg.ErrCon = JSON.stringify(err);
          msg.debug = sql;
      });
      if (msg.ErrNo === 0 && GameID === 1) {
          msg = await setBt15Odds(tid, GameID, conn);
      }
  }
  return msg;
}

async function setBt15Odds(tid: number, GameID: number|string, conn: mariadb.PoolConnection) {
  let msg: IMsg = await getGameParams(GameID, conn);
  const twoside: number[] = [12, 13];
  const colorwave: number[] = [14];
  if (msg.ErrNo !== 0) {
      return msg;
  }
  const games: IGame = msg.data as IGame;
  msg = await updateCurOdds(tid, GameID, twoside, games.PDiffTwoSide, conn);
  if (msg.ErrNo !== 0 ) {
      return msg;
  }
  msg = await updateCurOdds(tid, GameID, colorwave, games.PDiffColorWave, conn);
  return msg;
}

async function getGameParams(GameID: number|string, conn: mariadb.PoolConnection) {
  const msg: IMsg = {ErrNo: 0};
  const sql = "select * from Games where id=?";
  await conn.query(sql, [GameID]).then((rows) => {
      if (rows.length > 0) {
          msg.data = rows.pop();
      }
  }).catch((err) => {
      console.log("getGameParams:", err);
      msg.ErrNo = 9;
      msg.ErrCon = err;
  });
  if (!msg.data) {
      msg.ErrNo = 8;
  }
  return msg;
}

async function updateCurOdds(tid: number, GameID: string|number, Bts: number[], OddsPlus: number, conn: mariadb.PoolConnection) {
  let sql = `
      select CONCAT(BetType,Num) Num,(Odds + ${OddsPlus}) Odds, MaxOdds,Steps
      from CurOddsInfo where tid=${tid} and GameID = ${GameID} and BetType in (${Bts.join(",")})
  `;
  const msg: IMsg = {ErrNo: 0};
  await conn.query(sql).then((rows) => {
      msg.data = rows;
  }).catch((err) => {
      console.log("updateCurOdds:", err);
      msg.ErrNo = 9;
      msg.ErrCon = err;
  });
  if (msg.ErrNo !== 0) {
      return msg;
  }
  const maxid = new Date().getTime();
  const dtas: any = msg.data;
  const data: string[] = [];
  dtas.map((itm) => {
      data.push(`(${tid},${maxid},${GameID},15,${itm.Num},${itm.Odds},${itm.MaxOdds},${itm.Steps})`);
  });
  sql = `
  insert into  CurOddsInfo(tid,OID,GameID,BetType,Num,Odds,MaxOdds,Steps)
  values${data.join(",")}
  on duplicate key update Odds=values(Odds),MaxOdds=values(MaxOdds),Steps=values(Steps)
`;
  console.log("updateCurOdds", sql);
  await conn.query(sql).then((row) => {
      msg.ErrCon = row;
  }).catch((err) => {
      console.log("updateCurOdds:", err);
      msg.ErrNo = 9;
      msg.ErrCon = err;
  });
  return msg;
}

export async function getGameList(conn: mariadb.PoolConnection) {
  const sql: string = "select id,name from Games where 1";
  let ans;
  await conn.query(sql).then((rows) => {
     ans = rows;
  }).catch((err) => {
      ans = err;
  });
  return ans;
}

export async function getBtList(GameID: number|string, conn: mariadb.PoolConnection) {
  const sql: string = "select BetType id,Title name,isParlay from BasePayRate where GameID=?  and SubType=0";
  let ans;
  await conn.query(sql, [GameID]).then((rows) => {
      ans = rows;
  }).catch((err) => {
      ans = err;
  });
  return ans;
}

export async function getCurTermId(GameID: number|string, conn: mariadb.PoolConnection): Promise<number|undefined> {
  const sql = `select id from Terms where GameID=? order by id desc limit 0,1`;
  let ans: number = 0;
  const res = await doQuery(sql, conn, [GameID]);
  // console.log("getCurTermId:", res);
  if (res) {
      ans = res[0].id;
  } else {
      return undefined;
  }
  return ans;
}

export async function getCurOddsInfo(tid: number, GameID: number|string, MaxOddsID: number, conn: mariadb.PoolConnection): Promise<any> {
  const gameStoped: boolean = await chkTermIsSettled(GameID, conn, tid);
  // console.log("getCurOddsInfo gameStoped:", gameStoped);
  const sql = `select OID,BetType,Num,Odds,MaxOdds,isStop,tolW,tolS,tolP,Steps from CurOddsInfo where tid=? and GameID=? and OID > ?`;
  const ans = {};
  const res = await doQuery(sql, conn, [tid, GameID, MaxOddsID]);
  if (res) {
      res.map((itm) => {
          if (!ans[itm.BetType]) { ans[itm.BetType] = {}; }
          const tmp = {
              OID: itm.OID,
              Odds: itm.Odds,
              MaxOdds: itm.MaxOdds,
              isStop: itm.isStop | (gameStoped ? 1 : 0),
              tolW: itm.tolW,
              tolS: itm.tolS,
              tolP: itm.tolP,
              Steps: itm.Steps
          };
          ans[itm.BetType][itm.Num] = Object.assign({}, tmp);
      });
  } else  {
      return;
  }
  return ans;
}

export async function getOddsInfo(tid: number, GameID: number, BT: number, Num: number, conn: mariadb.PoolConnection): Promise<any> {
  const sql = "select Odds,MaxOdds,isStop,Steps from CurOddsInfo where tid=? and GameID=? and BetType=? and Num=?";
  const ans = await doQuery(sql, conn, [tid, GameID, BT, Num]);
  if (ans) {
      return ans[0];
  }
  return undefined;
}

export async function setOdds(tid: number, GameID: number, BT: number, Num: number, Odds: number, UserID: number, conn: mariadb.PoolConnection): Promise<any> {
    const maxid = new Date().getTime();
    const sql = `update CurOddsInfo set Odds=?,OID=${maxid} where tid=? and GameID=? and BetType=? and Num=?`;
    const ans = await doQuery(sql, conn, [Odds, tid, GameID, BT, Num]);
    if (ans) {
        const sql1 = `insert into OddsInfoLog(tid,OID,GameID,BetType,Num,Odds,isStop,UserID)
            select tid,OID,GameID,BetType,Num,Odds,isStop,${UserID} UserID from CurOddsInfo
            where tid=? and GameID=? and BetType=? and Num=? `;
        await doQuery(sql1, conn, [tid, GameID, BT, Num]);
        // console.log("Insert Odds log:", sql1, ans1);
        return ans;
    }
    return undefined;
}

export async function setStop(tid: number, GameID: number, isStop: number, UserID: number, conn: mariadb.PoolConnection, BetTypes?: string, Num?: string): Promise<any> {
    const maxid = new Date().getTime();
    const BTS: string = !!BetTypes  ? ` and BetType in (${BetTypes})` : "";
    const NN: string = Num !== undefined ? ` and Num=${Num}` : "";
    const sql = `update CurOddsInfo set isStop=?,OID=${maxid} where tid=? and GameID=? ${BTS}${NN}`;
    const ans = await doQuery(sql, conn, [isStop, tid, GameID]);
    if (ans) {
        const Bt = BetTypes ? BetTypes : "all";
        const Nm = Num ? Num : -1;
        const sql1 = `insert into OddsInfoLog(tid,OID,GameID,BetType,Num,isStop,UserID)
            values(${tid},${maxid},${GameID},'${Bt}',${Nm},${isStop},${UserID})`;
        await doQuery(sql1, conn);
        return ans;
    }
    return undefined;
}

export async function saveComments(pagename: string, comments: string, conn: mariadb.PoolConnection): Promise<any> {
    const sql = "insert into PageComments(PageName,Comments) values(?,?) on duplicate key update Comments=values(Comments)";
    const ans = await doQuery(sql, conn, [pagename, comments]);
    if (ans) {
        return ans;
    } else {
        return undefined;
    }
}

export async function getComments(pagename: string, conn: mariadb.PoolConnection): Promise<any> {
    const sql = "select * from PageComments where PageName = ? ";
    const ans = await doQuery(sql, conn, [pagename]);
    if (ans) {
        return ans;
    } else {
        return undefined;
    }
}

export async function getBetHeaders(param: ICommonParams, conn: mariadb.PoolConnection, uids?: number[]): Promise<any> {
    let cond: string[] = [];
    if (param.SDate) {
        cond.push(` (t.CreateTime BETWEEN '${param.SDate}' AND '${param.SDate} 23:59:59') `);
    }
    if (uids) {
        cond.push(` UserID in (${uids.join(",")}) `);
    }
    if (param.GameID) {
        if (param.GameID > 0) {
            cond.push(` b.GameID = ${param.GameID} `);
        }
    }
    if (param.tid) {
        cond.push(` b.tid = ${param.tid} `);
    }
    if (param.BetID) {
        cond.push(` b.id in (${param.BetID}) `);
    }
    if (param.BetType) {
        cond.push(` BetContent like '%"BetType":${param.BetType}%'`);
    }
    const f = getCond(param);
    if (f) {
        cond = cond.concat(f);
    }
    const sql = `select b.*,t.TermID from BetHeader b left join Terms t on b.tid=t.id where ${cond.join(" and ")}`;
    console.log("ApiFunc get getBetHeaders sql:", sql, cond);
    let rr;
    await conn.query(sql).then((res) => {
        // console.log("ApiFunc get getBetHeaders res:", res);
        rr =  res;
    }).catch((err) => {
        console.log("ApiFunc get getBetHeaders error:", err);
    });
    return rr;
}
function getCond(param: ICommonParams): string[]|undefined {
    const tmp: string[] = [];
    if (param.SDate) {
        if (!param.EDate) {
            param.EDate = param.SDate;
        }
    } else {
        if (param.EDate) {
            param.SDate = param.EDate as string;
        }
    }
    if (param.SDate) {
        if (!param.STime) { param.STime = "00:00:00"; }
        if (!param.ETime) { param.ETime = "23:12:59"; }
        tmp.push(`CreateTime BETWEEN '${param.SDate} ${param.STime}' and '${param.EDate} ${param.ETime}' `);
    }
    const f1 = getCondSE("Total", param.OrdAmtS as number, param.OrdAmtE as number);
    if (f1) {
        tmp.push(f1);
    }
    const f2 = getCondSE("WinLose", param.WinLoseS as number, param.WinLoseE as number);
    if (f2) {
        tmp.push(f2);
    }
    if (tmp.length > 0) { return tmp; }
    return;
}
function getCondSE(field: string, start?: number, end?: number): string|undefined {
    let cond: string|undefined;
    if (start) {
        if (end) {
            cond = `${field} between ${start} and ${end} `;
        } else {
            cond = ` ${field} = ${start} `;
        }
    } else {
        if (end) {
            cond = ` ${field} between 0 and  ${end} `;
        }
    }
    return cond;
}
