import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IDbAns, IMsg } from "../../../DataSchema/if";
import { getConnection } from "../../../func/db";
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
			const msg: IMsg = { ErrNo: ErrCode.PASS };
			let isChkIn = await this.modifyInProcess(UserID, true);
			console.log(`MemberInProcess checkIn ${chk} start:`, isChkIn);
			while (!isChkIn) {
				await MyDate.delay(200);
				isChkIn = await this.modifyInProcess(UserID, true);
				console.log(`MemberInProcess checkIn ${chk}:`, isChkIn);
			}
			// const msg = await this.modifyInProcess(UserID, true);
			resolve(msg);
		});
	}
	public async checkOut(UserID: number, chk = 0): Promise<IMsg> {
		console.log(`modifyInProcess checkout ${chk}:`, UserID);
		const msg: IMsg = { ErrNo: ErrCode.PASS };
		await this.modifyInProcess(UserID, false);
		return msg;
	}
	private async modifyInProcess(UserID: number, InProcess: boolean): Promise<boolean> {
		let ans = false;
		const data: MIP = {
			UserID,
			InProcess: InProcess ? 1 : 0,
		};
		const conn = await getConnection();
		if (conn) {
			const sql = `insert into MemberInProcess(UserID, InProcess) values(${data.UserID}, ${data.InProcess})
			on duplicate key update InProcess=values(InProcess)`;
			conn.query(sql).then((res: IDbAns) => {
				// console.log("modifyInProcess", res);
				// return true;
				if (res.insertId > 0) {
					ans = true;
				}
			}).catch((err) => {
				console.log("modifyInProcess", err);
			});
			await conn.release();
		}
		return ans;
		/*
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
		*/
	}
}
