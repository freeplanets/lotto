import { PoolConnection } from "mariadb";
import { ErrCode } from "../../../DataSchema/ENum";
import { IMsg, Items, Order, UserInfo, WebParams } from "../../../DataSchema/if";
import DataAccess from "../DataBase/DataAccess";
import AProcess from "./AProcess";
import LoanProcess from "./LoanProcess";
import NotLoanProcess from "./NotLoanProcess";

export default class ReceiverManager {
	constructor(private conn: PoolConnection) {}
	public Process(param: WebParams): Promise<IMsg> {
		return new Promise(async (resolve) => {
			let msg = this.ParamPreCheck(param);
			if (msg.ErrNo === ErrCode.PASS) {
				const order = msg.data as Order;
				const da = new DataAccess(this.conn);
				msg = await da.getItemByID(order.ItemID);
				if (msg.ErrNo === ErrCode.PASS) {
					const item = msg.data as Items;
					let proc: AProcess;
					const UserID = param.UserID;
					msg = await da.getUser(UserID);
					const user = msg.data as UserInfo;
					if (msg.ErrNo === ErrCode.PASS) {
						if (item.isLoan) {
							proc = new LoanProcess(da);
						} else {
							proc = new NotLoanProcess(da);
						}
						msg = await proc.doOrder(user, order, item);
					}
				}
			}
			resolve(msg);
		});
	}
	private ParamPreCheck(param: WebParams) {
		const msg: IMsg = { ErrNo: ErrCode.PASS };
		if (!param.order) {
			msg.ErrNo = ErrCode.MISS_PARAMETER;
			msg.ErrCon = "No order found!!";
			return msg;
		}
		const order = param.order;
		if ( !order.ProcStatus || order.ProcStatus < 2) {
			if ( !order.BuyType ) {   // 買
				if ( !order.Amount || !order.AskPrice) {
					msg.ErrNo = ErrCode.MISS_PARAMETER;
					msg.ErrCon = "No Price found";
					return msg;
				}
			} else { // 賣
				if (!order.USetID) { // 非會員平倉單
					if ( !((order.Qty && !order.Amount) || (!order.Qty && order.Amount)) ) {
						msg.ErrNo = ErrCode.MISS_PARAMETER;
						msg.ErrCon = " Qty XOR Amount false!!";
						return msg;
					}
				}
			}
		}
		msg.data = order;
		return msg;
	}
}
