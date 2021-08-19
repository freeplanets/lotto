import { PoolConnection } from "mariadb";
import FilterFactory from "../../../components/FilterFactory";
import { ErrCode } from "../../../DataSchema/ENum";
import { IKeyVal, IMsg } from "../../../DataSchema/if";
import { doQuery } from "../../../func/db";

export default class Member {
	public async getGainLose(filter: string | IKeyVal | IKeyVal[], conn: PoolConnection) {
		const msg: IMsg = { ErrNo: ErrCode.PASS };
		const fltr = new FilterFactory(filter).getFilter();
		const sql = `Select UserID, sum(Qty*BuyPrice) Total, sum(Qty*BuyPrice*Lever) LeverTotal,
		sum(GainLose) GainLose from LedgerLever where ${fltr} Group by UserID`;
		console.log("Report Member sql", sql);
		const ans = await doQuery(sql, conn);
		if (ans) {
			msg.data = ans;
		} else {
			msg.ErrNo = ErrCode.NO_DATA_FOUND;
		}
		return msg;
	}
}
