import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, IDbAns, IHasID, IMsg, ItemTotal } from "../../../DataSchema/if";
interface AskTableLever extends AskTable {
	Lever: number;
}
export default class ItemTotalAccess {
	private jt: JTable<IHasID>;
	constructor(private conn: PoolConnection) {
		this.jt = new JTable(this.conn, "ItemTotal");
	}
	public addDeal(itemid: number, total: number) {
		const row: ItemTotal = {
			id: itemid,
			Total: total,
			// InProc: total * -1,
		};
		// console.log("ItemTotalAccess addDeal", row);
		return this.modify(row);
	}
	public async reduceDeal(itemid: number, askid: number): Promise<IMsg> {
		let msg: IMsg = { ErrNo: ErrCode.PASS };
		const res = await this.getAskAmount(askid);
		if (res) {
			const ask = res as AskTableLever;
			const total = ask.ItemType * ask.Amount * ask.Lever;
			const row: ItemTotal = {
				id: itemid,
				Total: total * -1,
			};
			msg = await this.modify(row);
		} else {
			msg.ErrNo = ErrCode.NO_DATA_FOUND;
			msg.ErrCon = `get AskTable id:${askid} not found`;
		}
		return msg;
	}
	public addAsk(itemid: number, total: number) {
		const row: ItemTotal = {
			id: itemid,
			InProc: total,
		};
		return this.modify(row);
	}
	public reduceAsk(itemid: number, total: number) {
		const row: ItemTotal = {
			id: itemid,
			InProc: total * -1,
		};
		return this.modify(row);
	}
	private getAskAmount(askid: number) {
		this.jt.setTableName("AskTable");
		const promise = this.jt.getOne({ id: askid }, ["id", "ItemID", "ItemType", "Amount", "Lever"]);
		this.jt.resetTableName();
		return promise;
	}
	private async modify(row: IHasID) {
		const msg: IMsg = { ErrNo: ErrCode.DB_QUERY_ERROR };
		const ans = await this.jt.MultiUpdate([row], true);
		if (ans) {
			const dbAns = ans as IDbAns;
			if (dbAns.affectedRows > 0) { msg.ErrNo = ErrCode.PASS; }
		}
		return msg;
	}
}
