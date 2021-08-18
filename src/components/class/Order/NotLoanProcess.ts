import { IMsg, Items, Order, UserInfo } from "../../../DataSchema/if";
import AProcess from "./AProcess";

export default class NotLoanProcess extends AProcess {
	public async doOrder(user: UserInfo, order: Order, item: Items): Promise<IMsg> {
		return this.createOrder(user, order, item);
	}
}
