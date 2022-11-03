import { FuncKey } from "../../../../DataSchema/ENum";
import { getConnection } from "../../../../func/db";
import EmergencyClose from "../../Ask/EmergencyClose";
import AWebSocket from "../../WebSocket/AWebSocket";
import AOneFunction from "./AOneFunction";

export default class DelUndealedAsks extends AOneFunction {
	constructor(private sock: AWebSocket) {
		super();
	}
	public execute(): Promise<any> {
		return new Promise<any>(async (resolve) => {
			const conn = await getConnection("DelUndealedAsks");
			if (conn) {
				const ec = new EmergencyClose(this.sock, conn);
				await ec.doit(FuncKey.DELETE_UNDEALED_ASKS);
				resolve(true);
			}
			resolve(false);
		});
	}
}
