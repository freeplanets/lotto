import mariadb from "mariadb";
import JDate from "../class/JDate";
import {ICommonParams, IGameInfo, IGameOdds, ILastGame, IMsg, IOdds} from "../DataSchema/if";
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
    const sql: string = "select t.*,g.name from Terms t left join Games g on t.GameID=g.id where t.GameID=? order by t.id desc limit 0,1";
    let row;
    const gf: IGameInfo = {
        id: "",
        name: "",
        sNo: "",
        isEnd: "N",
        endSec: 0,
        endSecSN: 0,
        isSettled: 0
    };
    await conn.query(sql, [GameID]).then((rows) => {
        if (rows) {
            row = rows[0];
        }
    }).catch((err) => {
        row = err;
    });
    if (row.id) {
        gf.id = row.id;
        gf.sNo = row.TermID;
        gf.name = row.name;
        if (!row.isSettled) {
            gf.endSec = JDate.LeftSec(row.StopTime);
            gf.endSecSN = JDate.LeftSec(row.StopTimeS);
        }
        gf.isSettled = row.isSettled;
    }
    return gf;
}
function getLastGame(GameID: number|string, tid: string, conn: mariadb.PoolConnection) {
    const sql = "select * from Terms where GameID=? and id < ? order by id desc limit 0,1";
    const lg: ILastGame = {
        sno: "",
        nn: "",
        ns: ""
    };
    return new Promise((resolve, reject) => {
        conn.query(sql, [GameID, tid]).then((rows) => {
            if (rows.length > 0) {
                lg.sno = rows[0].TermID;
                lg.nn = rows[0].Result;
                lg.ns = rows[0].SpNo;
            }
            resolve(lg);
        }).catch((err) => {
            console.log("getLastGame:", err);
            reject(err);
        });
    });
}

async function getOddsItem(GameID: number|string, tid: string, isSettled: number, PayClassID: number,
                           MaxOddsID: number, conn: mariadb.PoolConnection) {
    const sql = `SELECT UNIX_TIMESTAMP(OID) OID,c.BetType,Num,Odds+Rate Odds,isStop,Steps
        FROM CurOddsInfo c left join PayRate p on c.GameID=p.GameID and c.BetType=p.BetType
        WHERE c.GameID=? and tid=? and PayClassID=? and p.SubType=0 and UNIX_TIMESTAMP(OID) > ?`;
    const gameOdds: IGameOdds = {};
    let MaxID: number = 0;
    const param = [GameID, tid, PayClassID, MaxOddsID];
    // const btOdds:IBtOdds = {}
    // console.log("getOddsItem isSettled", isSettled);
    await conn.query(sql, param).then((rows) => {
        rows.map((itm) => {
            /*
            if (itm.BetType === 1 && itm.Num === 1) {
                console.log("chk", itm);
            }
            */
            const tmp: IOdds = {
                id: itm.OID,
                o: itm.Odds,
                s: itm.isStop || isSettled,
            };
            if (typeof(gameOdds[itm.BetType]) === "undefined") {
                gameOdds[itm.BetType] = {};
            }
            /*
            if(typeof(gameOdds[itm.BetType][itm.Num])==='undefined'){

            }
            */
            gameOdds[itm.BetType][itm.Num] = tmp;
            if (itm.OID > MaxID) { MaxID = itm.OID; }
        });
    }).catch((err) => {
        console.log("getOddsItem", err);
    });
    return {MaxOID: MaxID, Odds: gameOdds};
}

export async function getUsers(conn: mariadb.PoolConnection, param?: ICommonParams, tb?: string): Promise<any> {
    const cond: string[] = [];
    const params: any[] = [];
    if (param) {
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
    }
    if (cond.length === 0) { cond.push("1"); }
    let exFields = ",Account,Nickname,Types";
    if (param?.OnlyID) {
        exFields = "";
    }
    if (!tb) {
        tb = "User";
    }
    const sql = `select id${exFields} from ${tb} where ${cond.join("and")}`;
    let ans;
    console.log("getUsers:", sql, param, params);
    await conn.query(sql, params).then((rows) => {
        // console.log("getUsers", rows);
        ans = rows;
    }).catch((err) => {
        console.log("getMember error", err);
    });
    return ans;
}

export async function getGame(GameID: number, conn: mariadb.PoolConnection) {
    const sql: string = "select * from Games where id=?";
    const ans = await doQuery(sql, conn, [GameID]);
    if (ans.length > 0) { return ans[0]; }
    return;
}

export async function getTermDateNotSettled(GameID: number, conn: mariadb.PoolConnection) {
    const sql: string = "select PDate from Terms where isSettled=0 and GameID=? order by id desc limit 0,1";
    const ans = await doQuery(sql, conn, [GameID]);
    if (ans.length > 0) { return ans[0].PDate; }
    return;
}
