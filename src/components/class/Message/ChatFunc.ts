import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AnyObject, IHasID, IKeyVal, IMsg } from "../../../DataSchema/if";
import DateF from "../Functions/MyDate";
import StrFunc from "../Functions/MyStr";
import { GetPostFunction } from "../Interface/Functions";
import { ChatPic, SerChat, SerClosedData, SerLobby, SerSiteData } from "./MsgDbIf";
import { MsgTable } from "./MsgToDB";

export default class ChatFunc {
	private defaultMsg: IMsg = {ErrNo: ErrCode.MISS_PARAMETER, ErrCon: "MISS_PARAMETER" };
	public UserList: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			// hostname: string, identity?: any
			let msg = { ...this.defaultMsg };
			if (param.site) {
				const identity = param.identity ? parseInt(String(param.identity), 10) : 0;
				const site = param.site.replace(/\W/g, "");
				const jt = new JTable<SerLobby>(conn, MsgTable.SerLobby);
				const filter: AnyObject = {
					hostname: site,
					// isActive: 1,
				};
				if (identity) { filter.identity = identity; }
				msg = await jt.Lists(filter);
				await conn.release();
			}
			resolve(msg);
		});
	}
	public GetMessage: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			// uid: string, identity = 0, site = ""
			let msg = { ...this.defaultMsg };
			if (param.uid) {
				const identity = param.identity ? parseInt(String(param.identity), 10) : 0;
				const site = param.site;
				const jt = new JTable<SerChat>(conn, MsgTable.SerChat);
				const filter: IKeyVal[] = [];
				filter.push({
					Key: "sender",
					Val: param.uid,
					Key2: "receiver",
					Val2: param.uid,
					CondOr: "or",
				});
				filter.push({isDeled: 0});
				const t = {
					Key: "ModifyTime",
					Val: DateF.toDbDateTimeString(DateF.dayDiffTS(5)),
					Cond: ">",
				};
				filter.push(t);
				console.log("GetMessage", identity, site, filter);
				msg = await jt.Lists(filter);
				if (identity && site) {
					const fMsgs: IKeyVal [] = [{
							receiver: site,
							isDeled: 0,
						}, t
					];
					const ans = await jt.Lists(fMsgs);
					// console.log("GetMessage:", this.msg.data, ans.data);
					if (ans.ErrNo === ErrCode.PASS) {
						// const data: SerChat[] = this.msg.data ? this.msg.data as SerChat[] : [];
						msg.data = this.ArrConcat(msg.data, ans.data);
						/*
						if (ans.data && (ans.data as []).length > 0) {
							// console.log("GetMessage:", data, this.msg.data);
							this.msg.data = data.concat((ans.data as SerChat[]));
						}
						*/
					}
				}
				await conn.release();
			}
			// console.log("GetMessage:", this.msg);
			resolve(msg);
		});
	}
	public GetSiteMessage: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			const site = param.site.replace(/\W/g, "");
			const startDate = param.startDate;
			const endDate = param.endDate;
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
			let msg = { ...this.defaultMsg };
			msg = await jt.Lists(filters);
			await conn.release();
			resolve(msg);
		});
	}
	public GetImages: GetPostFunction = (param: any, conn: PoolConnection) => {
			return new Promise<any>(async (resolve) => {
				// console.log("GetImages:", param);
				const msg = { ...this.defaultMsg };
				if (param.imgId) {
					let img: any;
					const id = parseInt(String(param.imgId), 10);
					const jt = new JTable<ChatPic>(conn, MsgTable.SerChatImg);
					img = await jt.getOne(id, "ctype, cont");
					try {
						// console.log("Image", img);
						if (img) {
							const b64 = Buffer.from(img.cont).toString("base64");
							const data = `data:${img.ctype};base64,${b64}`;
							msg.data = { img: data };
						}
					} catch (err) {
						console.log("Image", err);
					}
					await conn.release();
				}
				resolve(msg);
			});
	}
	public Register: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			// let siteid: string = param.siteid.replace(/\W/g, "");
			// const notify: string = param.nodify;
			// const ip: string = param.remoteIP;
			let msg = { ...this.defaultMsg };
			const { siteid, notify, tkey, remoteIP } = param;
			console.log("Register param:", siteid, notify, tkey, remoteIP, param);
			if (siteid && notify && tkey && remoteIP) {
				const jt = new JTable<SerSiteData>(conn, MsgTable.SerSite);
				const site = siteid.replace(/\W/g, "");
				const params = { SiteName: siteid};
				const ans: any = await jt.getOne(params, "id,SiteName");
				console.log("Register after getOne:", ans);
				let id = 0;
				if (ans) { id = ans.id; }
				const data: SerSiteData = {
					id,
					SiteName: site,
					NotifyUrl: notify,
					tkey,
					IP: remoteIP,
				};
				if (id) {
					msg = await jt.Update(data);
				} else {
					msg = await jt.Insert(data);
				}
				await conn.release();
				resolve(msg);
			} else {
				resolve(msg);
			}
		});
	}
	public CheckIn: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			const msg = { ...this.defaultMsg };
			const siteid = param ? param.siteid || param.site : "";
			console.log("checkin param:", siteid);
			if ( siteid ) {
				const jt = new JTable<SerSiteData>(conn, MsgTable.SerSite);
				const filter: IKeyVal = {
					SiteName: siteid.replace(/\W/g, ""),
				};
				const ans = await jt.getOne(filter, "SiteName,NotifyUrl,tkey");
				console.log("checkin ans:", ans);
				if (ans) {
					msg.data = ans;
					msg.ErrNo = ErrCode.PASS;
					msg.ErrCon = "PASS";
				} else {
					msg.ErrNo = ErrCode.NO_DATA_FOUND;
					msg.ErrCon = "NO_DATA_FOUND";
				}
			}
			console.log("checkin msg", msg);
			resolve(msg);
		});
	}
	public SwitchMessageTo: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			let msg = { ...this.defaultMsg };
			if (param.id && param.cid) {
				const id = this.toNumber(param.id);
				const cid = param.cid;
				const updates = {
					receiver: cid,
					cid,
				};
				const filter = { id };
				const jt = new JTable<SerChat>(conn, MsgTable.SerChat);
				msg = await jt.Updates(updates, filter);
			}
			resolve(msg);
		});
	}
	public DelMessages: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			let msg = { ...this.defaultMsg };
			if (param.id && param.cid) {
				let id: number;
				id = this.toNumber(param.id);
				const updates = {
					isDeled: 1,
					cid: param.cid,
				};
				const filter = { id };
				const jt = new JTable<SerChat>(conn, MsgTable.SerChat);
				msg = await jt.Updates(updates, filter);
			}
			resolve(msg);
		});
	}
	public Update: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			const { tableName, data } = param;
			let msg = { ...this.defaultMsg };
			if (tableName && Array.isArray(data)) {
				const jt = new JTable<IHasID>(conn, tableName);
				msg = jt.MultiUpdate(data);
			}
			resolve(msg);
		});
	}
	public CloseMsg: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			const data = param as SerClosedData;
			let msg = { ...this.defaultMsg };
			// if (data.MemberCid && data.ServeCid && data.cont && data.title) {
			if (data.MemberCid && data.ServeCid && data.cont) {
				if (Array.isArray(data.cont)) {
					const msgids = data.cont.map((itm) => {
						return { id: itm.id, isDeled: 1 };
					});
					if (msgids.length > 0) {
						const uparam = {
							tableName: MsgTable.SerChat,
							data: msgids,
						};
						msg = await this.Update(uparam, conn);
						// console.log("closeMsg update check:", StrFunc.stringify(uparam), msg);
					}
					data.cont = StrFunc.stringify(data.cont);
				}
				if (msg.affectedRows > 0) {
					const jt = new JTable<SerClosedData>(conn, MsgTable.SerClosed);
					msg = await jt.Insert(data);
					// console.log("CloseMsg:", msg);
				}
			}
			resolve(msg);
		});
	}
	public GetClosedMsg: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			const site = param.site.replace(/\W/g, "");
			const startDate = param.startDate;
			const endDate = param.endDate;
			const match = param.match;
			const jt = new JTable<SerClosedData>(conn, MsgTable.SerClosed);
			const filters: IKeyVal[] = [];
			filters.push({
				Key: "MemberCid",
				Val: site,
				Cond: "like",
			});
			if (startDate) {
				const dStart = DateF.toDbDateString(startDate);
				const dEnd = endDate ? DateF.toDbDateString(endDate) : dStart;
				filters.push(DateF.createDateFilter(`${dStart} ${dEnd}`, "CreateTime"));
			}
			if (match) {
				filters.push({
					Key: "cont",
					Val: match,
					Cond: "match",
				});
			}
			let msg = { ...this.defaultMsg };
			msg = await jt.Lists(filters);
			console.log("GetClosedMsg", msg, filters);
			// await conn.release();
			resolve(msg);
		});
	}
	public ChatHistory: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			let msg = { ...this.defaultMsg };
			if (param.cid) {
				const filter = { MemberCid: param.cid };
				const jt = new JTable<SerChat>(conn, MsgTable.SerClosed);
				msg = await jt.Lists(filter);
			}
			resolve(msg);
		});
	}
	private toNumber(v: any): number {
		if (typeof(v) === "number") {
			return v;
		}
		return parseInt(String(v), 10);
	}
	private ArrConcat(arr1: any, arr2: any) {
		if (Array.isArray(arr1) && Array.isArray(arr2)) {
			return arr1.concat(arr2);
		} else {
			console.log("arr1=>", arr1, "arr2=>", arr2);
			if (Array.isArray(arr1)) { return arr1; }
			if (Array.isArray(arr2)) { return arr2; }
			return [];
		}
	}
}
