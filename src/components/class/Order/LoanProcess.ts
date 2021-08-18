import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, CryptoOpParams, IMsg, Items, Order, UserInfo } from "../../../DataSchema/if";
import AProcess from "./AProcess";
import CryptoOpParamProcess from "./CryptoOpParamProcess";

export default class LoanProcess extends AProcess {
	public async doOrder(user: UserInfo, order: Order, item: Items): Promise<IMsg> {
		let msg = await this.createOrder(user, order, item);
		if (msg.ErrNo === ErrCode.PASS) {
			const newOrder = msg.data as AskTable;
			msg = await this.da.getOpParam(user.CLevel, order.ItemID);
			// msg.OpParams = { ...msg.data };
			if (msg.ErrNo === ErrCode.PASS) {
				const op = { ...msg.data } as CryptoOpParams;
				const copp = new CryptoOpParamProcess(this.da, op, newOrder);
				const ans = await copp.check();
				// console.log("LoanProcess after opcheck", JSON.stringify(newOrder));
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
