import mariadb from "mariadb";
import {IBetHeader, IMsg} from "../DataSchema/if";
interface IBetItem {
    GameID: number;
    id: number;
    tid: number;
    con: object;
    gold: number;
    end?: number;
    time?: string;
    TermID?: string;
}
interface ISum {
    no: number;
    gold: number;
    end: number;
}
interface IItems {
    [key: string]: IBetItem[];
}
interface ISubSum {
    [key: string]: ISum;
}
interface ILo {
    [key: number]: string;
}
export class Gets {
    constructor(private conn: mariadb.PoolConnection) {}
    public async getBetLists(UserID: number, date: string) {
        const msg: IMsg = {
            ErrNo: 0
        };
        const sql: string = `select b.*,t.TermID from BetHeader b,Terms t where b.tid=t.id and UserID = ? and b.CreateTime > ?`;
        await this.conn.query(sql, [UserID, date]).then((rows) => {
            const items: IItems = {};
            const tolSum: ISum = {no: 0, gold: 0, end: 0 };
            const subSum: ISubSum = {};
            const lo: ILo = {};
            rows.map((itm: IBetHeader) => {
                const tmp: IBetItem = {
                    GameID: itm.GameID,
                    id: itm.id,
                    tid: itm.tid,
                    TermID: itm.TermID,
                    con: JSON.parse(itm.BetContent.replace(/\\/g, "")),
                    gold: itm.Total,
                    end: parseFloat(itm.WinLose ? itm.WinLose.toFixed(2) : "0"),
                    time: itm.CreateTime
                };
                if (typeof subSum[itm.GameID] === "undefined") {
                    subSum[itm.GameID] = {no: 0, gold: 0, end: 0};
                }
                tolSum.no += 1;
                tolSum.gold += itm.Total;
                subSum[itm.GameID].no += 1;
                subSum[itm.GameID].gold += itm.Total;
                if (itm.WinLose) {
                    tolSum.end += itm.WinLose;
                    subSum[itm.GameID].end += itm.WinLose;
                }
                if (typeof items[itm.GameID] === "undefined") {
                    items[itm.GameID] = [];
                }
                items[itm.GameID].push(tmp);
                if (typeof(lo[itm.GameID]) === "undefined") {
                    lo[itm.GameID] = "";
                }
            });
            msg.items = items;
            msg.tolSum = tolSum;
            msg.subSum = subSum;
            msg.lo = lo;
        }).catch((err) => {
            console.log("getBetLists", err);
            msg.ErrNo = 9;
            msg.debug = err;
        });
        return msg;
    }
}
