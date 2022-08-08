import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IKeyVal, IMsg } from "../../../DataSchema/if";
import { doQuery, getConnection } from "../../../func/db";
import AMsgSaver from "./AMsgSaver";
import { SerChat, SerLobby } from "./MsgDbIf";

export enum MsgTable {
  SerChat = "SerChat",
  SerLobby = "SerLobby",
	SerChatImg = "SerChatPic",
	SerSite = "SerSite",
}

export default class MsgToDB extends AMsgSaver {
	private conn: PoolConnection | undefined;
	public UserConnected(uid: string): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			// const jt = await this.getJT<SerLobby>("SerLobby");
			let msg: IMsg = { ErrNo: ErrCode.GET_CONNECTION_ERR};
			if (!this.conn) { this.conn = await getConnection("MsgToDB"); }
			if (this.conn) {
				const data: SerLobby =  { ...this.resolveId(uid), cid: uid, isActive: 1 };
				const sql = `insert into ${MsgTable.SerLobby}(cid, hostname, identity, uid, isActive) values (
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
			const jt = await this.getJT<SerLobby>(MsgTable.SerLobby);
			const msg = await jt.Updates({ isActive: 0 }, { cid: uid });
			if (this.conn) { await this.conn.release(); }
			resolve(msg);
		});
	}
	private getJT<T>(tablename: string): Promise<JTable<T>> {
		return new Promise<JTable<T>>(async (resolve) => {
			if (!this.conn || !this.conn.isValid()) { this.conn = await getConnection("MsgToDB"); }
			resolve(new JTable<T>(this.conn as PoolConnection, tablename));
		});
	}
}
