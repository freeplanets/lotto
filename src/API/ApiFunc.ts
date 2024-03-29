import mariadb, {PoolConnection} from "mariadb";
// import {getUsers} from "../API/MemberApi";
import JTable from "../class/JTable";
import StrFunc from "../components/class/Functions/MyStr";
import { ErrCode } from "../DataSchema/ENum";
import {IChaseNum, ICommonParams, IDbAns, IMsg, IParamLog} from "../DataSchema/if";
import {IGame, IPayClassParam, IPayRateItm, ITerms, IUserPartial} from "../DataSchema/user";
import { BeginTrans, Commit, doQuery, RollBack} from "../func/db";

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
      // console.log(StrFunc.stringify(v));
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
          const pc = JSON.parse(itm.PayClass.replace(/\\/g, ""));
          // console.log("pc", pc);
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
export async function DeleteOddsData(GameID: string|number, GType: string, tid: number, conn: mariadb.PoolConnection): Promise<IMsg> {
    return new Promise<IMsg>((resolve) => {
        const sql = `delete from CurOddsInfo where GameID = ? and tid < ? `;
        const params = [GameID, tid];
        const msg: IMsg = { ErrNo: ErrCode.PASS };
        conn.query(sql, params).then((res) => {
            msg.debug = res;
            resolve(msg);
        }).catch((err) => {
            msg.ErrNo = ErrCode.DB_QUERY_ERROR;
            msg.error = err;
            resolve(msg);
        });
    });
}
export async function CreateOddsData(GameID: string|number, GType: string, tid: number, conn: mariadb.PoolConnection): Promise<IMsg> {
  let sql: string = "";
  sql = "select * from CurOddsInfo where tid = ? and GameID= ? limit 0,1";
  const params = [tid, GameID];
  let isEmpty: boolean = false;
  let msg: IMsg = {
      ErrNo: 0,
      ErrCon: "",
  };
  let stop: number = 1;
  const isAutoOpen = await isGameAutoOpen(GameID, conn);
  if (isAutoOpen) {
      stop = 0;
  }
  conn.query(sql, params).then((row) => {
      if (row.affectedRows > 0) { isEmpty = true; }
  }).catch((err) => {
      console.log(err);
      msg.ErrNo = 6;
      msg.ErrCon = StrFunc.stringify(err);
      msg.debug =  sql + ">>" + params.join(",");
  });
  if (!isEmpty) {
      sql = `insert into CurOddsInfo(tid,GameID,BetType,SubType,Num,Odds,MaxOdds,isStop,Steps,PerStep)
          SELECT ${tid} tid,b.GameID,d.BetType,d.SubType,d.Num,b.DfRate Odds,TopRate MaxOdds,${stop} isStop,b.Steps,b.PerStep
      FROM dfOddsItems d, BasePayRate b where b.GameID= ${GameID} and d.GType='${GType}' and d.BetType = b.BetType and d.SubType = b.SubType
      `;
      console.log("CreateOddsData dfOddsItems chk:", tid, GameID);
      await conn.query(sql).then((row) => {
          msg.ErrCon = StrFunc.stringify(row);
      }).catch((err) => {
          console.log(err);
          msg.ErrNo = 7;
          msg.ErrCon = StrFunc.stringify(err);
          msg.debug = sql;
      });
      if (msg.ErrNo === 0) {
          if (GType === "MarkSix" || GType === "BTCHash") {
            msg = await setBt15Odds(tid, GameID, GType, conn, stop);
          }
      }
      /*
      if (msg.ErrNo === 0 && GameID === 1) {
          msg = await setBt15Odds(tid, GameID, conn);
      }
      */
  }
  return msg;
}

async function setBt15Odds(tid: number, GameID: number|string, GType: string, conn: mariadb.PoolConnection, stop: number) {
  let msg: IMsg = await getGameParams(GameID, conn);
  let twoside: number[] = [];
  let colorwave: number[] = [];
  let passBT: number = 0;
  if (GType === "MarkSix") {
    twoside = [12, 13];
    colorwave = [14];
    passBT = 15;
  } else if (GType === "BTCHash") {
    twoside = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    passBT = 47;
  }
  if (msg.ErrNo !== 0) {
      return msg;
  }
  const games: IGame = msg.data as IGame;
  if (twoside.length > 0) {
    msg = await updateCurOdds(tid, GameID, twoside, games.PDiffTwoSide, conn, passBT, stop);
    if (msg.ErrNo !== 0 ) {
        return msg;
    }
  }
  if (colorwave.length > 0) {
    msg = await updateCurOdds(tid, GameID, colorwave, games.PDiffColorWave, conn, passBT, stop);
  }
  return msg;
}

async function getGameParams(GameID: number|string, conn: mariadb.PoolConnection): Promise<IMsg> {
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

async function updateCurOdds(tid: number, GameID: string|number, Bts: number[], OddsPlus: number, conn: mariadb.PoolConnection, passBT: number, stop: number) {
  let sql = `
      select CONCAT(BetType,Num) Num,(Odds + ${OddsPlus}) Odds, MaxOdds
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
  // const maxid = new Date().getTime();
  const dtas: any = msg.data;
  const data: string[] = [];
  dtas.map((itm) => {
      data.push(`(${tid},${GameID},${passBT},${itm.Num},${itm.Odds},${itm.MaxOdds},${stop})`);
  });
  sql = `
  insert into CurOddsInfo(tid,GameID,BetType,Num,Odds,MaxOdds,isStop)
  values${data.join(",")}
  on duplicate key update Odds=values(Odds),MaxOdds=values(MaxOdds),isStop=values(isStop)
`;
  // console.log("updateCurOdds", sql);
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
  const sql: string = "select id,name,GType from Games where GType != '' order by MbrIfOrder";
  let ans;
  await conn.query(sql).then((rows) => {
     ans = rows;
  }).catch((err) => {
      ans = err;
  });
  return ans;
}

export async function getBtList(GameID: number|string, conn: mariadb.PoolConnection) {
  const sql: string = "select b.BetType id,b.Title name,p.isParlay,b.MinHand from BasePayRate b left join ProbabilityTable p on b.GType=p.GType and b.BetType=p.BetType and b.SubType=p.SubType where b.GameID=?  and b.SubType=0";
  const ans = await doQuery(sql, conn, [GameID]);
  /*
  await conn.query(sql, [GameID]).then((rows) => {
      ans = rows;
  }).catch((err) => {
      ans = err;
  });
  */
  return ans;
}

export async function getCurTermId(GameID: number|string, conn: mariadb.PoolConnection): Promise<number|undefined> {
  const sql = `select id from Terms where GameID=? order by id desc limit 0,1`;
  let ans: number = 0;
  const res = await doQuery(sql, conn, [GameID]);
  if (res && res[0] ) {
    // console.log("getCurTermId:", res[0]);
    ans = res[0].id;
  } else {
      return undefined;
  }
  return ans;
}

export async function getCurOddsInfo(tid: number, GameID: number|string, MaxOddsID: number, conn: mariadb.PoolConnection, PayClassID = 0): Promise<any> {
  if (!tid) { return false; }
  const gameStoped: boolean = await chkTermIsSettled(GameID, conn, tid);
  // console.log("getCurOddsInfo gameStoped:", gameStoped);
  let sql = "";
  const param = [tid, GameID, MaxOddsID];
  if (PayClassID) {
    /*
    sql = `SELECT UNIX_TIMESTAMP(OID) OID,c.BetType,Num,Odds+Rate Odds,isStop,Steps
    FROM CurOddsInfo c left join PayRate p on c.GameID=p.GameID and c.BetType=p.BetType  and c.SubType=p.SubType
    WHERE c.GameID=? and tid=? and PayClassID=? and UNIX_TIMESTAMP(OID) > ?`;
    */
    sql = `select UNIX_TIMESTAMP(OID) OID,c.BetType,c.SubType,Num,Odds+Rate Odds,MaxOdds,isStop,Steps,PerStep,tolW,tolS,tolP
    from CurOddsInfo c left join PayRate p on c.GameID=p.GameID and c.BetType=p.BetType  and c.SubType=p.SubType
    where tid=? and c.GameID=? and UNIX_TIMESTAMP(OID) > ? and PayClassID = ?`;
    param.push(PayClassID);
  } else {
    sql = `select UNIX_TIMESTAMP(OID) OID,BetType,SubType,Num,Odds,MaxOdds,isStop,Steps,PerStep,tolW,tolS,tolP
    from CurOddsInfo where tid=? and GameID=? and UNIX_TIMESTAMP(OID) > ?`;
  }
  const ans = {};
  const res = await doQuery(sql, conn, param);
  // console.log("getCurOddsInfo:", sql, param);
  if (res) {
      // console.log("getCurOddsInfo", res);
      res.map((itm) => {
          if (!ans[itm.BetType]) { ans[itm.BetType] = {}; }
          const tmp = {
              OID: itm.OID,
              Odds: itm.Odds,
              MaxOdds: itm.MaxOdds,
              SubType: itm.SubType,
              isStop: itm.isStop | (gameStoped ? 1 : 0),
              Steps: itm.Steps,
              PerStep: itm.PerStep,
              tolW: itm.tolW,
              tolS: itm.tolS,
              tolP: itm.tolP,
          };
          ans[itm.BetType][itm.Num] = Object.assign({}, tmp);
      });
      /*
      if (MaxOddsID === 0) {
          const oddSql = "insert into OpHistory(GameID, tid, OddsInfo) values(?,?,?) on duplicate key update GameID=values(GameID)";
          doQuery(oddSql, conn, [GameID, tid, StrFunc.stringify(ans)]).then((saveinfo) => {
            console.log("save odds history:", saveinfo);
          }).catch((err) => {
            console.log("save odds history error:", err);
          });
      }
      */
  } else  {
      return;
  }
  return ans;
}
export async function getOpStep(GameID: number|string, conn: mariadb.PoolConnection) {
    const sql = "select BetType,SubType,PerStep,Steps from BasePayRate where GameID=?";
    const res = await doQuery(sql, conn, [GameID]);
    return res;
}
export async function getOddsInfo(tid: number, GameID: number, BT: number, Num: number, conn: mariadb.PoolConnection): Promise<any> {
  const sql = "select Odds,MaxOdds,isStop,Steps from CurOddsInfo where tid=? and GameID=? and BetType=? and Num=?";
  const ans = await doQuery(sql, conn, [tid, GameID, BT, Num]);
  if (ans) {
      return ans[0];
  }
  return undefined;
}
export async function isBothSideAdjust(GameID: number, BT: number, conn: mariadb.PoolConnection): Promise<boolean> {
    const sql = "select g.BothSideAdjust,b.TotalNums from Games g,BasePayRate b where g.id=b.GameID and g.id=? and b.BetType=? order by b.id limit 0,1";
    const ans = await doQuery(sql, conn, [GameID, BT]);
    if (ans[0]) {
        if (ans[0].TotalNums !== 2) { return false; }
        return !!ans[0].BothSideAdjust;
    }
    return false;
}
export async function setOdds(tid: number, GameID: number, BT: number, Num: number, Odds: number, UserID: number, conn: mariadb.PoolConnection): Promise<any> {
    // const maxid = new Date().getTime();
    const sql = `update CurOddsInfo set Odds=? where tid=? and GameID=? and BetType=? and Num=?`;
    const ans = await doQuery(sql, conn, [Odds, tid, GameID, BT, Num]);
    if (ans) {
        const sql1 = `insert into OddsInfoLog(tid,GameID,BetType,Num,Odds,isStop,UserID)
            select tid,GameID,BetType,Num,Odds,isStop,${UserID} UserID from CurOddsInfo
            where tid=? and GameID=? and BetType=? and Num=? `;
        await doQuery(sql1, conn, [tid, GameID, BT, Num]);
        // console.log("Insert Odds log:", sql1, ans1);
        return ans;
    }
    return undefined;
}

export async function setStop(tid: number, GameID: number, isStop: number, UserID: number, conn: mariadb.PoolConnection, BetTypes?: string, Num?: string): Promise<any> {
    // const maxid = new Date().getTime();
    const BTS: string = !!BetTypes  ? ` and BetType in (${BetTypes})` : "";
    const NN: string = Num !== undefined ? ` and Num=${Num}` : "";
    const sql = `update CurOddsInfo set isStop=? where tid=? and GameID=? ${BTS}${NN}`;
    console.log("setStop", sql, [isStop, tid, GameID]);
    const ans = await doQuery(sql, conn, [isStop, tid, GameID]);
    if (ans) {
        const Bt = BetTypes ? BetTypes : "all";
        const Nm = Num ? Num : -1;
        const sql1 = `insert into OddsInfoLog(tid,GameID,BetType,Num,isStop,UserID)
            values(${tid},${GameID},'${Bt}',${Nm},${isStop},${UserID})`;
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
    /*
    if (param.SDate) {
        cond.push(` (b.CreateTime BETWEEN '${param.SDate}' AND '${param.SDate} 23:59:59') `);
    }
    */
    if (uids && uids.length > 0) {
        cond.push(` UserID in (${uids.join(",")}) `);
    }
    if (param.GameID) {
        if (param.GameID as number > 0) {
            cond.push(` b.GameID = ${param.GameID} `);
        }
    }
    if (param.tid) {
        cond.push(` b.tid = ${param.tid} `);
    }
    if (param.UpId) {
        if (Array.isArray(param.UpId)) {
            cond.push(` b.UpId in (${param.UpId.join(",")})`);
        } else {
            cond.push(` b.UpId = ${param.UpId} `);
        }
    }
    if (param.BetID) {
        if (param.isDetail === "1") {
            cond.push(` b.betid in (${param.BetID}) `);
        } else {
            cond.push(` b.id in (${param.BetID}) `);
        }
    }
    if (param.BetType) {
        if (param.isDetail === "1") {
            cond.push(` BetType = ${param.BetType} `);
        } else {
            cond.push(` BetContent like '%"BetType":${param.BetType}%'`);
        }
    }
    if (param.isCanceled !== undefined) {
        cond.push(` isCancled = ${param.isCanceled} `);
    }
    const f = getCond(param);
    if (f) {
        cond = cond.concat(f);
    }
    let table = "BetHeader";
    if (param.isDetail === "1") {
        console.log("isDetail", param.isDetail);
        table = "BetTable";
    }
    /*
    if (param.Table) {
        table = param.Table as string;
    }
    */
    const sql = `select b.*,t.TermID from ${table} b left join Terms t on b.tid=t.id where ${cond.join(" and ")} order by id`;
    // console.log("ApiFunc get getBetHeaders sql:", sql);
    // console.log("ApiFunc get getBetHeaders cond:", cond);
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
        tmp.push(`(b.CreateTime BETWEEN '${param.SDate} ${param.STime}' and '${param.EDate} ${param.ETime}') `);
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
export async function getLastTerm(GameID: number, conn: mariadb.PoolConnection) {
    const sql = "select * from Terms where GameID=? order by id desc limit 0,1";
    const ans = await doQuery(sql, conn, [GameID]);
    return ans;
}

async function isGameAutoOpen(GameID: number|string, conn: mariadb.PoolConnection): Promise<boolean> {
    const sql = "select AutoOpen from Games where id = ?";
    const ans = await doQuery(sql, conn, [GameID]);
    if (ans[0]) {
        if (ans[0].AutoOpen) { return true; }
    }
    return false;
}

export async function createTerms(GType: string, term: ITerms, conn: PoolConnection, PLog?: IParamLog[]) {
    // await conn.beginTransaction();
    await BeginTrans(conn);
    const jt: JTable<ITerms> = new JTable(conn, "Terms");
    let ans;
    let msg: IMsg = {ErrNo: ErrCode.PASS};
    if (term.id) {
        ans = jt.Update(term);
        if (ans) {
            if (PLog) {
                ans = await saveParamLog(PLog, conn);
            }
        }
        if (!ans) {
            await RollBack(conn);
            // await conn.rollback();
            msg.ErrNo = 9;
        } else {
            await Commit(conn);
            // await conn.commit();
            msg.data = ans;
        }
        return msg;
    } else {
        ans = await jt.Insert(term);
        if (ans) {
            console.log("CreateTerm:", term.GameID, ans.insertId);
            const dbans = ans as IDbAns;
            const tid = dbans.insertId;
            msg = await CreateOddsData(term.GameID, GType, tid, conn);
            // console.log("CreateOddsData:", term.GameID, msg);
            await DeleteOddsData(term.GameID, GType, tid, conn);
            // delete last OddsData
        } else {
            msg.ErrNo = ErrCode.DB_QUERY_ERROR;
            msg.error = ans;
        }
    }
    if (msg.ErrNo === ErrCode.PASS) {
        await Commit(conn);
        console.log("createTerms after commit GameID:", term.GameID );
        // await conn.commit();
    } else {
        console.log("CreateOddsData rollback", msg);
        await RollBack(conn);
        // await conn.rollback();
    }
    return msg;
}

export async function saveParamLog(PLog: IParamLog[], conn: mariadb.PoolConnection): Promise<IMsg> {
    const jt: JTable<IParamLog> = new JTable(conn, "ParamsLog");
    return await jt.MultiInsert(PLog);
}

export async function setUser(user: IUserPartial, conn: PoolConnection): Promise<IMsg> {
    const jt: JTable<IUserPartial> = new JTable(conn, "User");
    return await jt.Update(user);
}

export async function getPrograms(lvl: number, progs: string, conn: PoolConnection) {
    const sql = `select * from Programs where ${lvl === 9 ? 1 : "id in (" + progs + ")"  }`;
    return await doQuery(sql, conn);
}

export async function setChaseNum(pa: IChaseNum, conn: PoolConnection) {
    const jt: JTable<IChaseNum> = new JTable(conn, "ChaseNum");
    return await jt.Update(pa);
}
