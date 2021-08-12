import { WebParams, IMsg } from "../../../DataSchema/if";
import { ErrCode } from "../../../DataSchema/ENum";

export default class ReceiverManager {
	ParamPreCheck(param:WebParams) {
		const msg:IMsg = { ErrNo: ErrCode.PASS };
		if (!param.order) {
			msg.ErrNo = ErrCode.MISS_PARAMETER;
			msg.ErrCon = "No order found!!";
			return msg;
		}
		return msg
	}
	Process(param:WebParams) {
		const msg = this.ParamPreCheck(param);
		if (msg.ErrNo === ErrCode.PASS) {

		}
		return msg;
	}
}