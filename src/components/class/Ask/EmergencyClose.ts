import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode, FuncKey } from "../../../DataSchema/ENum";
import { IHasID, IKeyVal, IMsg, WsMsg } from "../../../DataSchema/if";
import { WsClient } from "../../webSC";

export default class EmergencyClose {
	private jt: JTable<IHasID>;
	constructor(private wsc: WsClient, conn: PoolConnection, tableName = "AskTable") {
		this.jt = new JTable(conn, tableName);
	}
	public async doit() {
		let msg: IMsg = { ErrNo: ErrCode.PASS };
		msg = await this.CancelUnPricedAsk();
		if (msg.ErrNo === ErrCode.PASS) {
			const wsg: WsMsg = {
				Func: FuncKey.EMERGENCY_CLOSE,
			};
			this.wsc.Send(JSON.stringify(wsg));
		} else {
			console.log(msg);
		}
	}
	private CancelUnPricedAsk() {
		const param: IKeyVal[] = [];
		param.push({ ProcStatus: 2, Cond: "<" });
		param.push({ SetID: 0, USetID: 0 });
		return this.jt.Updates({ ProcStatus: 4 }, param);
	}
}
