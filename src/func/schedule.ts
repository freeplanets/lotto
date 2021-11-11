import mariadb from "mariadb";
import schedule from "node-schedule";
import DateFunc from "../components/class/Functions/MyDate";
import * as db from "./db";
// 秒 分 時 日 月 星期
export function scheduleTest() {
  schedule.scheduleJob("30 50 23 * * *", () => {
    // const d: string = dateAddZero(new Date().toLocaleDateString("zh-TW", {timeZone: "Asia/Taipei"}));
    const d = DateFunc.toDbDateString();
    doDayTotal(d);
    console.log("scheduleTest:", DateFunc.toLocalString());
  });
}
async function doDayTotal(d: string) {
  const conn: mariadb.PoolConnection|undefined = await db.getConnection();
  if (conn) {
    const sqls: string[] = [];
    let sql: string;
    const  cond: string = d ? `and convert(CreateTime,Date)='${d}'` : "";
    /*
    // UpId total
    sql = "insert into DayReport(SDate,UpId,UserID,tid,GameID,BetType,Total,WinLose)";
    sql += " select convert(CreateTime,Date) SDate,UpId,0,0,0,0,sum(Total) Total,sum(WinLose) WinLose ";
    sql += ` From BetHeader where isCancled = 0 ${cond} group by convert(CreateTime,Date),UpId`;
    sql += " on duplicate key update Total=values(Total),WinLose=values(WinLose)";
    sqls.push(sql);
    */
    /*
    // UpId total with GameID
    sql = "insert into DayReport(SDate,UpId,UserID,tid,GameID,BetType,Total,WinLose)";
    sql += " select convert(CreateTime,Date) SDate,UpId,0,0,GameID,0,sum(Total) Total,sum(WinLose) WinLose ";
    // sql += ` From BetHeader where isCancled = 0 and convert(CreateTime,Date)='${d}' group by convert(CreateTime,Date),UpId,GameID`;
    sql += ` From BetHeader where isCancled = 0 ${cond} group by convert(CreateTime,Date),UpId,GameID `;
    sql += " on duplicate key update Total=values(Total),WinLose=values(WinLose)";
    sqls.push(sql);
    */
    /*
    // UpId total with GameID,tid
    sql = "insert into DayReport(SDate,UpId,UserID,tid,GameID,BetType,Total,WinLose)";
    sql += " select convert(CreateTime,Date) SDate,UpId,0,tid,GameID,0,sum(Total) Total,sum(WinLose) WinLose ";
    sql += " From BetHeader where isCancled = 0 group by convert(CreateTime,Date),UpId,GameID,tid";
    sql += " on duplicate key update Total=values(Total),WinLose=values(WinLose)";
    sqls.push(sql);
    */

    /*
    // UpId total with GameID,BetType
    sql = "insert into DayReport(SDate,UpId,UserID,tid,GameID,BetType,Total,WinLose)";
    sql += " select convert(CreateTime,Date) SDate,UpId,0,0,GameID,BetType,sum(Amt) Total,sum(WinLose) WinLose ";
    // sql += ` From BetHeader where isCancled = 0 and convert(CreateTime,Date)='${d}' group by convert(CreateTime,Date),UpId,GameID,BetType`;
    sql += ` From BetTable where isCancled = 0 ${cond} group by convert(CreateTime,Date),UpId,GameID,BetType `;
    sql += " on duplicate key update Total=values(Total),WinLose=values(WinLose)";
    sqls.push(sql);
    */

    /*
    // Member(UserID) total
    sql = "insert into DayReport(SDate,UpId,UserID,tid,GameID,BetType,Total,WinLose)";
    sql += " select convert(CreateTime,Date) SDate,UpId,UserID,0,0,0,sum(Total) Total,sum(WinLose) WinLose ";
    // sql += ` From BetHeader where isCancled = 0 and convert(CreateTime,Date)='${d}' group by convert(CreateTime,Date),UpId,UserID`;
    sql += ` From BetHeader where isCancled = 0  ${cond} group by convert(CreateTime,Date),UpId,UserID `;
    sql += " on duplicate key update Total=values(Total),WinLose=values(WinLose)";
    sqls.push(sql);
    */

    /*
    // Member(UserID) total with GameID
    sql = "insert into DayReport(SDate,UpId,UserID,tid,GameID,BetType,Total,WinLose)";
    sql += " select convert(CreateTime,Date) SDate,UpId,UserID,0,GameID,0,sum(Total) Total,sum(WinLose) WinLose ";
    // sql += ` From BetHeader where isCancled = 0 and convert(CreateTime,Date)='${d}' group by convert(CreateTime,Date),UpId,UserID,GameID`;
    sql += ` From BetHeader where isCancled = 0 ${cond} group by convert(CreateTime,Date),UpId,UserID,GameID `;
    sql += " on duplicate key update Total=values(Total),WinLose=values(WinLose)";
    sqls.push(sql);
    */

    // Member(UserID) total with GameID,BetType
    sql = "insert into DayReport(SDate,UpId,UserID,tid,GameID,BetType,Total,WinLose)";
    sql += " select convert(CreateTime,Date) SDate,UpId,UserID,tid,GameID,BetType,sum(Amt) Total,sum(WinLose) WinLose ";
    sql += ` From BetTable where isCancled = 0 ${cond} group by convert(CreateTime,Date),UpId,UserID,tid,GameID,BetType `;
    sql += " on duplicate key update Total=values(Total),WinLose=values(WinLose)";
    sqls.push(sql);
    let ErrRaised = false;
    let counter = 0;
    await Promise.all(sqls.map(async (aSql) => {
      if (ErrRaised) { return; }
      const ans = await db.doQuery(aSql, conn);
      if (!ans) {
          console.log(`err rollback ${counter++}`);
          ErrRaised = true;
          // await conn.rollback();
      }
    })).catch((err) => {
      console.log("doDayTotal", err);
    });
    await conn.release();
  }
}

export function datetime(v: string|number, style?: string) {
  const dt: Date = new Date(typeof(v) === "number" ? v * 1000 : v);
  if (style) {
      if (style === "date") {
          return dt.toLocaleDateString("zh-TW", {timeZone: "Asia/Taipei"});
      }
  }
  return dt.toLocaleString("zh-TW", {timeZone: "Asia/Taipei", hour12: false});
}
function dateAddZero(d: string): string {
  const sep: string = d.indexOf("-") > -1 ? "-" : "/";
  const dArr: string[] = d.split(sep);
  const newA = dArr.map((s) => {
      return addZeroIfUnderTen(s);
  });
  return newA.join(sep);
}
function addZeroIfUnderTen(v: string|number): string {
  const i: number = typeof(v) === "string" ? parseInt(v, 10) : 0;
  if (i < 10) { return "0" + i; }
  return "" + i;
}
