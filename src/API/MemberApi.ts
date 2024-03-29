import mariadb from "mariadb";
import JDate from "../class/JDate";
import JTable from "../class/JTable";
import {GameType, ICommonParams, IGameInfo, IGameOdds, ILastGame, IMsg, IOdds} from "../DataSchema/if";
import { IGame } from "../DataSchema/user";
import { doQuery } from "../func/db";

interface IBtOdds {
    [key: string]: IOdds;
}
export async function getOddsData(GameID: number|string, PayClassID: number,
                                  MaxOddsID: number, conn: mariadb.PoolConnection) {
    const gInfo: IGameInfo = await getGameInfo(GameID, conn);
    const msg: IMsg = {
        ErrNo: 0,
        ErrCon: "",
    };
    if (gInfo.id) {
        // console.log("getOddsData", gInfo);
        msg.game = gInfo;
        msg.lastGame = await getLastGame(GameID, gInfo.id, conn);
        const ans = await getOddsItem(GameID, gInfo.id,
            gInfo.isSettled, PayClassID, MaxOddsID, conn);
        // console.log("getOddsData", ans);
        if (ans.MaxOID) {
            msg.odds = ans.Odds;
            msg.maxOID = ans.MaxOID;
        } else {
            msg.Odds = null;
            msg.maxOID = MaxOddsID;
        }
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "GameInfo Not Found";
    }
    return msg;
}
export async function getPayClass(conn: mariadb.PoolConnection, GameID?: number|string ) {
    let cond: string = "1";
    if (GameID) {
       cond = `GameID=${GameID}`;
    }
    const sql: string = `select id,PayClassName,GameID from PayClass where ${cond}`;
    let ans;
    await conn.query(sql, [GameID]).then((rows) => {
        ans = rows;
    }).catch((err) => {
        console.log("getPayClass", ans);
        ans = false;
    });
    return ans;
}
export async function getGameInfo(GameID: number|string, conn: mariadb.PoolConnection) {
    const sql: string = "select t.*,g.name,g.GType from Terms t left join Games g on t.GameID=g.id where t.GameID=? order by t.id desc limit 0,1";
    let row;
    const gf: IGameInfo = {
        id: "",
        name: "",
        sNo: "",
        isEnd: "N",
        endSec: 0,
        endSecSN: 0,
        isSettled: 0,
        GType: ""
    };
    await conn.query(sql, [GameID]).then((rows) => {
        if (rows) {
            row = rows[0];
            if (row.id) {
                gf.id = row.id;
                gf.sNo = row.TermID;
                gf.name = row.name;
                if (!row.isSettled) {
                    gf.endSec = JDate.LeftSec(row.StopTime);
                    gf.endSecSN = JDate.LeftSec(row.StopTimeS);
                }
                gf.isSettled = row.isSettled;
                gf.GType = row.GType;
            }
        }
    }).catch((err) => {
        row = err;
    });
    return gf;
}
function getNums(ndata: string) {
    if (!ndata) { return ""; }
    try {
        const j = JSON.parse(ndata);
        return j.Nums.join(",");
    } catch (err) {
        console.log("getNUms", err);
        return "";
    }
}
function getLastGame(GameID: number|string, tid: string, conn: mariadb.PoolConnection) {
    const sql = "select * from Terms where GameID=? and id < ? order by id desc limit 0,1";
    const lg: ILastGame = {
        sno: "",
        nn: "",
        ns: "",
        ext: ""
    };
    return new Promise((resolve) => {
        conn.query(sql, [GameID, tid]).then((rows) => {
            if (rows.length > 0) {
                lg.sno = rows[0].TermID;
                lg.nn = rows[0].Result;
                lg.ns = rows[0].SpNo;
                lg.ext = getNums(rows[0].ResultFmt);
            }
            resolve(lg);
        }).catch((err) => {
            console.log("getLastGame:", err);
            resolve(null);
        });
    });
}

async function getOddsItem(GameID: number|string, tid: string, isSettled: number, PayClassID: number,
                           MaxOddsID: number, conn: mariadb.PoolConnection) {
    const sql = `SELECT UNIX_TIMESTAMP(OID) OID,c.BetType,Num,Odds+Rate Odds,isStop,Steps
        FROM CurOddsInfo c left join PayRate p on c.GameID=p.GameID and c.BetType=p.BetType  and c.SubType=p.SubType
        WHERE c.GameID=? and tid=? and PayClassID=? and UNIX_TIMESTAMP(OID) > ?`;
    const gameOdds: IGameOdds = {};
    let MaxID: number = 0;
    const param = [GameID, tid, PayClassID, MaxOddsID];
    // const btOdds:IBtOdds = {}
    // console.log("getOddsItem", sql, param, isSettled);
    await conn.query(sql, param).then((rows) => {
        rows.map((itm) => {
            const tmp: IOdds = {
                id: itm.OID,
                o: itm.Odds,
                s: itm.isStop || isSettled,
            };
            if (typeof(gameOdds[itm.BetType]) === "undefined") {
                gameOdds[itm.BetType] = {};
            }
            gameOdds[itm.BetType][itm.Num] = tmp;
            if (itm.OID > MaxID) { MaxID = itm.OID; }
        });
    }).catch((err) => {
        console.log("getOddsItem", err);
    });
    return {MaxOID: MaxID, Odds: gameOdds};
}

export async function getUsers(conn: mariadb.PoolConnection, param?: ICommonParams | number[], tb?: string, moreField = false): Promise<any> {
    const cond: string[] = [];
    const params: any[] = [];
    let exFields = "";
    if (param) {
        if (Array.isArray(param)) {
            if (param.length > 0) {
                cond.push(`id in (${param.join(",")})`);
            }
        } else {
            if (param.findString) {
                if (param.findString === "ALL") {
                    cond.push(" 1 ");
                } else {
                    cond.push(" (Account like ? or Nickname like ? ) ");
                    params.push(`%${param.findString}%`);
                    params.push(`%${param.findString}%`);
                }
            }
            if (param.userType !== undefined) {
                cond.push(" Types = ? ");
                params.push(param.userType);
            }
            if (param.UpId) {
                if (Array.isArray(param.UpId)) {
                    cond.push(` UpId in (${param.UpId.join(",")}) `);
                } else {
                    cond.push(" UpId = ? ");
                    params.push(param.UpId);
                }
            }
            if (param?.OnlyID) {
                exFields = "";
            }
        }
    }
    if (cond.length === 0) { cond.push("1"); }
    if (!tb) {
        tb = "User";
        if (moreField) { exFields += ",Account,PayClass,Programs,Types,SiteName"; }
    } else if (moreField) {
        exFields = ",Account,Nickname,UpId";
    }
    const sql = `select id${exFields} from ${tb} where ${cond.join("and")}`;
    let ans;
    // console.log("getUsers:", sql, param, params);
    await conn.query(sql, params).then((rows) => {
        // console.log("getUsers", rows);
        ans = rows;
    }).catch((err) => {
        console.log("getMember error", err);
    });
    return ans;
}

export async function getGame(GameID: number, conn: mariadb.PoolConnection) {
    /*
    const sql: string = "select * from Games where id=?";
    const ans = await doQuery(sql, conn, [GameID]);
    if (ans.length > 0) { return ans[0]; }
    return;
    */
   const jt: JTable<IGame> = new JTable(conn, "Games");
   return await jt.getOne(GameID);
}
export async function getGameType(GType: string, conn: mariadb.PoolConnection) {
    const jt: JTable<GameType> = new JTable(conn, "GameType");
    return await jt.getOne({GType});
}
export async function getGTypeByGameID(GameID: number, conn: mariadb.PoolConnection): Promise<GameType | undefined> {
    const sql = `select t.GType,t.OpenNums,t.OpenSP,t.StartNum,t.EndNum,t.SameNum from
        Games g left join GameType t on g.GType = t.GType where g.id = ?`;
    const ans = await doQuery(sql, conn, [GameID]);
    if (ans) { return ans[0] as GameType; }
    return;
}
export async function getTermDateNotSettled(GameID: number, conn: mariadb.PoolConnection) {
    const sql: string = "select PDate from Terms where isSettled=0 and isCanceled=0 and GameID=? order by id desc limit 0,1";
    const ans = await doQuery(sql, conn, [GameID]);
    if (ans.length > 0) { return ans[0].PDate; }
    return;
}
