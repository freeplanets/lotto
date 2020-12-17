import mariadb from "mariadb";
import { mainModule } from "process";
import {ISetl, ISqlProc} from "../../DataSchema/if";
import {IMarkSixNums} from "../MSNum";
import HashSix from "../SettleType/HashSix";
import {CMarkSixMum, IMSResult} from "./CMarkSixMum";
// const SettleMethods = MarkSixST;
export function HashSixSetl(tid: number, GameID: number, imsra: any, rtn: any, conn: mariadb.PoolConnection): ISqlProc {
  // let ans: string[] = [];
  // const imsr: IMSResult = imsra as IMSResult;
  const imsr: IMSResult = new CMarkSixMum(imsra, true).Nums;
  const ans: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  // let sqls: string[];
  console.log("IMSResult:");
  Object.keys(imsr).map((keyname) => {
      if (keyname === "RGNums") {
        imsr.RGNums.map((rgn, idx) => {
            console.log(`${keyname} ${idx + 1}:`, rgn);
        });
      } else {
        console.log(`${keyname}:`, imsr[keyname]);
      }
  });
  let sqls: ISqlProc;
  rtn.map((rd) => {
      const found: ISetl | undefined = HashSix.find((el) => el.BetTypes === rd.BetType);
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
  // console.log("MarkSixSetl sql:", ans);
  /// *
  ans.common.map((sql) => {
      console.log("sql:", sql);
  });
  // */
  return ans;
}

function CreateSql(tid: number, GameID: number, itm: ISetl, imsr: IMSResult, conn: mariadb.PoolConnection): ISqlProc {
  let nn: number|number[];
  let sql: string = "";
  // const sqls: string[] = [];
  const sqls: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  if (itm.NumTarget === "PASS") {
      imsr.RGNums.map((rgn: IMarkSixNums, idx: number) => {
          // sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x12${idx + 1}${rgn.OddEven}x%' and isCancled=0`;
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST('x12${idx + 1}${rgn.OddEven}x' IN BOOLEAN MODE) and isCancled=0`;
          sqls.common.push(sql);
          // sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x13${idx + 1}${rgn.BigSmall}x%' and isCancled=0`;
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST('x13${idx + 1}${rgn.BigSmall}x' IN BOOLEAN MODE) and isCancled=0`;
          sqls.common.push(sql);
          // sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x14${idx + 1}${rgn.ColorWave}x%' and isCancled=0`;
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST('x14${idx + 1}${rgn.ColorWave}x' IN BOOLEAN MODE) and isCancled=0`;
          sqls.common.push(sql);
      });
      sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=OpPASS and isCancled=0`;
      sqls.common.push(sql);
      return sqls;
  }
  if (itm.TieNum && !itm.Position) {
      if (itm.TieNum === imsr.SPNo) {
          // sql = `update BetTable set WinLose=Amt,isSettled=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and isCancled=0`;
          sql = `update BetTable set WinLose=0,validAmt=0 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and isCancled=0`;
          sqls.common.push(sql);
          return sqls;
      }
  }
  if (itm.Position !== undefined) {
      // nn = console.log(typeof(itm.Position));
      if (typeof(itm.Position) === "number") {
          if (itm.Position < 0) {
              // console.log("Position -1:", itm, imsr[itm.NumTarget]);
              const tmp: number[] = imsr[itm.NumTarget];
              // nn = tmp;
              tmp.map((elm) => {
                    // sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x${elm}x%' and isCancled=0`;
                    sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST('x${elm}x' IN BOOLEAN MODE) and isCancled=0`;
                    sqls.common.push(sql);
                });
          } else {
              if (itm.SubName) {
                  nn = imsr[itm.NumTarget][itm.Position][itm.SubName];
              } else {
                  nn = imsr[itm.NumTarget][itm.Position];
              }
              if (itm.TieNum && itm.TieNum === nn) {
                  sql = `update BetTable set WinLose=0,validAmt=0 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and isCancled=0`;
              } else {
                  sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num = '${nn}' and isCancled=0`;
              }
              // sqls.push(sql);
              sqls.common.push(sql);
          }
      } else {
          // const tmp: number[] = [];
          const tmpNN: number[] = [];
          itm.Position.map(async (elm, idx) => {
              console.log("chk1:", itm.BetTypes, itm.NumTarget, elm, itm.SubName, imsr[itm.NumTarget][elm][itm.SubName]);
              // nn = (idx + 1) * 10 + imsr[itm.NumTarget][elm][itm.SubName];
              nn = imsr[itm.NumTarget][elm][itm.SubName];
              if (typeof(nn) === "number") {
                  nn = (idx + 1) * 10 + nn;
                  sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${nn}' and isCancled=0`;
                // sqls.push(sql);
                  sqls.common.push(sql);
                  if (itm.ExtBT) {
                    const num: number = nn as number;
                    const exnn: number = itm.ExtBT * 100 + num;
                    sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.ExtBT} and Num='${exnn}' and isCancled=0`;
                    // sqls.push(sql);
                    sqls.common.push(sql);
                }
              } else {
                nn.map((n) => {
                    tmpNN.push((idx + 1) * 100 + n);
                });
              }
          });
          if (tmpNN.length > 0) {
            sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in (${tmpNN.join(",")}) and isCancled=0`;
            sqls.common.push(sql);
          }
          // nn = tmp;
      }
  } else {
      if (itm.SubName) {
          if (itm.SubName === "length") {
              nn = imsr[itm.NumTarget].length + itm.NumMove;
          } else {
            nn = imsr[itm.NumTarget][itm.SubName];
          }
      } else {
          nn = imsr[itm.NumTarget];
      }
      if (typeof(nn) === "object") {
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nn.join("','")}') and isCancled=0`;
      } else {
          if (itm.PType === "EACH") {
              // sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x${nn}x%' and isCancled=0`;
              sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST('x${nn}x' IN BOOLEAN MODE) and isCancled=0`;
          } else {
              sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${nn}' and isCancled=0`;
          }
      }
      // sqls.push(sql);
      sqls.common.push(sql);
  }
  if (itm.ExSP) {
      nn = imsr[itm.ExSP];
      // sql = `update BetTable set OpSP=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x${nn}x%' and isCancled=0`;
      sql = `update BetTable set OpSP=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST('x${nn}x' IN BOOLEAN MODE) and isCancled=0`;
      // sql = `update BetTableEx set OpSP=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num = ${nn}`;
      // sqls.push(sql);
      sqls.common.push(sql);
  }
  if (itm.OpenSP) {
      if (itm.OpenSP === itm.OpenAll) {
          sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll} and OpSP=${itm.OpenSP}`;
          // sqls.push(sql);
          sqls.common.push(sql);
      } else {
          sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll - itm.OpenSP} and OpSP=${itm.OpenSP}`;
          // sqls.push(sql);
          sqls.common.push(sql);
          sql = `update BetTable set WinLose=Payouts1-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
          // sqls.push(sql);
          sqls.common.push(sql);
      }
  } else if (itm.OpenLess) {        // KENO
    let ikey = itm.OpenLess;
    const stp: string[] = ["", "1", "2", "3"];
    while (ikey <= itm.OpenAll) {
        sql = `update BetTable set WinLose=Amt*Odds${stp[ikey - itm.OpenLess]}-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${ikey}`;
        sqls.common.push(sql);
        ikey++;
    }
    /*
      sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenLess}`;
      // sqls.push(sql);
      sqls.common.push(sql);
      sql = `update BetTable set WinLose=Payouts1-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
      // sqls.push(sql);
      sqls.common.push(sql);
      */
  } else if (itm.OneToGo) {
      sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums > 0`;
      // sqls.push(sql);
      sqls.common.push(sql);
  } else {
      sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
      // sqls.push(sql);
      sqls.common.push(sql);
  }
  return sqls;
}
