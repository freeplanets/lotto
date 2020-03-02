import mariadb from "mariadb";
import {IBetHeader, IMsg} from "../DataSchema/if";
interface IBetItem {
    GameID: number;
    id: number;
    con: object;
    gold: number;
    end?: number;
    time?: string;
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
        const sql: string = `select * from betheader where UserID = ? and CreateTime > ?`;
        await this.conn.query(sql, [UserID, date]).then((rows) => {
            const items: IItems = {};
            const tolSum: ISum = {no: 0, gold: 0, end: 0 };
            const subSum: ISubSum = {};
            const lo: ILo = {};
            rows.map((itm: IBetHeader) => {
                const tmp: IBetItem = {
                    GameID: itm.GameID,
                    id: itm.tid,
                    con: JSON.parse(itm.BetContent),
                    gold: itm.Total,
                    end: itm.WinLose,
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
