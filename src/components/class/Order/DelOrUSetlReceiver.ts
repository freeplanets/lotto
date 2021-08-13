import { ErrCode } from "../../../DataSchema/ENum";
import { HasUID, IMsg, Order } from "../../../DataSchema/if";
import AReceiver from "./AReceiver";

export default class DelOrUSetlReceiver extends AReceiver {
	public process(UserID: number, order: Order): IMsg {
		const Odr: HasUID = {
			id: order.id,
			UserID,
		};
  if (order.ProcStatus === 2 ) {
      Odr.isUserSettle = 1;
    } else {
      Odr.ProcStatus = order.ProcStatus;
    }
		const msg: IMsg = { ErrNo: ErrCode.PASS };
		msg.data = Odr;
		return msg;
	}
}
