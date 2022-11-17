import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode, FuncKey } from "../../../DataSchema/ENum";
import { AskTable, HasUID, IHasID, IKeyVal, IMsg, WsMsg } from "../../../DataSchema/if";
import AWebSocket from "../WebSocket/AWebSocket";
import DeleteOrder from "./DeleteOrder";

export default class EmergencyClose {
	private jt: JTable<IHasID>;
	constructor(private wsc: AWebSocket, private conn: PoolConnection, tableName = "AskTable") {
		this.jt = new JTable(this.conn, tableName);
	}
	public async doit(fkey = FuncKey.EMERGENCY_CLOSE) {
		let msg: IMsg = { ErrNo: ErrCode.PASS };
		msg = await this.CancelUnPricedAsk();
		if (msg.ErrNo === ErrCode.PASS) {
			if (msg.data) {
				const wsg: WsMsg = {
					Func: fkey,
					Asks: msg.data as AskTable[],
				};
				console.log("EmergencyClose doit:", wsg);
				this.wsc.Send(wsg);
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
		const msg: IMsg = { ErrNo: ErrCode.PASS, ErrCon: "No Asks" };
		if (users) {
			msg.ErrCon = "";
			// msg.data = users;
			msg.data = [];
			await Promise.all(users.map(async (itm) => {
				const tmp: HasUID = {
					id: itm.id,
					UserID: itm.UserID,
					ProcStatus: 4,
				};
				(msg.data as object[]).push(tmp);
				const DelProc = new DeleteOrder(tmp, this.conn, "AskTable");
				await DelProc.proc();
			})).catch((err) => {
				console.log("CancelUnPricedAsk", err);
			});
		}
		return msg;
	}
	/*
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
	*/
}
