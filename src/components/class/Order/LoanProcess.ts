import { PoolConnection } from "mariadb";
import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, IMsg, Order, CryptoOpParams } from "../../../DataSchema/if";
import AProcess from "./AProcess";
import CryptoOpParamProcess from "./CryptoOpParamProcess";

export default class LoanProcess extends AProcess {
	public async doOrder(UserID: number, order: Order): Promise<IMsg> {
		const msg = await this.createOrder(UserID, order);
		if (msg.ErrNo === ErrCode.PASS) {
			const newOrder = msg.data as AskTable;
			if (msg.OpParams) {
				const op = msg.OpParams as CryptoOpParams;
				const copp = new CryptoOpParamProcess(op, newOrder, this.conn);
				const ans = await copp.check();
				if (ans.ErrNo === ErrCode.PASS) {
					msg.data = newOrder;
				} else {
					msg.ErrNo = ans.ErrNo;
				}
			}
		}
		return msg;
	}
}
