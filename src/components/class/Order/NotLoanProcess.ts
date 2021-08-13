import { ErrCode } from "../../../DataSchema/ENum";
import { IMsg, Items, Order, UserInfo } from "../../../DataSchema/if";
import AProcess from "./AProcess";

export default class NotLoanProcess extends AProcess {
	public async doOrder(UserID: number, order: Order): Promise<IMsg> {
		return this.createOrder(UserID, order);
	}
}
