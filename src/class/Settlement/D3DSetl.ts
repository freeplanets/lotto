import mariadb from "mariadb";
import {ISetl, ISqlProc} from "../../DataSchema/if";
import {IExProc} from "../Bet";
import D3DST from "../SettleType/D3DST";
import {C3DNum, ID3Result} from "./C3DNum";
// const SettleMethods = MarkSixST;
export function D3DSetl(tid: number, GameID: number, num: string, rtn: any, conn: mariadb.PoolConnection): ISqlProc {
  // let ans: string[] = [];
  const imsr: ID3Result = new C3DNum(num).Nums;
  const ans: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  // let sqls: string[];
  let sqls: ISqlProc;
  // console.log("imsr:", imsr);
  rtn.map((rd) => {
      const found: ISetl | undefined = D3DST.find((el) => el.BetTypes === rd.BetType);
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

function CreateSql(tid: number, GameID: number, itm: ISetl, imsr: ID3Result, conn?: mariadb.PoolConnection): ISqlProc {
  let nn: any;
  let sql: string = "";
  // const sqls: string[] = [];
  const sqls: ISqlProc = {
      pre: [],
      common: [],
      final: ""
  };
  if (itm.Position !== undefined) {
      // nn = console.log(typeof(itm.Position));
      if (typeof(itm.Position) === "number") {
        if (itm.Position < 0) {
          // console.log("Position -1:", itm, imsr[itm.NumTarget]);
          const tmp: number[] = imsr[itm.NumTarget];
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${tmp.join("','")}') and isCancled=0`;
          sqls.common.push(sql);
        } else {
          if (itm.SubName) {
              nn = imsr[itm.NumTarget][itm.Position][itm.SubName];
          } else {
              nn = imsr[itm.NumTarget][itm.Position];
          }
          if (itm.TieNum && itm.TieNum === nn) {
              sql = `update BetTable set WinLose=Amt,validAmt=0 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and isCancled=0`;
          } else {
              sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num = '${nn}' and isCancled=0`;
          }
          // sqls.push(sql);
          sqls.common.push(sql);
        }
      } else {
          // const tmp: number[] = [];
          const nums = imsr[itm.NumTarget];
          sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nums.join("','")}') and isCancled=0`;
          sqls.common.push(sql);
          /*
          if (itm.PType === "M3POS") {
            const nums = imsr[itm.NumTarget];
            const mark = ["h", "t", "u"];
            nums.map((elm, idx) => {
                sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and MATCH(Num) AGAINST ('${mark[idx] + elm + mark[idx]}' IN BOOLEAN MODE) and isCancled=0`;
                sqls.common.push(sql);
            });
          } else {
            itm.Position.map(async (elm, idx) => {
                // console.log("CreateSql Position not number", itm.NumTarget, elm, idx, itm);
                nn = (idx + 1) * 10 + imsr[itm.NumTarget][elm][itm.SubName];
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
            });
        }
        */
          // nn = tmp;
      }
  } else {
      if (itm.UseExTable) {
        const btS = imsr[itm.NumTarget];
        if (btS[itm.ExChk]) {
            sql = `update BetTableEx set Opened=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in (${btS.Num})`;
            sqls.pre.push(sql);
            sql = `update BetTable b,
            (SELECT betid,tGroup,count(*) OpNums,CASE UseAvgOdds WHEN 1 then SUM(ODDS)/count(*) when 0 then MIN(Odds) end Odds FROM BetTableEx
            where GameID=${GameID} and tid=${tid} and BetType=${itm.BetTypes} and Opened=1 group by betid,tGroup) t set b.OpNums=t.OpNums,b.Payouts=b.Amt*t.Odds
            where b.betid=t.betid and b.tGroup=t.tGroup and b.GameID=${GameID} and tid=${tid} and BetType=${itm.BetTypes} and b.isCancled=0`;
            sqls.pre.push(sql);
        }
      } else {
        if (itm.SubName) {
            nn = imsr[itm.NumTarget][itm.SubName];
        } else {
            nn = imsr[itm.NumTarget];
        }
        if (itm.PType === "Multi") {
            const tmpNN: number[] = nn  as number[];
            tmpNN.map((opns, idx) => {
            sql = `update BetTable set OpNums=${opns} where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${idx}' and isCancled=0`;
            sqls.common.push(sql);
            });
        } else if (itm.PType === "EACH") {
            if (itm.Position) {
                const pos: number[] = itm.Position;
                pos.map((p) => {
                const num: number = nn[p];
                sql = `update BetTableEx set Opened=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num=${num}`;
                sqls.pre.push(sql);
                });
                sql = `update BetTable a,
                (SELECT tid,GameID,BetType,betid,sum(Opened) OpNums FROM BetTableEx WHERE tid=${tid} and GameID=${GameID} and BetType=3 Group by tid,GameID,BetType,betid) b
                set a.OpNums = b.OpNums where a.tid=b.tid and a.GameID = b.GameID and a.BetType=b.BetType and a.betid = b.betid
                and a.tid=${tid} and a.GameID=${GameID} and a.BetType=${itm.BetTypes}`;
                sqls.common.push(sql);
            }
        } else if (itm.PType === "ALL") {
            sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nn.join("','")}') and isCancled=0`;
            sqls.common.push(sql);
        } else {
            sql = `update BetTable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${nn}' and isCancled=0`;
            sqls.common.push(sql);
        }
    }
      // sqls.push(sql);
  }
  if (itm.PType === "Multi") {
    sql = `update BetTable set WinLose=(Payouts/12)*OpNums-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums>${itm.OpenAll}`;
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
          sql = `update BetTable set OpNums=${itm.OpenNums.length} where betid=${itm.betid} and Num='x${nums.join("x")}x'`;
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
          sql = `update BetTable set OpNums=${itm.OpenNums.length},Payouts=ROUND(Amt*${odds},2) where betid=${itm.betid} and Num='x${nums.join("x")}x'`;
      } else {
          sql = `update BetTable set OpNums=${itm.OpenNums.length} where betid=${itm.betid} and Num='x${nums.join("x")}x'`;
      }
      sqls.push(sql);
  });
  return sqls;
}
