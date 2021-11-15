import LZString from "lz-string";
import { PoolConnection } from "mariadb";
import { chkTermIsSettled } from "../../API/ApiFunc";
import { ErrCode } from "../../DataSchema/ENum";
import { IMsg } from "../../DataSchema/if";
import { doQuery } from "../../func/db";

export default class CurOddsInfo {
	constructor(private conn: PoolConnection) {}
	public async Get(tid: number, GameID: number|string, MaxOddsID: number): Promise<any> {
		if (!tid) { return false; }
		const gameStoped: boolean = await chkTermIsSettled(GameID, this.conn, tid);
		// console.log("getCurOddsInfo gameStoped:", gameStoped);
		const sql = `select UNIX_TIMESTAMP(OID) OID,BetType,SubType,Num,Odds,MaxOdds,isStop,Steps,PerStep,tolW,tolS,tolP from CurOddsInfo where tid=? and GameID=? and UNIX_TIMESTAMP(OID) > ?`;
		const ans = {};
		const res = await doQuery(sql, this.conn, [tid, GameID, MaxOddsID]);
		if (res) {
				// console.log("getCurOddsInfo", res);
				res.map((itm) => {
						if (!ans[itm.BetType]) { ans[itm.BetType] = {}; }
						const tmp = {
								OID: itm.OID,
								Odds: itm.Odds,
								MaxOdds: itm.MaxOdds,
								SubType: itm.SubType,
								isStop: itm.isStop | (gameStoped ? 1 : 0),
								Steps: itm.Steps,
								PerStep: itm.PerStep,
								tolW: itm.tolW,
								tolS: itm.tolS,
								tolP: itm.tolP,
						};
						ans[itm.BetType][itm.Num] = Object.assign({}, tmp);
				});
		} else  {
				return;
		}
		return ans;
	}
	public async Save(tid: number, GameID: number|string): Promise<void> {
		const ans = await this.Get(tid, GameID, 0);
		if (ans) {
			const oddSql = "insert into OpHistory(GameID, tid, OddsInfo) values(?,?,?) on duplicate key update GameID=values(GameID)";
			const odds = JSON.stringify(ans);
			const oddsZ = LZString.compressToUTF16(odds);
			console.log("ZipCheck", odds.length, oddsZ.length);
			doQuery(oddSql, this.conn, [GameID, tid, oddsZ]).then((saveinfo) => {
				console.log("save odds history:", saveinfo);
			}).catch((err) => {
				console.log("save odds history error:", err);
			});
		}
	}
	public async getHisList(GameID: number): Promise<IMsg> {
		return new Promise<IMsg>((resolve) => {
			const msg: IMsg = { ErrNo: ErrCode.PASS };
			const sql = `Select tid,t.TermID from
			OpHistory o left join Terms t on o.tid = t.id
			where o.GameID = ${GameID} order by TermID desc limit 0, 10`;
			doQuery(sql, this.conn).then((res) => {
				msg.data = res;
				resolve(msg);
			}).catch((err) => {
				msg.ErrNo = ErrCode.DB_QUERY_ERROR;
				msg.error = err;
				resolve(msg);
			});
		});
	}
}
