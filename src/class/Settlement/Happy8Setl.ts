import mariadb from "mariadb";
import {ISetl, ISqlProc} from "../../DataSchema/if";
import {IExProc} from "../Bet";
import Happy8 from "../SettleType/Happy8";
import {Happy8Result, IHappy8Result} from "./Happy8Result";
// const SettleMethods = MarkSixST;
export function Happy8Setl(tid: number, GameID: number, num: string, rtn: any, conn: mariadb.PoolConnection): ISqlProc {
  // let ans: string[] = [];
  const imsr: IHappy8Result = new Happy8Result(num).Nums;
  const ans: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  // let sqls: string[];
  let sqls: ISqlProc;
  // console.log("imsr:", imsr);
  rtn.map((rd) => {
      const found: ISetl | undefined = Happy8.find((el) => el.BetTypes === rd.BetType);
      if (found) {
          sqls = CreateSql(tid, GameID, found, imsr, conn);
          if (sqls.pre.length > 0) {
              ans.pre = ans.pre.concat(sqls.pre);
          }
          if (sqls.common.length > 0) {
              ans.common = ans.common.concat(sqls.common);
          }
      }
  });
  ans.final = `update Terms set Result='${imsr.Nums.join(",")}',ResultFmt='${JSON.stringify(imsr)}',isSettled=? where id=${tid}`;
  // console.log("Happy8Setl:", ans);
  return ans;
}

function CreateSql(tid: number, GameID: number, itm: ISetl, imsr: IHappy8Result, conn?: mariadb.PoolConnection): ISqlProc {
  let nn: any;
  let sql: string = "";
  // const sqls: string[] = [];
  const sqls: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  if (itm.Position !== undefined) {
    const nums = imsr[itm.NumTarget];
    if (typeof(itm.Position) === "number") {
      if (itm.Position < 0) {
        if (itm.OpenLess) {
          // 連碼多派 例：三中二
          sql = `update BetTableEx set Opened=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in (${nums.join(",")})`;
          sqls.pre.push(sql);

          sql = `update BetTable b,
          (SELECT betid,tGroup,count(*) OpNums,CASE UseAvgOdds WHEN 1 then SUM(ODDS)/count(*) when 0 then MIN(Odds) end Odds FROM BetTableEx
          where GameID=${GameID} and tid=${tid} and BetType=${itm.BetTypes} and Opened=1 group by betid,tGroup HAVING OpNums > 1) t set b.OpNums=t.OpNums,b.Odds=t.Odds,b.Payouts=b.Amt*t.Odds
          where b.betid=t.betid and b.tGroup=t.tGroup and b.GameID=${GameID} and tid=${tid} and BetType=${itm.BetTypes} and b.isCancled=0`;
          sqls.pre.push(sql);
        } else {
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nums.join("','")}') and isCancled=0`;
          sqls.common.push(sql);
        }
      } else {
        sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num ='${nums[itm.Position]}' and isCancled=0`;
        sqls.common.push(sql);
      }
    } else {
      if (itm.PType === "EACH") {
        itm.Position.map((idx) => {
            sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST ('x${nums[idx]}x' IN BOOLEAN MODE) and isCancled=0`;
            sqls.common.push(sql);
        });
      } else {
        sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nums.join("','")}') and isCancled=0`;
        sqls.common.push(sql);
      }
    }
  } else {
    nn = imsr[itm.NumTarget];
    if (itm.SubName) { nn = imsr[itm.NumTarget][itm.SubName]; }
    if (itm.TieNum && itm.TieNum === nn) {
        sql = `update BetTable set WinLose=0,validAmt=0 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and isCancled=0`;
    } else {
      sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${nn}' and isCancled=0`;
    }
    sqls.common.push(sql);
  }
  if (itm.OpenLess) {
    sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenLess}`;
    sqls.common.push(sql);
    sql = `update BetTable set WinLose=Payouts1-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
    sqls.common.push(sql);
  } else {
    sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
    sqls.common.push(sql);
  }
  return sqls;
}
