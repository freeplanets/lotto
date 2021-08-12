import AReceiver from "./AReceiver";
import { HasUID, IMsg, Order } from "../../../DataSchema/if";
import { ErrCode } from "../../../DataSchema/ENum";

export default class DelOrUSetlReceiver extends AReceiver {
	process(UserID:number, order:Order):IMsg {
		let Odr: HasUID = {
			id: order.id,
			UserID,
		};
    if (order.ProcStatus === 2 ) {
      Odr.isUserSettle = 1;
    } else {
      Odr.ProcStatus = order.ProcStatus;
    }		
		const msg:IMsg = { ErrNo: ErrCode.PASS }
		msg.data = Odr;
		return msg;
	}
}