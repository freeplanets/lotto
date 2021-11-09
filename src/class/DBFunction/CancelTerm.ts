import { PoolConnection } from "mariadb";
import { IMsg } from "../../DataSchema/if";
import { ITerms } from "../../DataSchema/user";
import { doQuery } from "../../func/db";
import JTable from "../JTable";
import ATrans from "./ATrans";

export default class CancelTerm extends ATrans {
	constructor(private tid: number, conn: PoolConnection) {
		super(conn);
	}
	public async doit() {
		const sqls: string[] = [];
		let sql: string = "";
		const tid = this.tid;
		const msg: IMsg = {ErrNo: 0};
		const jt: JTable<ITerms> = new JTable(this.conn, "Terms");
		const term = await jt.getOne(tid);
		if (term) {
				sql = `update CurOddsInfo set isStop=1 where tid=${tid}`;
				sqls.push(sql);
				sql = `update Terms set isCanceled=1 where id=${tid}`;
				sqls.push(sql);
				sql = `update BetTable set isCancled=1,WinLose=0 where tid=${tid}`;  // and GameID=${term.GameID}`;
				sqls.push(sql);
				sql = `update BetHeader set isCancled=1,WinLose=0 where tid=${tid}`; // and GameID=${term.GameID}`;
				sqls.push(sql);
				// 損益歸戶
				sql = `insert into UserCredit(uid,GameID,tid,DepWD,memo)
						select UserID uid,GameID,tid,sum(Total) DepWD,'CancelTerm' memo
						from BetHeader where tid=${tid} and isCancled=1 group by UserID,GameID,tid`;
				sql = sql + " on duplicate key update DepWD=values(DepWD)";
				sqls.push(sql);
				sql = "insert into Member(id,Balance) select uid id,sum(DepWD) Balance from UserCredit where 1 group by uid";
				sql = sql + " on duplicate key update Balance=values(Balance)";
				sqls.push(sql);
				const needBreak: boolean = false;
				// await conn.beginTransaction();
				await this.BeginTrans();
				await Promise.all(sqls.map(async (qry) => {
						if (needBreak) { return; }
						console.log("CancelTerm:", qry);
						const ans = await doQuery(qry, this.conn);
						if (!ans) {
								// await conn.rollback();
								await this.RollBack();
								msg.ErrNo = 9;
								msg.ErrCon = `error:${qry}`;
						}
				}));
				if (!needBreak) {
					// await conn.commit();
					await this.Commit();
				}
		} else {
				msg.ErrNo = 9;
				msg.ErrCon = `Term not found, ID= ${tid}`;
		}
		return msg;
	}
}
