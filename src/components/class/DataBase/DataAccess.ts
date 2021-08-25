import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IHasID, IKeyVal, IMsg } from "../../../DataSchema/if";

export default class DataAccess {
	constructor(private conn: PoolConnection, private getList: boolean= false) {}
	public getLeverParam(level?: number) {
		const filter: IKeyVal = { Multiples: level };
		return this.getData("Lever", filter);
	}
	public getAskDealTime(askid: number) {
		const filter: IKeyVal = { id: askid };
		const fields = ["id", "DealTime"];
		return this.getData("AskTable", filter, fields);
	}
	public getItemTotal(itemid: number): Promise<IMsg> {
		const filter: IKeyVal = { id: itemid };
		const fields = ["id", "Total"];
		return this.getData("ItemTotal", filter, fields);
	}
	public getOpParam(clevel: string, ItemID?: number): Promise<IMsg> {
		const filter: IKeyVal = {OpType: clevel};
		if (ItemID) { filter.ItemID = ItemID; }
		return this.getData("CryptoOpParams", filter);
	}
	public getItemByID(itemid: number): Promise<IMsg> {
		const filter: IKeyVal = { id: itemid };
		const fields = ["id", "Code", "Closed", "isLoan", "CloseFee", "OpenFee", "StopGain", "StopLose"];
		return this.getData("Items", filter, fields);
	}
	public getUser(UserID: number): Promise<IMsg> {
		const filter: IKeyVal = { id: UserID };
		const fields = ["id", "UpId", "CLevel"];
		return this.getData("Member", filter, fields);
	}
	public async AskInProcess(UserID: number, ItemID: number, ItemType: number): Promise<IMsg> {
		const filter: IKeyVal[] = [
			{ Key: "UserID", Val: UserID },
			{ Key: "AskType", Val: 1 },
			{ Key: "BuyType", Val: 0 },
			{ Key: "ItemID", Val: ItemID },
			{ Key: "ItemType", Val: ItemType },
			{ Key: "ProcStatus", Val: 2 , Cond: "<" }
		];
		const fields = ["id", "UserID"];
		const msg = await this.getData("AskTable", filter, fields);
		if (msg.ErrNo === ErrCode.PASS) {
			const datas = msg.data as IHasID;
			if (datas.id) { msg.ErrNo = ErrCode.HAS_ASK_IN_PROCESS; }
		} else if (msg.ErrNo === ErrCode.NO_DATA_FOUND) {
			msg.ErrNo = ErrCode.PASS;
		}
		return msg;
	}
	private getData(tablename: string, filter: IKeyVal | IKeyVal[], fields?: string|string[]): Promise<IMsg> {
		return new Promise((resolve) => {
			const jt = new JTable<IHasID>(this.conn, tablename);
			const msg: IMsg = { ErrNo: ErrCode.PASS };
			let func: Promise<any>;
			if (this.getList) {
				func = jt.List(filter, fields);
			} else {
				func = jt.getOne(filter, fields);
			}
			// jt.getOne(filter, fields)
			func.then((res) => {
				if (res) {
					msg.data = res;
				} else {
					msg.ErrNo = ErrCode.NO_DATA_FOUND;
					msg.ErrCon = "Item not found!";
				}
				resolve(msg);
			}).catch((err) => {
				msg.ErrNo = ErrCode.DB_QUERY_ERROR;
				msg.error = err;
				resolve(msg);
			});
		});
	}
}
