import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IKeyVal, IMsg, Items } from "../../../DataSchema/if";

export default class DataAccess {
	constructor(private conn:PoolConnection){}
	getLeverParam(level:number) {
		const filter: IKeyVal = { Multiples: level };
		return this.getData('Lever', filter);
	}
	getAskDealTime(askid:number) {
		const filter: IKeyVal = { id: askid };
		const fields = ['id', 'DealTime'];
		return this.getData('AskTable', filter, fields);
	}
	getAskTotal(itemid:number):Promise<IMsg> {
		const filter: IKeyVal = { ItemID: itemid };
		const fields = ['ItemID','Total'];
		return this.getData('AskTotal', filter, fields);
	}
	getOpParam(clevel:string,ItemID:number):Promise<IMsg> {
		const filter: IKeyVal = {OpType: clevel, ItemID };
		return this.getData('CryptoOpParams', filter);
	}
	getItemByID(itemid: number): Promise<IMsg> {
		const filter: IKeyVal = { id: itemid };
		const fields = ['id', 'Code', 'Closed', 'isLoan', 'CloseFee', 'OpenFee', 'StopGain', 'StopLose'];
		return this.getData('Items', filter, fields);
	}
	getUser(UserID: number): Promise<IMsg> {
		const filter: IKeyVal = { id: UserID };
		const fields = ['id', 'UpId', 'CLevel'];
		return this.getData('Member', filter, fields);
	}	
	private getData(tablename: string, filter: IKeyVal, fields?: string|string[]): Promise<IMsg> {
		return new Promise((resolve, reject) => {
			const jt = new JTable<Items>(this.conn, tablename);
			const msg: IMsg = { ErrNo: ErrCode.PASS };
			jt.getOne(filter, fields).then((res) => {
				if (res) {
					msg.data = res;
				} else {
					msg.ErrNo = ErrCode.NO_DATA_FOUND;
					msg.ErrCon = 'Item not found!';
				}
				resolve(msg);
			}).catch((err) => {
				msg.ErrNo = ErrCode.DB_QUERY_ERROR;
				msg.error = err;
				reject(msg);
			});
		});
	}	
}