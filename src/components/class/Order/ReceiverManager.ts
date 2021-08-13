import { PoolConnection } from "mariadb";
import { ErrCode } from "../../../DataSchema/ENum";
import { IMsg, Order, WebParams } from "../../../DataSchema/if";
import AProcess from "./AProcess";
import LoanProcess from "./LoanProcess";
import NotLoanProcess from "./NotLoanProcess";

export default class ReceiverManager {
	constructor(private conn: PoolConnection) {}
	public ParamPreCheck(param: WebParams) {
		const msg: IMsg = { ErrNo: ErrCode.PASS };
		if (!param.order) {
			msg.ErrNo = ErrCode.MISS_PARAMETER;
			msg.ErrCon = "No order found!!";
			return msg;
		}
		return msg;
	}
	public Process(param: WebParams) {
		let msg = this.ParamPreCheck(param);
		if (msg.ErrNo === ErrCode.PASS) {
			const order = msg.data as Order;
			let proc: AProcess;
			const UserID = param.UserID;
			if (order.Lever) {
				proc = new LoanProcess(this.conn);
			} else {
				proc = new NotLoanProcess(this.conn);
			}
			msg = proc.doOrder(UserID, order);
		}
		return msg;
	}
}
