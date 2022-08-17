import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IMsg } from "../../../DataSchema/if";
import MyDate from "../Functions/MyDate";

interface MIP {
	id?: number;
	UserID: number;
	InProcess: number;
}

const tableName = "MemberInProcess";

export default class MemberInProcess {
	private jt: JTable<MIP>;
	constructor(private conn: PoolConnection) {
		this.jt = new JTable<MIP>(this.conn, tableName);
	}
	public async checkIn(UserID: number, chk = 0): Promise<IMsg> {
		return new Promise(async (resolve) => {
			let ans = await this.jt.getOne({UserID});
			console.log(`MemberInProcess checkIn ${chk} start:`, JSON.stringify(ans));
			while (ans && ans.InProcess) {
				await MyDate.delay(1);
				ans = await this.jt.getOne({UserID});
				console.log(`MemberInProcess checkIn ${chk}:`, JSON.stringify(ans));
			}
			const msg = await this.modifyInProcess(UserID, true);
			resolve(msg);
		});
	}
	public async checkOut(UserID: number, chk = 0): Promise<IMsg> {
		console.log(`modifyInProcess checkout ${chk}:`, UserID);
		return await this.modifyInProcess(UserID, false);
	}
	private async modifyInProcess(UserID: number, InProcess: boolean) {
		const data: MIP = {
			UserID,
			InProcess: InProcess ? 1 : 0,
		};
		const ans = await this.jt.MultiUpdate([data]);
		const msg: IMsg = {
			ErrNo: ErrCode.NOT_DEFINED_ERR,
			ErrCon: "Modify InProcess Error",
		};
		if (ans) {
			msg.ErrCon = "";
			msg.ErrNo = ErrCode.PASS;
			// console.log("modifyInProcess", data);
		}
		return msg;
	}
}
