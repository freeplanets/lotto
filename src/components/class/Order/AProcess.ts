import { PoolConnection } from "mariadb";
import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, IMsg, Items, Order, UserInfo } from "../../../DataSchema/if";
import DataAccess from "./DataAccess";
import { StopType } from "../../../DataSchema/ENum";

export default abstract class AProcess {
	private da:DataAccess;
	constructor(protected conn: PoolConnection) {
		this.da = new DataAccess(this.conn);
	}
	public abstract doOrder(UserID: number, order: Order): IMsg;
	public async createOrder(UserID: number, order: Order): Promise<IMsg> {
		let msg: IMsg = { ErrNo: ErrCode.PASS };
		msg = await this.da.getUser(UserID);
		const user = msg.data as UserInfo;
		if (msg.ErrNo !== ErrCode.PASS) { return msg; }
		let newOrder:Order | undefined;
		if (order.id) {
			newOrder = this.copyOrder(order);
		} else {
			msg = await this.da.getItemByID(order.ItemID);
			if (msg.ErrNo !== ErrCode.PASS) { return msg; }
			const item = msg.data as Items;
			if (item.isLoan) {

			} else {
				newOrder = this.newOrder(user, item, order);
				newOrder.AskFee = order.BuyType ? item.CloseFee : item.OpenFee;
			}
		}
		if(newOrder) {
			if(newOrder.ItemID){
				msg = await this.da.getOpParam(newOrder.CLevel, newOrder.ItemID);
				msg.OpParams = { ...msg.data };
			}
			msg.data = newOrder;			
		}
		return msg;
	}
	private itemCheck(Item:Items, order:Order) {
		const msg:IMsg = { ErrNo:ErrCode.PASS };
    if (Item.isLoan) {
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
		return msg;
	}
	private copyOrder(order:Order) {
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
      AskFee: 0,
      Price: 0,
      Qty: order.Qty ? order.Qty : 0,
      ProcStatus: order.ProcStatus ? order.ProcStatus: 0,
    };
		if(order.Lever) newOrder.Lever = order.Lever;
		return newOrder;
	}
}
