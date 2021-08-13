import { PoolConnection } from "mariadb";
import { ErrCode } from "../../../DataSchema/ENum";
import { CryptoOpParams, Order, AskTotal, IMsg, AskTable } from "../../../DataSchema/if";
import DataAccess from "./DataAccess";

export default class CryptoOpParamProcess {
	private op:CryptoOpParams;
	private order:Order;
	private conn:PoolConnection;
	private da:DataAccess;
	private msg:IMsg = { ErrNo: ErrCode.PASS };
	constructor(op:CryptoOpParams, order:Order, conn:PoolConnection) {
		this.op = op;
		this.order = order;
		this.conn = conn;
		this.da = new DataAccess(this.conn);
	}
	public async check(){
		Object.keys(this.op).every(async (key) => {
			let ans = true;
			switch(key){
				case 'OneHand':
					if (this.order.id === 0) {
						ans = this.checkOneHand();
					}
					break;
				case 'FullStorage':
					if (this.order.id === 0) {
						ans = await this.checkFullStorage();
					}
					break;
				case 'LeverLimit':
					if (this.order.id === 0) {
						ans = await this.checkLeverLimit();
					}
					break;
				case 'ShortTerm1':
				case 'ShortTerm2':
					if (this.order.id) {
						ans = await this.checkShortTerm();
					}
					break;
				default:
					ans = true;
			}
			return ans;
		})
		return this.msg;
	}
	private checkOneHand(){
		let chk = true;
		const onehand = this.op.OneHand;
		if (this.order.Lever) {
			if (this.order.Amount * this.order.Lever > onehand) {
				chk = false;
				this.msg.ErrNo = ErrCode.OVER_ONE_HAND;
			}
		}
		return chk;
	}
	private async checkFullStorage() {
		let chk = true;
		const fullStorage = this.op.FullStorage;
		if(this.order.Lever) {
			const total = await this.getAskTotal(this.order.ItemID);
			if((total+this.order.Lever * this.order.Amount) * this.order.ItemType > fullStorage) {
				chk = false;
				this.msg.ErrNo = ErrCode.OVER_FULL_STORAGE;
			}
		}
		return chk;
	}
	private async checkLeverLimit() {
		let chk = true;
		const lever = this.op.LeverLimit;
		if(this.order.Lever) {
			if (this.order.Lever > lever) this.order.Lever = lever;
		}
		return chk;
	}
	private async checkShortTerm() {
		let chk = true;
		const st1 = this.op.ShortTerm1;
		const st2 = this.op.ShortTerm2;
		const termfee = this.op.ShortTermFee;
		if (st1 || st2) {
			const checktime = new Date().getTime();
			const dealtime = await this.getDealTime(this.order.id);
			const diff = (checktime - dealtime)/1000;
			if (st1 && diff < st1){
				chk = false;
				this.msg.ErrNo = ErrCode.IN_SHORT_TERM;
			}
			if (st2 && diff < st2) {
				if(!chk) this.order.TermFee = termfee;
			}
		}
		return chk;
	}
	private async getAskTotal(itemid:number):Promise<number> {
		let total = 0;
		const msg = await this.da.getAskTotal(itemid);
		if(msg.ErrNo === ErrCode.PASS) {
			const ans = msg.data as AskTotal;
			total = ans.Total;
		}
		return total;
	}
	private async getDealTime(askid:number):Promise<number> {
		let dealtime = 0;
		const msg = await this.da.getAskDealTime(askid);
		if (msg.ErrNo === ErrCode.PASS ) {
			const ans = msg.data as AskTable;
			if (ans.DealTime) dealtime = ans.DealTime;
		}
		return dealtime;
	}
}