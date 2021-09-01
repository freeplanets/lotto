import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode, FuncKey } from "../../../DataSchema/ENum";
import { AskTable, HasUID, IHasID, IKeyVal, IMsg, WsMsg } from "../../../DataSchema/if";
import { WsClient } from "../../webSC";

export default class EmergencyClose {
	private jt: JTable<IHasID>;
	constructor(private wsc: WsClient, conn: PoolConnection, tableName = "AskTable") {
		this.jt = new JTable(conn, tableName);
	}
	public async doit() {
		let msg: IMsg = { ErrNo: ErrCode.PASS };
		msg = await this.CancelUnPricedAsk();
		// console.log("EmergencyClose doit:", msg);
		if (msg.ErrNo === ErrCode.PASS) {
			if (msg.data) {
				const wsg: WsMsg = {
					Func: FuncKey.EMERGENCY_CLOSE,
					Asks: msg.data as AskTable[],
				};
				this.wsc.Send(JSON.stringify(wsg));
			}
		} else {
			console.log("EmergencyClose error:", msg);
		}
	}
	private async CancelUnPricedAsk() {
		const param: IKeyVal[] = [];
		param.push({ ProcStatus: 2, Cond: "<" });
		param.push({ SetID: 0, USetID: 0 });
		const users = await this.jt.List(param, ["id", "UserID"]);
		let msg: IMsg = { ErrNo: ErrCode.PASS, ErrCon: "No Asks" };
		if (users) {
			msg = await this.jt.Updates({ ProcStatus: 4 }, param);
			if (msg.ErrNo === ErrCode.PASS) {
				const partAsk = users.map((itm) => {
					const tmp: HasUID = {
						id: itm.id,
						UserID: itm.UserID,
						ProcStatus: 4,
					};
					return tmp;
				});
				if (partAsk.length > 0) { msg.data = partAsk; }
			}
		}
		return msg;
	}
}
