import mariadb from "mariadb";
import {ISetl, ISqlProc} from "../../DataSchema/if";
import {IExProc} from "../Bet";
import MSNum, {IMarkSixNums} from "../MSNum";
import MarkSixST from "../SettleType/MarkSixST";
import {CMarkSixMum, IMSResult} from "./CMarkSixMum";
// const SettleMethods = MarkSixST;
export function MarkSixSetl(tid: number, GameID: number, imsra: any, rtn: any, conn: mariadb.PoolConnection): ISqlProc {
  // let ans: string[] = [];
  // const imsr: IMSResult = imsra as IMSResult;
  const imsr: IMSResult = new CMarkSixMum(imsra).Nums;
  const ans: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  // let sqls: string[];
  let sqls: ISqlProc;
  rtn.map((rd) => {
      const found: ISetl | undefined = MarkSixST.find((el) => el.BetTypes === rd.BetType);
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
  ans.final = `update Terms set Result='${imsr.RegularNums.join(",")}',SpNo='${imsr.SPNo}',ResultFmt='${JSON.stringify(imsr)}',isSettled=? where id=${tid}`;
  // console.log("MarkSixSetl sql:", ans);
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
              if (itm.OpenLess) {
                  // 三中二
                  sql = `update BetTableEx set Opened=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in (${tmp.join(",")})`;
                  sqls.pre.push(sql);

                  sql = `update BetTable b,
                  (SELECT betid,tGroup,count(*) OpNums,CASE UseAvgOdds WHEN 1 then SUM(ODDS)/count(*) when 0 then MIN(Odds) end Odds FROM BetTableEx
                  where GameID=${GameID} and tid=${tid} and BetType=${itm.BetTypes} and Opened=1 group by betid,tGroup HAVING OpNums > 1) t set b.OpNums=t.OpNums,b.Odds=t.Odds,b.Payouts=b.Amt*t.Odds
                  where b.betid=t.betid and b.tGroup=t.tGroup and b.GameID=${GameID} and tid=${tid} and BetType=${itm.BetTypes} and b.isCancled=0`;
                  sqls.pre.push(sql);
              } else {
                  tmp.map((elm) => {
                      // sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x${elm}x%' and isCancled=0`;
                      sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST('x${elm}x' IN BOOLEAN MODE) and isCancled=0`;
                      sqls.common.push(sql);
                  });
              }
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
          itm.Position.map(async (elm, idx) => {
              nn = (idx + 1) * 10 + imsr[itm.NumTarget][elm][itm.SubName];
              sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${nn}' and isCancled=0`;
              // sqls.push(sql);
              sqls.common.push(sql);
              /*
              if (itm.ExtBT) {
                  const num: number = nn as number;
                  const exnn: number = itm.ExtBT * 100 + num;
                  sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.ExtBT} and Num='${exnn}' and isCancled=0`;
                  // sqls.push(sql);
                  sqls.common.push(sql);
              }
              */
          });
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
  } else if (itm.OpenLess) {
      sql = `update BetTable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenLess}`;
      // sqls.push(sql);
      sqls.common.push(sql);
      sql = `update BetTable set WinLose=Payouts1-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
      // sqls.push(sql);
      sqls.common.push(sql);
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
interface INumOdds {
  Num: number;
  Odds: number;
}
interface IExData {
  betid: number;
  BetType: number;
  group: number;
  Op: number;
  UseAvgOdds: number;
  OpenNums: INumOdds[];
  Nums: number[];
}
export function getEx(data: IExProc[]): string[] {
  const tmp: IExData[] = [];
  let sql: string;
  const sqls: string[] = [];
  data.map((itm) => {
      let f: IExData | undefined = tmp.find((d) => d.betid === itm.betid && d.BetType === itm.BetType && d.group === itm.tGroup);
      if (f) {
          f.Nums.push(itm.Num);
          if (itm.Opened) {
              f.Op += itm.Opened;
              const nm: INumOdds = {
                      Num: itm.Num,
                      Odds: itm.Odds
              };
              f.OpenNums.push(nm);
          }
      } else {
          f = {
              betid: itm.betid,
              BetType: itm.BetType,
              group: itm.tGroup,
              Op: itm.Opened,
              UseAvgOdds: itm.UseAvgOdds,
              OpenNums: itm.Opened ? [{Num: itm.Num, Odds: itm.Odds}] : [],
              Nums: [itm.Num]
          };
          tmp.push(f);
      }
  });
  tmp.map((itm) => {
      const nums: number[] = [];
      itm.Nums.map((nm) => {
          nums.push(nm);
      });
      if (itm.Nums.length === itm.OpenNums.length) {
          sql = `update BetTable set OpNums=${itm.OpenNums.length} where betid=${itm.betid} and Num='x${nums.join("x x")}x'`;
      } else if (itm.OpenNums.length === (itm.Nums.length - 1)) {
          let odds: number = 0;
          if (itm.UseAvgOdds) {
              itm.OpenNums.map((nm) => {
                  odds += nm.Odds;
              });
              odds /= itm.OpenNums.length;
          } else {
              itm.OpenNums.map((nm) => {
                  if (odds) {
                      odds = odds > nm.Odds ? nm.Odds : odds;
                  } else {
                      odds = nm.Odds;
                  }
              });
          }
          sql = `update BetTable set OpNums=${itm.OpenNums.length},Payouts=ROUND(Amt*${odds},2) where betid=${itm.betid} and Num='x${nums.join("x x")}x'`;
      } else {
          sql = `update BetTable set OpNums=${itm.OpenNums.length} where betid=${itm.betid} and Num='x${nums.join("x x")}x'`;
      }
      sqls.push(sql);
  });
  return sqls;
}
