import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, IMsg, Items, Lever, Order, UserInfo } from "../../../DataSchema/if";
import DataAccess from "../DataBase/DataAccess";

export default abstract class AProcess {
	// private da: DataAccess;
	constructor(protected da: DataAccess) {
	}
	public abstract doOrder(user: UserInfo, order: Order, item: Items): Promise<IMsg>;
	public async createOrder(user: UserInfo, order: Order, item: Items): Promise<IMsg> {
		let msg: IMsg = { ErrNo: ErrCode.PASS };
		let newOrder: Order | undefined;
		const UserID = user.id;
		if (order.id) {
			newOrder = this.copyOrder(order);
			if (!newOrder.UserID) { newOrder.UserID = UserID; }
			if (newOrder.ProcStatus === 2) {
				newOrder.isUserSettle = 1;
				newOrder.ProcStatus = 1;
			}
			// console.log("createOrder has order id", newOrder);
		} else {
			msg = await this.da.getItemByID(order.ItemID);
			if (msg.ErrNo !== ErrCode.PASS) { return msg; }
			// const item = msg.data as Items;
			if (item.isLoan) {
				msg = await this.da.getLeverParam(order.Lever);
				if (msg.ErrNo !== ErrCode.PASS) { return msg; }
				const lever = msg.data as Lever;
				item.OpenFee = lever.LongT;
				item.CloseFee = lever.ShortT;
			}
			newOrder = this.newOrder(user, item, order);
		}
		msg.data = newOrder;
		return msg;
	}
	private copyOrder(order: Order) {
		if (order.USetID) {
			order.SetID = 0;
		}
		return { ...order };
	}
	private newOrder(User: UserInfo, item: Items, order: Order) {
		const newOrder: AskTable = {
      id: order.id,
      UserID: User.id,
      UpId: User.UpId,
      CLevel: User.CLevel,
      ItemID: item.id,
      ItemType: order.ItemType,
      Code: item.Code,
      AskType: order.AskType,
      BuyType: order.BuyType,
      AskPrice: order.AskPrice,
      Amount: order.Amount,
      AskFee: order.BuyType ? item.CloseFee : item.OpenFee,
      Price: 0,
      Qty: order.Qty ? order.Qty : 0,
      ProcStatus: order.ProcStatus ? order.ProcStatus : 0,
    };
		if (order.Lever) {
			newOrder.Lever = order.Lever;
			newOrder.StopGain = item.StopGain;
			newOrder.StopLose = item.StopLose;
		}
		return newOrder;
	}
}
