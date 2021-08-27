import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IHasID, IKeyVal, IMsg } from "../../../DataSchema/if";
import { WsClient } from "../../webSC";

export default class EmergencyClose {
	private jt: JTable<IHasID>;
	constructor(private wsc: WsClient, conn: PoolConnection, tableName = "AskTable") {
		this.jt = new JTable(conn, tableName);
	}
	public async doit() {
		let msg: IMsg = { ErrNo: ErrCode.PASS };
		msg = await this.getUnPricedAsk();
		if (msg.ErrNo === ErrCode.PASS) {
			const ids = msg.data as IHasID[];
		}
	}
	private getUnPricedAsk() {
		const param: IKeyVal[] = [];
		param.push({ ProcStatus: 2, Cond: "<" });
		param.push({ SetID: 0, USetID: 0 });
		return this.jt.Lists(param, ["id"]);
	}
}
