import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IKeyVal, IMsg } from "../../../DataSchema/if";
import { getConnection } from "../../../func/db";
import DateF from "../Functions/MyDate";
import { SerChat, SerLobby } from "./MsgDbIf";
import { MsgTable } from "./MsgToDB";

export interface ChatPic {
	id: number;
	cont: any;
}
export default class ChatToDB {
	private msg: IMsg = { ErrNo: ErrCode.DB_QUERY_ERROR };
	public UserList(hostname: string): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			const conn = await getConnection();
			if (conn) {
				const jt = new JTable<SerLobby>(conn, MsgTable.SerLobby);
				const filter = {
					hostname,
					isActive: 1,
				};
				this.msg = await jt.Lists(filter);
				await conn.release();
			}
			resolve(this.msg);
		});
}
public GetMessage(uid: string): Promise<IMsg> {
	return new Promise<IMsg>(async (resolve) => {
		const conn = await getConnection();
		if (conn) {
			const jt = new JTable<SerChat>(conn, MsgTable.SerChat);
			const filter: IKeyVal[] = [];
			filter.push({
				Key: "sender",
				Val: uid,
				Key2: "receiver",
				Val2: uid,
				CondOr: "or",
			});
			filter.push({
				Key: "ModifyTime",
				Val: DateF.toDbDateTimeString(DateF.dayDiffTS(1)),
				Cond: ">",
			});
			this.msg = await jt.Lists(filter);
			await conn.release();
		}
		resolve(this.msg);
	});
}
public GetImages(id: number): Promise<any> {
		return new Promise<IMsg>(async (resolve) => {
			const conn = await getConnection();
			let img;
			if (conn) {
				const jt = new JTable<ChatPic>(conn, MsgTable.SerChatImg);
				img = await jt.getOne(id, "ctype, cont");
				await conn.release();
			}
			resolve(img);
		});
	}
}
