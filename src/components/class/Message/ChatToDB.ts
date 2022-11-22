import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AnyObject, IHasID, IKeyVal, IMsg } from "../../../DataSchema/if";
import { getConnection } from "../../../func/db";
import DateF from "../Functions/MyDate";
import { GetPostFunction } from "../Interface/Functions";
import { SerChat, SerLobby } from "./MsgDbIf";
import { MsgTable } from "./MsgToDB";

export interface ChatPic {
	id: number;
	cont: any;
}
export interface SerSiteData extends IHasID {
	SiteName: string;
	NotifyUrl: string;
	IP: string;
}

export default class ChatToDB {
	private msg: IMsg = { ErrNo: ErrCode.DB_QUERY_ERROR };
	public UserList(hostname: string, identity?: any): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			const conn = await getConnection("ChatToDB UserList");
			if (conn) {
				const jt = new JTable<SerLobby>(conn, MsgTable.SerLobby);
				const filter: AnyObject = {
					hostname,
					// isActive: 1,
				};
				if (identity) { filter.identity = identity; }
				this.msg = await jt.Lists(filter);
				await conn.release();
			}
			resolve(this.msg);
		});
	}
	public GetMessage(uid: string, identity = 0, site = ""): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			const conn = await getConnection("ChatToDB GetMessage");
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
				const t = {
					Key: "ModifyTime",
					Val: DateF.toDbDateTimeString(DateF.dayDiffTS(5)),
					Cond: ">",
				};
				filter.push(t);
				console.log("GetMessage", identity, site, filter);
				this.msg = await jt.Lists(filter);
				if (identity && site) {
					const fMsgs: IKeyVal [] = [{
							receiver: site,
						}, t
					];
					const ans = await jt.Lists(fMsgs);
					// console.log("GetMessage:", this.msg.data, ans.data);
					if (ans.ErrNo === ErrCode.PASS) {
						const data: SerChat[] = this.msg.data ? this.msg.data as SerChat[] : [];
						if (ans.data && (ans.data as []).length > 0) {
							this.msg.data = data.concat((ans.data as SerChat[]));
						}
					}
				}
				await conn.release();
			}
			// console.log("GetMessage:", this.msg);
			resolve(this.msg);
		});
	}
	public GetSiteMessage(site: string, startDate: string, endDate: string) {
		return new Promise<IMsg>(async (resolve) => {
			const conn = await getConnection("ChatToDB GetSiteMessage");
			if (conn) {
				const jt = new JTable<SerChat>(conn, "SerChat");
				const filters: IKeyVal[] = [];
				filters.push({
					Key: "sender",
					Val: site,
					Cond: "like",
				});
				const dStart = DateF.toDbDateString(startDate);
				const dEnd = DateF.toDbDateString(endDate);
				filters.push(DateF.createDateFilter(`${dStart} ${dEnd}`, "CreateTime"));
				this.msg = await jt.Lists(filters);
				await conn.release();
			}
			resolve(this.msg);
		});
	}
	public GetImages(id: number): Promise<any> {
			return new Promise<IMsg>(async (resolve) => {
				const conn = await getConnection("ChatToDB GetImages");
				let img;
				if (conn) {
					const jt = new JTable<ChatPic>(conn, MsgTable.SerChatImg);
					img = await jt.getOne(id, "ctype, cont");
					await conn.release();
				}
				resolve(img);
			});
	}
	public Register(siteid: string, notify: string, ip: string): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			const conn = await getConnection("ChatToDB Register");
			if (conn) {
				const jt = new JTable<SerSiteData>(conn, MsgTable.SerSite);
				siteid = siteid.replace(/\W/g, "");
				const param = { SiteName: siteid};
				let ans: any = await jt.getOne(param, "id,SiteName");
				console.log("Register after getOne:", ans);
				let id = 0;
				if (ans) { id = ans.id; }
				const data: SerSiteData = {
					id,
					SiteName: siteid,
					NotifyUrl: notify,
					IP: ip,
				};
				ans = await jt.Insert(data);
				await conn.release();
				resolve(ans);
			} else {
				const msg: IMsg = {
					ErrNo: ErrCode.GET_CONNECTION_ERR,
					ErrCon: "GET_CONNECTION_ERR",
				};
				resolve(msg);
			}
		});
	}
	public CheckIn(siteid: string): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			const msg: IMsg = { ErrNo: ErrCode.GET_CONNECTION_ERR };
			const conn = await getConnection("ChatToDB CheckIn");
			if (conn) {
				const jt = new JTable<SerSiteData>(conn, MsgTable.SerSite);
				const filter: IKeyVal = {
					SiteName: siteid,
				};
				const ans = await jt.getOne(filter, "SiteName,NotifyUrl");
				if (ans) {
					msg.data = ans;
					msg.ErrNo = ErrCode.PASS;
				} else {
					msg.ErrNo = ErrCode.NO_DATA_FOUND;
					msg.ErrCon = "NO_DATA_FOUND";
				}
				resolve(msg);
			} else {
				msg.ErrCon = "GET_CONNECTION_ERR";
				resolve(msg);
			}
		});
	}
}
