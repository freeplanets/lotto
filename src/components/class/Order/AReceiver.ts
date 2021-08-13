import { ErrCode } from "../../../DataSchema/ENum";
import { IMsg, Order } from "../../../DataSchema/if";
export default abstract class AReceiver {
	public abstract process(UserID: number, order: Order): IMsg;
	protected preCheck(order: Order): IMsg {
		const msg: IMsg = { ErrNo: ErrCode.PASS };
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
		return msg;
	}
}
