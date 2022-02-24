import mariadb from "mariadb";
import {ISetl, ISqlProc} from "../../DataSchema/if";
import VNNorth from "../SettleType/VNNorth";
import VNNumsNorth, { VNNums } from "./VNNorthNum";
// const SettleMethods = MarkSixST;
export function VNNorthSetl(tid: number, GameID: number, num: string, rtn: any, conn: mariadb.PoolConnection): ISqlProc {
  // let ans: string[] = [];
  const imsr: VNNums = new VNNumsNorth(num).Nums;
  const ans: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  // let sqls: string[];
  let sqls: ISqlProc;
  // console.log("imsr:", imsr);
  rtn.map((rd) => {
      const found: ISetl | undefined = VNNorth.find((el) => el.BetTypes === rd.BetType);
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
  return ans;
}

function CreateSql(tid: number, GameID: number, itm: ISetl, imsr: VNNums, conn?: mariadb.PoolConnection): ISqlProc {
  // let nn: any;
  let sql: string = "";
  // const sqls: string[] = [];
  const sqls: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
	 if (itm.Position !== undefined) {
		if (itm.Position > -1) {
			// console.log("chka:", itm, itm.Position, imsr[itm.NumTarget], imsr[itm.NumTarget][itm.SubName]);
			const nums = imsr[itm.NumTarget][itm.Position];
			sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num ='${nums}' and isCancled=0`;
			sqls.common.push(sql);
		} else {
			const nums = imsr[itm.NumTarget];
			if (itm.PType === "Multi") {
				nums.map((elm) => {
					sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST('x${elm}x' IN BOOLEAN MODE) and isCancled=0`;
					sqls.common.push(sql);
				});
			} else {
				nums.map((elm) => {
					sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num = '${elm}' and isCancled=0`;
					sqls.common.push(sql);
				});
				/*
				sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nums.join(",")}') and isCancled=0`;
				sqls.common.push(sql);
				*/
			}
		}
  } else {
    const nums = imsr[itm.NumTarget];
		  if (Array.isArray(nums)) {
			sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nums.join("','")}') and isCancled=0`;
		} else {
			sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num '${nums}' and isCancled=0`;
		}
    sqls.common.push(sql);
  }
  if (itm.MultiPay) {
    sql = `update BetTable set WinLose=Payouts*OpNums-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums>=${itm.OpenAll}`;
  } else {
    sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
  }
  sqls.common.push(sql);
  return sqls;
}
