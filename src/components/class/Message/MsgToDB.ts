import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IMsg } from "../../../DataSchema/if";
import { doQuery, getConnection } from "../../../func/db";
import AMsgSaver from "./AMsgSaver";
import { SerLobby } from "./MsgDbIf";

export default class MsgToDB extends AMsgSaver {
	private conn: PoolConnection | undefined;
	public UserConnected(uid: string): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			// const jt = await this.getJT<SerLobby>("SerLobby");
			let msg: IMsg = { ErrNo: ErrCode.GET_CONNECTION_ERR};
			if (!this.conn) { this.conn = await getConnection("MsgToDB"); }
			if (this.conn) {
				const data: SerLobby =  { ...this.resolveId(uid), cid: uid, isActive: 1 };
				const sql = `insert into SerLobby(cid, hostname, identity, uid, isActive) values (
					'${data.cid}','${data.hostname}',${data.identity},'${data.uid}',${0 || data.isActive}
				) on duplicate key update isActive = values(isActive)`;
				console.log(sql);
				msg =  await doQuery(sql, this.conn);
			}
			resolve(msg);
		});
	}
	public UserClosed(uid: string): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			const jt = await this.getJT<SerLobby>("SerLobby");
			const msg = await jt.Updates({ isActive: 0 }, { cid: uid });
			resolve(msg);
		});
	}
	public UserList(hostname: string): Promise<IMsg> {
			return new Promise<IMsg>(async (resolve) => {
				const jt = await this.getJT<SerLobby>("SerLobby");
				const filter = {
					hostname,
					isActive: 1,
				};
				const msg = await jt.Lists(filter);
				resolve(msg);
			});
	}
	private getJT<T>(tablename: string): Promise<JTable<T>> {
		return new Promise<JTable<T>>(async (resolve) => {
			if (!this.conn) { this.conn = await getConnection("MsgToDB"); }
			resolve(new JTable<T>(this.conn as PoolConnection, tablename));
		});
	}
}
