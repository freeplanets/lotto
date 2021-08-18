import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, CryptoOpParams, IMsg, ItemTotal, Order } from "../../../DataSchema/if";
import DataAccess from "../DataBase/DataAccess";

interface ItemTotalT extends ItemTotal {
	Total: number;
}

export default class CryptoOpParamProcess {
	private op: CryptoOpParams;
	private order: Order;
	private msg: IMsg = { ErrNo: ErrCode.PASS };
	constructor(private da: DataAccess, op: CryptoOpParams, order: Order) {
		this.op = op;
		this.order = order;
	}
	public async check(): Promise<IMsg> {
		const ans = true;
		if (!this.order.isUserSettle) {
			this.checkOneHand();
			if (this.msg.ErrNo === ErrCode.PASS) { await this.checkFullStorage(); }
			if (this.msg.ErrNo === ErrCode.PASS) { await this.checkLeverLimit(); }
		} else {
			await this.checkShortTerm();
		}
		// console.log("op check done", this.msg);
		return this.msg;
	}
	private checkOneHand() {
		const onehand = this.op.OneHand;
		if (this.order.Lever) {
			if (this.order.Amount * this.order.Lever > onehand) {
				this.msg.ErrNo = ErrCode.OVER_ONE_HAND;
			}
		}
	}
	private async checkFullStorage() {
		const fullStorage = this.op.FullStorage;
		if (this.order.Lever) {
			const total = await this.getItemTotal(this.order.ItemID);
			if ((total + this.order.Lever * this.order.Amount) * this.order.ItemType > fullStorage) {
				this.msg.ErrNo = ErrCode.OVER_FULL_STORAGE;
			}
		}
	}
	private async checkLeverLimit() {
		const lever = this.op.LeverLimit;
		if (this.order.Lever) {
			if (this.order.Lever > lever) { this.order.Lever = lever; }
		}
	}
	private async checkShortTerm(): Promise<void> {
			const st1 = this.op.ShortTerm1;
			const st2 = this.op.ShortTerm2;
			const termfee = this.op.ShortTermFee;
			// console.log("checkShortTerm op", st1, st2, termfee);
			if (st1 || st2) {
				const checktime = new Date().getTime();
				const dealtime = await this.getDealTime(this.order.id);
				const diff = (checktime - dealtime) / 1000;
				// console.log("checkshortTerm check", checktime, dealtime, diff);
				if (st1 && diff < st1) {
					this.msg.ErrNo = ErrCode.IN_SHORT_TERM;
				} else if (st2 && diff < st2) {
					this.order.TermFee = termfee;
					// console.log("op checkShertTerm Add TermFee", this.order.TermFee, termfee);
				}
			}
	}
	private async getItemTotal(itemid: number): Promise<number> {
		let total = 0;
		const msg = await this.da.getItemTotal(itemid);
		if (msg.ErrNo === ErrCode.PASS) {
			const ans = msg.data as ItemTotalT;
			total = ans.Total;
		}
		return total;
	}
	private async getDealTime(askid: number): Promise<number> {
		let dealtime = 0;
		const msg = await this.da.getAskDealTime(askid);
		if (msg.ErrNo === ErrCode.PASS ) {
			const ans = msg.data as AskTable;
			if (ans.DealTime) { dealtime = ans.DealTime; }
		}
		return dealtime;
	}
}
