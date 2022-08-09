import { ErrCode } from "../../../DataSchema/ENum";
import { IMsg } from "../../../DataSchema/if";
import { getConnection } from "../../../func/db";
import { ConnProvider, GetPostFunction } from "../Interface/Functions";
const AttachConn: ConnProvider = (param: any, f: GetPostFunction) => {
	return new Promise<IMsg>(async (resolve) => {
		let msg: IMsg;
		const callform = (param && param.callform) ? param.callform : "";
		const conn = await getConnection(callform);
		if (conn) {
			msg = await f(param, conn);
			await conn.release();
		} else {
			msg = {ErrNo: ErrCode.GET_CONNECTION_ERR , ErrCon: "GET_CONNECTION_ERR" };
		}
		resolve(msg);
	});
};
export default AttachConn;
