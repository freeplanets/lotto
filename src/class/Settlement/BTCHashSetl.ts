import mariadb from "mariadb";
import {ISetl, ISqlProc} from "../../DataSchema/if";
import BTCHash from "../SettleType/BTCHash";
import {BTCHashNum, IBTCHashResult} from "./BTCHashNum";
// const SettleMethods = MarkSixST;
export function BTCHashSetl(tid: number, GameID: number, num: string, rtn: any, conn: mariadb.PoolConnection): ISqlProc {
  // let ans: string[] = [];
  const imsr: IBTCHashResult = new BTCHashNum(num).Nums;
  const ans: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  // let sqls: string[];
  let sqls: ISqlProc;
  // console.log("imsr:", imsr);
  rtn.map((rd) => {
      const found: ISetl | undefined = BTCHash.find((el) => el.BetTypes === rd.BetType);
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
  // console.log("BTCHashSetl:", ans);
  return ans;
}

function CreateSql(tid: number, GameID: number, itm: ISetl, imsr: IBTCHashResult, conn?: mariadb.PoolConnection): ISqlProc {
  let nn: any;
  let sql: string = "";
  // const sqls: string[] = [];
  const sqls: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  if (itm.Position === undefined) {
    if (itm.PType === "EACH") {
        const nums: string[] = imsr[itm.NumTarget];
        nums.map((num) => {
            sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST ('x${num}x' IN BOOLEAN MODE) and isCancled=0`;
            sqls.common.push(sql);
        });
    } else {
        // console.log("CreateSql nums", itm, nums, imsr);
        if (itm.SubName) { nn = imsr[itm.NumTarget][itm.SubName]; } else { nn = imsr[itm.NumTarget]; }
        if (Array.isArray(nn)) {
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nn.join("','")}') and isCancled=0`;
        } else {
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num = '${nn}' and isCancled=0`;
        }
        sqls.common.push(sql);
    }
  } else {
    if (typeof(itm.Position) === "number") {
      nn = imsr[itm.NumTarget][itm.Position];
      if (itm.SubName) { nn = imsr[itm.NumTarget][itm.Position][itm.SubName]; }
      sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${nn}' and isCancled=0`;
      sqls.common.push(sql);
    } else {
      const nums = imsr[itm.NumTarget];
      const newN = itm.Position.map((idx) => nums[idx]);
      sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${newN.join("','")}') and isCancled=0`;
      sqls.common.push(sql);
    }
  }
  if (itm.NumTarget === "PASS") {
    sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=OpPASS and isCancled=0`;
  } else {
    sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll} and isCancled=0`;
  }
  sqls.common.push(sql);
  return sqls;
}
