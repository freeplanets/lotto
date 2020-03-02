import mariadb from "mariadb";
import JDate from "../class/JDate";
import {IGameInfo, IGameOdds, ILastGame, IMsg, IOdds} from "../DataSchema/if";

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
        msg.game = gInfo;
        msg.lastGame = await getLastGame(GameID, gInfo.id, conn);
        const ans = await getOddsItem(GameID, gInfo.id, PayClassID, MaxOddsID, conn);
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
export async function getPayClass(GameID: number|string, conn: mariadb.PoolConnection) {
    const sql: string = "select id,PayClassName from payclass where GameID=?";
    let ans;
    await conn.query(sql, [GameID]).then((rows) => {
        ans = rows;
    }).catch((err) => {
        console.log("getPayClass", ans);
        ans = false;
    });
    return ans;
}
async function getGameInfo(GameID: number|string, conn: mariadb.PoolConnection) {
    const sql: string = "select t.*,g.name from terms t left join games g on t.GameID=g.id where t.GameID=? order by t.id desc limit 0,1";
    let row;
    const gf: IGameInfo = {
        id: "",
        name: "",
        sNo: "",
        isEnd: "N",
        endSec: 0,
        endSecSN: 0
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
    }
    return gf;
}
async function getLastGame(GameID: number|string, tid: string, conn: mariadb.PoolConnection) {
    const sql = "select * from terms where GameID=? and id < ? order by id desc limit 0,1";
    const lg: ILastGame = {
        sno: "",
        nn: "",
        ns: ""
    };
    await conn.query(sql, [GameID, tid]).then((rows) => {
        if (rows.length > 0) {
            lg.sno = rows[0].TermID;
            lg.nn = rows[0].Result;
            lg.ns = rows[0].SpNo;
        }
    }).catch((err) => {
        console.log("getLastGame:", err);
    });
    return lg;
}

async function getOddsItem(GameID: number|string, tid: string, PayClassID: number,
                           MaxOddsID: number, conn: mariadb.PoolConnection) {
    const sql = `SELECT OID,c.BetType,Num,Odds+Rate Odds,isStop,Steps
        FROM curoddsinfo c left join payrate p on c.GameID=p.GameID and c.BetType=p.BetType
        WHERE c.GameID=? and tid=? and PayClassID=? and p.SubType=0 and OID > ?`;
    const gameOdds: IGameOdds = {};
    let MaxID: number = 0;
    const param = [GameID, tid, PayClassID, MaxOddsID];
    // const btOdds:IBtOdds = {}
    // console.log("getOddsItem", sql, param);
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
                s: itm.isStop,
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

export async function getUsers(conn: mariadb.PoolConnection) {
    const sql = "select id,Account,Nickname,Types from user where 1";
    let ans;
    await conn.query(sql).then((rows) => {
        // console.log("getUsers", rows);
        ans = rows;
    }).catch((err) => {
        console.log("getUsers error", err);
        ans = false;
    });
    return ans;
}
