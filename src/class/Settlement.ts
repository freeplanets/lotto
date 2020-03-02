import { rejects } from "assert";
import mariadb from "mariadb";
import MSNum, {IMarkSixNums} from "./MSNum";
import SettleMethods, {GType, ISetl} from "./SettleMethods";
import XFunc from "./XFunc";

/**
 *  六合彩
 *  正碼1, 正碼2,正碼3,正碼4,正碼5,正碼6,特碼,
 *   0   ,  1   , 2  ,  3  , 4  ,  5  , 6   <--彩球順序
 *   0  <-
 *   1
 *   2
 *   總和中位數 175
 *
 */
const SevenOE: number[] = [];  // "單/雙"數量
const SevenBS: number[] = [];  // "大/小"數量
SevenOE["00"] = 0;
SevenOE["01"] = 1;
SevenOE["02"] = 2;
SevenOE["03"] = 3;
SevenOE["04"] = 4;
SevenOE["05"] = 5;
SevenOE["06"] = 6;
SevenOE["17"] = 7;
SevenOE["10"] = 8;
SevenOE["11"] = 9;
SevenOE["12"] = 10;
SevenOE["13"] = 11;
SevenOE["14"] = 12;
SevenOE["15"] = 13;
SevenOE["16"] = 14;
SevenOE["17"] = 15;
SevenBS["00"] = 16;
SevenBS["01"] = 17;
SevenBS["02"] = 18;
SevenBS["03"] = 19;
SevenBS["04"] = 20;
SevenBS["05"] = 21;
SevenBS["06"] = 22;
SevenBS["17"] = 23;
SevenBS["10"] = 24;
SevenBS["11"] = 25;
SevenBS["12"] = 26;
SevenBS["13"] = 27;
SevenBS["14"] = 28;
SevenBS["15"] = 29;
SevenBS["16"] = 30;
SevenBS["17"] = 31;
interface ISettleMethod {
    BetType: number;
    Target: string;
    Method?: string;
}
interface ISettleMember {
    [key: number]: ISettleMethod;
}
const SettleProcess: ISettleMember = [

];
const s1: ISettleMethod = {
    BetType: 1,
    Target: "SPNO"
};

/**
 * 特碼其他
 */
interface ISPOther {
     Zodiac?: number;         // 生肖
     OddEven?: number;        // 單雙
     BigSmall?: number;       // 大小
     TOddEvent?: number;
     TailBS?: number;
 }
 /*
 class MarkSixMum implements IMarkSixNums{
    Num:number;
    OddEven:number;
    BigSmall:number;
    ColorWave:number;
    TailNum:number;
    TailOE:number;
    TailBS:number;
    Total:number;
    TotOE:number;
    TotBS:number;
    constructor(num:string){
        this.Num = parseInt(num);
    }

 }
 */
interface IMSResult {
     Nums: number[];
     RegularNums: number[];
     SPNo: number;
     RGNums: IMarkSixNums[];
     SPNum: IMarkSixNums;
     Sum: number;
     SumOE: number;
     SumBS: number;
     tailNums: number[];
     Zadic: number[];
     Seven: number[];
     DragonTiger: number[];
}
export async function SaveNums(tid: number, GameID: number, num: string, conn: mariadb.PoolConnection) {
    const imsr: IMSResult = new CMarkSixMum(num).Nums;
    let ans;
    let sql: string = "";
    let sqls: string[];
    conn.beginTransaction();
    sql = `update bettable set WinLose=Amt*-1,OpNums=0,OpSP=0,isSettled=1 where tid=${tid} and GameID=${GameID} and isCancled=0`;
    await conn.query(sql).then((res) => {
        console.log("WinLose=Amt*-1", res);
        ans = true;
    }).catch((err) => {
        console.log("WinLose=Amt*-1 err", err);
        conn.rollback();
        ans = false;
    });
    if (!ans) {
        return imsr;
    }
    // 搜尋有下注的BetType
    sql = `SELECT BetType,COUNT(*) cnt FROM bettable WHERE tid=${tid} and GameID=${GameID} and isCancled=0 group by BetType order by BetType`;
    let rtn;
    await conn.query(sql).then( (res) => {
        rtn = res;
    }).catch((err) => {
        console.log("WinLose=Amt*-1 err", err);
        conn.rollback();
        ans = false;
    });
    if (rtn) {
        sqls = doBT(tid, GameID, imsr, rtn, conn);
        sqls.map(async (itm) => {
            ans = await doSql(itm, conn);
            if (!ans) {
                conn.rollback();
                return imsr;
            }
        });
    }
    if (ans) {
        sql = `update terms set Result='${imsr.RegularNums.join(",")}',SpNo='${imsr.SPNo}',ResultFmt='${JSON.stringify(imsr)}',isSettled=1 where id=${tid}`;
        ans = await doSql(sql, conn);
        if (ans) {
            conn.commit();
        } else {
            conn.rollback();
        }
    } else {
        conn.rollback();
    }
    // console.log("SQL:", ans);
    return imsr;
 }
function doBT(tid: number, GameID: number, imsr: IMSResult, rtn: any, conn: mariadb.PoolConnection) {
    let ans: string[] = [];
    let sqls: string[];
    rtn.map((rd) => {
        const found: ISetl | undefined = SettleMethods.find((el) => el.BetTypes === rd.BetType);
        if (found) {
            sqls = CreateSql(tid, GameID, found, imsr, conn);
            if (sqls) {
                ans = ans.concat(sqls);
            }
        }
    });
    /**
     * update header
     */
    let sql = `insert into betheader(id,WinLose,isSettled) select betid id,sum(WinLose) WinLose,1 isSettled from bettable where tid=${tid} and GameID=${GameID} and isCancled=0 group by betid`;
    sql = sql + " on duplicate key update WinLose=values(WinLose),isSettled=values(isSettled)";
    ans = ans.concat([sql]);
    return ans;
}
function CreateSql(tid: number, GameID: number, itm: ISetl, imsr: IMSResult, conn: mariadb.PoolConnection): string[] {
    let nn: number|number[];
    let sql: string = "";
    const sqls: string[] = [];
    if (itm.NumTarget === "PASS") {
        sql = `update bettable set WinLose=Payouts where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=OpPASS and isCancled=0`;
        return [sql];
    }
    if (itm.TieNum) {
        if (itm.TieNum === imsr.SPNo) {
            sql = `update bettable set WinLose=Amt,isSettled=1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and isCancled=0`;
            return [sql];
        }
    }
    if (itm.Position !== undefined) {
        // nn = console.log(typeof(itm.Position));
        if (typeof(itm.Position) === "number") {
            if (itm.Position < 0) {
                // console.log("Position -1:", itm, imsr[itm.NumTarget]);
                const tmp: number[] = imsr[itm.NumTarget];
                nn = tmp;
                nn.map(async (elm) => {
                    sql = `update bettable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x${elm}x%' and isCancled=0`;
                });
            } else {
                if (itm.SubName) {
                    nn = imsr[itm.NumTarget][itm.Position][itm.SubName];
                } else {
                    nn = imsr[itm.NumTarget][itm.Position];
                }
                sql = `update bettable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num = '${nn}' and isCancled=0`;
                sqls.push(sql);
            }
        } else {
            // const tmp: number[] = [];
            itm.Position.map(async (elm, idx) => {
                nn = (idx + 1) * 10 + imsr[itm.NumTarget][elm][itm.SubName];
                sql = `update bettable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${nn}' and isCancled=0`;
                sqls.push(sql);
                if (itm.ExtBT) {
                    const num: number = nn as number;
                    const exnn: number = itm.ExtBT * 100 + num;
                    sql = `update bettable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.ExtBT} and Num='${exnn}' and isCancled=0`;
                    sqls.push(sql);
                }
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
            sql = `update bettable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num in ('${nn.join("','")}') and isCancled=0`;
        } else {
            if (itm.PType === "EACH") {
                sql = `update bettable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x${nn}x%' and isCancled=0`;
            } else {
                sql = `update bettable set OpNums=OpNums+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num='${nn}' and isCancled=0`;
            }
        }
        sqls.push(sql);
    }
    if (itm.ExSP) {
        nn = imsr[itm.ExSP];
        sql = `update bettable set OpSP=OpSP+1 where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and Num like '%x${nn}x%' and isCancled=0`;
        sqls.push(sql);
    }
    if (itm.OpenSP) {
        if (itm.OpenSP === itm.OpenAll) {
            sql = `update bettable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll} and OpSP=${itm.OpenSP}`;
            sqls.push(sql);
        } else {
            sql = `update bettable set WinLose=Payouts1-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll - itm.OpenSP} and OpSP=${itm.OpenSP}`;
            sqls.push(sql);
            sql = `update bettable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
            sqls.push(sql);
        }
    } else if (itm.OpenLess) {
        sql = `update bettable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenLess}`;
        sqls.push(sql);
        sql = `update bettable set WinLose=Payouts1-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
        sqls.push(sql);
    } else {
        sql = `update bettable set WinLose=Payouts-Amt where tid=${tid} and GameID=${GameID} and BetType=${itm.BetTypes} and OpNums=${itm.OpenAll}`;
        sqls.push(sql);
    }
    return sqls;
}
class CMarkSixMum {
    private imsr: IMSResult = {
        Nums: [],
        RegularNums: [],
        SPNo: 0,
        RGNums: [],
        SPNum: {} as IMarkSixNums,
        Sum: 0,
        SumOE: 0,
        SumBS: 0,
        tailNums: [],
        Zadic: [],
        Seven: [],
        DragonTiger: []
    };
    private xf = new XFunc();
    private totalMidNum = 175;
    constructor(num: string) {
        const nums: string[] = num.split(",");
        nums.map((itm) => {
            this.imsr.Nums.push(parseInt(itm, 10));
            this.imsr.Sum += this.xf.toInt(itm);
        });
        this.imsr.SumOE = this.xf.getOddEven(this.imsr.Sum);
        this.imsr.SumBS = this.xf.getBigSmall(this.imsr.Sum, this.totalMidNum);
        this.imsr.tailNums = this.TailNums(nums);
        const sp: string = nums.pop() as string;
        // this.imsr.RegularNums = nums;
        nums.map((itm) => {
            this.imsr.RegularNums.push(parseInt(itm, 10));
        });
        this.imsr.SPNo = parseInt(sp, 10);
        this.imsr.SPNum = new MSNum(this.imsr.SPNo, true).Num;
        this.imsr.RGNums = [];
        nums.map((elm) => {
            this.imsr.RGNums.push(new MSNum(parseInt(elm, 10)).Num);
        });
        this.SevenOB();
        this.DragonTiger();
    }
    get Nums(): IMSResult {
        return this.imsr;
    }
    private TailNums(nums: string[]) {
        const tmp: number[] = [];
        nums.map((itm) => {
            const tailnum: number = this.xf.getTail(itm);
            const ans = tmp.find((elm) => elm === tailnum);
            if (ans === undefined) {
                tmp.push(tailnum);
            }
        });
        return tmp.sort();
    }
    private SevenOB() {
        const tmp: number[] = [];
        let OddCnt: number = 0;
        let EvenCnt: number = 0;
        let BigCnt: number = 0;
        let SmallCnt: number = 0;
        const zd: number[] = [];
        this.imsr.RGNums.map((itm) => {
            if (itm.OddEven === 1) {
                EvenCnt++;
            } else {
                OddCnt++;
            }
            if (itm.BigSmall === 1) {
                SmallCnt++;
            } else {
                BigCnt++;
            }
            const fzd = zd.find((elm) => elm === itm.Zadic);
            console.log("find zadic:", fzd, itm.Num, itm.Zadic);
            if (!fzd) {
                zd.push(itm.Zadic as number);
            }
            console.log("find zadic", fzd, itm.Zadic, zd);
        });
        if (this.imsr.SPNum.OddEven === 1) {
            EvenCnt++;
        } else {
            OddCnt++;
        }
        if (this.imsr.SPNum.BigSmall === 1) {
            SmallCnt++;
        } else {
            BigCnt++;
        }
        const sfzd = zd.find((elm) => elm === this.imsr.SPNum.Zadic);
        if (!sfzd) {
            zd.push(this.imsr.SPNum.Zadic as number);
        }
        tmp.push(SevenOE["0" + OddCnt]);
        tmp.push(SevenOE["1" + EvenCnt]);
        tmp.push(SevenBS["0" + BigCnt]);
        tmp.push(SevenBS["1" + SmallCnt]);
        this.imsr.Seven = tmp;
        this.imsr.Zadic = zd;
    }
    private DragonTiger() {
        const len = this.imsr.RegularNums.length;
        let i: number = 0;
        let j: number = len - 1;
        do {
            const H: number = this.imsr.RegularNums[i];
            const T: number = this.imsr.RegularNums[j];
            const R: number = H > T ? 0 : 1;
            if (i === 0) {
                this.imsr.DragonTiger.push(R);
            } else {
                this.imsr.DragonTiger.push(i * 10 + R);
            }
            i = i + 1;
            j = j - 1;
        } while (i < j);
        /*
        for (let i = 0; i < len; i++) {
            for (let j = len - 1; j >= 0; j--) {
                const H: number = this.imsr.RegularNums[i];
                const T: number = this.imsr.RegularNums[j];
                const R: number = H > T ? 0 : 1;
                if (i === 0) {
                    this.imsr.DragonTiger.push(R);
                } else {
                    this.imsr.DragonTiger.push(i * 10 + R);
                }
            }
        }
        */
    }
}
async function doSql(sql: string, conn: mariadb.PoolConnection) {
    return new Promise((resolve, reject) => {
        conn.query(sql).then((res) => {
            // if (res) { ans = true; }
            console.log("doSql:", sql, res);
            resolve(true);
        }).catch((err) => {
            console.log("doSql error:", sql, err);
            reject(false);
        });
    });
}
/*
async function doSql(sql: string, conn: mariadb.PoolConnection) {
    let ans: boolean = false;
    let rows;
    await conn.query(sql).then((res) => {
        rows = res;
        if (res) { ans = true; }
    }).catch((err) => {
        console.log("doSql error:", sql, err);
    });
    console.log("doSql:", sql, rows);
    return ans;
}
*/
