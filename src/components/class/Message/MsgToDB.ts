import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { IMsg } from "../../../DataSchema/if";
import { getConnection } from "../../../func/db";
import AMsgSaver from "./AMsgSaver";
import { SerChat, SerLobby } from "./MsgDbIf";

export default class MsgToDB extends AMsgSaver {
	private conn: PoolConnection | undefined;
	public UserConnected(uid: string): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			const jt = await this.getJT<SerLobby>("SerLobby");
			const data: SerLobby =  { ...this.resolveId(uid), cid: uid, isActive: 1 };
			const msg =  await jt.Insert(data);
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
	private getJT<T>(tablename: string): Promise<JTable<T>> {
		return new Promise<JTable<T>>(async (resolve) => {
			if (!this.conn) { this.conn = await getConnection("MsgToDB"); }
			resolve(new JTable<T>(this.conn as PoolConnection, tablename));
		});
	}
}
