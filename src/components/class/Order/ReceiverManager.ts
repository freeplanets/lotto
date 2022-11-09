import { PoolConnection } from "mariadb";
import { Channels, ErrCode, StopType } from "../../../DataSchema/ENum";
import { IMsg, Items, Order, UserInfo, WebParams, WsMsg } from "../../../DataSchema/if";
import DataAccess from "../DataBase/DataAccess";
import AWebSocket from "../WebSocket/AWebSocket";
import AProcess from "./AProcess";
import LoanProcess from "./LoanProcess";
import NotLoanProcess from "./NotLoanProcess";

export default class ReceiverManager {
	constructor(private conn: PoolConnection, private ws: AWebSocket) {}
	public Process(param: WebParams): Promise<IMsg> {
		return new Promise(async (resolve) => {
			let msg = this.ParamPreCheck(param);
			if (msg.ErrNo === ErrCode.PASS) {
				const order = msg.data as Order;
				const UserID = param.UserID;
				const da = new DataAccess(this.conn);
				if (!order.id && order.AskType) {
					msg = await da.AskInProcess(UserID, order.ItemID, order.ItemType);
				}
				if (msg.ErrNo === ErrCode.PASS) {
					msg = await da.getItemByID(order.ItemID);
					if (msg.ErrNo === ErrCode.PASS) {
						const item = msg.data as Items;
						msg = await this.itemCheck(item, order, da);
						// console.log("RecevierManager after itemCheck:", msg);
						if (msg.ErrNo === ErrCode.PASS) {
							let proc: AProcess;
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
	private async itemCheck(Item: Items, order: Order, da: DataAccess) {
		const msg: IMsg = { ErrNo: ErrCode.PASS };
  if (Item.isLoan) {
			if (Item.EmergencyClosed) {
				// console.log("ReceiverManager itemCheck order:", order);
				msg.ErrNo = ErrCode.EMERGENCY_STOPED;
				if (order.ProcStatus === 2) {
					const ans = await da.asignSettleMark(order.id, order.ItemID);
					// console.log("itemCheck add mark", ans);
					if (ans.ErrNo === ErrCode.PASS) {
						msg.ErrNo = ErrCode.EMERGENCY_STOPED;
						msg.data = ans.data;
						const wsmsg: WsMsg = {
							ChannelName: Channels.ADMIN,
							SettleMark: ans.data,
						};
						this.ws.Send(wsmsg);
					} else {
						msg.ErrNo = ans.ErrNo;
					}
				}
			} else {
				let ST = StopType.LONG_STOP;
				if ( order.ItemType === -1 ) { ST = StopType.SHORT_STOP; }
				const isClosed: boolean = !!(Item.Closed & ST);
				if (isClosed) {
					let str = "short";
					if (ST === StopType.LONG_STOP ) { str = "long"; }
					msg.ErrNo = ErrCode.NUM_STOPED;
					msg.ErrCon = `Not accpet new ${str} order now!!`;
				}
			}
    } else {
			if (Item.EmergencyClosed) {
				msg.ErrNo = ErrCode.EMERGENCY_STOPED;
			}
		}
		return msg;
	}
}
