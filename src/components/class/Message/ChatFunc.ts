import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AnyObject, IHasID, IKeyVal, IMsg } from "../../../DataSchema/if";
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

export default class ChatFunc {
	private msg: IMsg = {ErrNo: ErrCode.MISS_PARAMETER, ErrCon: "MISS_PARAMETER" };
	public UserList: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			// hostname: string, identity?: any
			if (param.site) {
				const identity = param.identity ? parseInt(String(param.identity), 10) : 0;
				const site = param.site.replace(/\W/g, "");
				const jt = new JTable<SerLobby>(conn, MsgTable.SerLobby);
				const filter: AnyObject = {
					hostname: site,
					// isActive: 1,
				};
				if (identity) { filter.identity = identity; }
				this.msg = await jt.Lists(filter);
				await conn.release();
			}
			resolve(this.msg);
		});
	}
	public GetMessage: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			// uid: string, identity = 0, site = ""
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
				this.msg = await jt.Lists(filter);
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
						this.msg.data = this.ArrConcat(this.msg.data, ans.data);
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
			resolve(this.msg);
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
			filters.push(DateF.createDateFilter(`${dStart}-${dEnd}`, "CreateTime"));
			this.msg = await jt.Lists(filters);
			await conn.release();
			resolve(this.msg);
		});
	}
	public GetImages: GetPostFunction = (param: any, conn: PoolConnection) => {
			return new Promise<any>(async (resolve) => {
				// console.log("GetImages:", param);
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
							this.msg.data = { img: data };
						}
					} catch (err) {
						console.log("Image", err);
					}
					await conn.release();
				}
				resolve(this.msg);
			});
	}
	public Register: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			let siteid: string = param.siteid.replace(/\W/g, "");
			const notify: string = param.nodify;
			const ip: string = param.remoteIP;
			if (siteid && notify && ip) {
				const jt = new JTable<SerSiteData>(conn, MsgTable.SerSite);
				siteid = siteid.replace(/\W/g, "");
				const params = { SiteName: siteid};
				const ans: any = await jt.getOne(params, "id,SiteName");
				console.log("Register after getOne:", ans);
				let id = 0;
				if (ans) { id = ans.id; }
				const data: SerSiteData = {
					id,
					SiteName: siteid,
					NotifyUrl: notify,
					IP: ip,
				};
				this.msg = await jt.Insert(data);
				await conn.release();
				resolve(this.msg);
			} else {
				resolve(this.msg);
			}
		});
	}
	public CheckIn: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			if (param.siteid) {
				const jt = new JTable<SerSiteData>(conn, MsgTable.SerSite);
				const filter: IKeyVal = {
					SiteName: param.siteid.replace(/\W/g, ""),
				};
				const ans = await jt.getOne(filter, "SiteName,NotifyUrl");
				if (ans) {
					this.msg.data = ans;
					this.msg.ErrNo = ErrCode.PASS;
					this.msg.ErrCon = "PASS";
				} else {
					this.msg.ErrNo = ErrCode.NO_DATA_FOUND;
					this.msg.ErrCon = "NO_DATA_FOUND";
				}
			}
			resolve(this.msg);
		});
	}
	public SwitchMessageTo: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			if (param.id && param.cid) {
				const id = this.toNumber(param.id);
				const cid = param.cid;
				const updates = {
					receiver: cid,
					cid,
				};
				const filter = { id };
				const jt = new JTable<SerChat>(conn, MsgTable.SerChat);
				this.msg = await jt.Updates(updates, filter);
			}
			resolve(this.msg);
		});
	}
	public DelMessages: GetPostFunction = (param: any, conn: PoolConnection) => {
		return new Promise<IMsg>(async (resolve) => {
			if (param.id && param.cid) {
				let id: number;
				id = this.toNumber(param.id);
				const updates = {
					isDeled: 1,
					cid: param.cid,
				};
				const filter = { id };
				const jt = new JTable<SerChat>(conn, MsgTable.SerChat);
				this.msg = await jt.Updates(updates, filter);
			}
			resolve(this.msg);
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
