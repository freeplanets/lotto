import { PoolConnection } from "mariadb";
import { doQuery } from "../../func/db";

export default class DayReport {
	constructor(private conn: PoolConnection) {}
	public Cal(tid: number, d: string = "") {
			let sql: string;
			const  cond: string = d ? `and convert(CreateTime,Date)='${d}'` : "";
			sql = "insert into DayReport(SDate,UpId,UserID,tid,GameID,BetType,Total,WinLose)";
			sql += " select convert(CreateTime,Date) SDate,UpId,UserID,tid,GameID,BetType,sum(Amt) Total,sum(WinLose) WinLose ";
			sql += ` From BetTable where tid= ${tid} and isCancled = 0 ${cond} group by convert(CreateTime,Date),UpId,UserID,tid,GameID,BetType `;
			sql += " on duplicate key update Total=values(Total),WinLose=values(WinLose)";
			console.log("DayReport Cal", sql);
			return doQuery(sql, this.conn);
	}
}
