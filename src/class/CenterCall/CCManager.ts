import EventEmitter from "events";
import { PoolConnection } from "mariadb";
import { IMsg } from "../../DataSchema/if";
import { getConnection } from "../../func/db";
import CenterCall, { IFromCenter } from "./CenterCall";

export default class CCManager extends EventEmitter {
	get List() {
		return this.list;
	}
	public static getInstance() {
		if (!this.ccm) {
			this.ccm = new CCManager();
		}
		return this.ccm;
	}
	private static ccm: CCManager;
	private list: IFromCenter[] = [];
	private CC: CenterCall | undefined;
	private conn: PoolConnection | undefined;
	private inProcess = false;
	constructor() {
		super();
		this.on("Add", (data) => {
			this.list.push(data);
			if (!this.inProcess) { this.doProcess(); }
		});
	}
	public Add(param: IFromCenter) {
		this.emit("Add", param);
	}
	private async doProcess() {
		let msg: IMsg = {};
		this.inProcess = true;
		if (!this.conn) {
			this.conn = await getConnection("CCManager");
		}
		const param = this.list.pop();
		if (param && this.conn) {
			if (!this.CC) { this.CC = new CenterCall(param, this.conn); }
			if (this.CC) {
				if (param.op) {
					if (typeof(this.CC[param.op]) === "function") {
						msg = await this.CC[param.op]();
					} else {
						msg.ErrNo = 9;
						msg.error = `op:${param.op} has no funcion ,${JSON.stringify(param)}`;
					}
					console.log("op done", param.lottoid, this.list.length, JSON.stringify(param), JSON.stringify(msg));
				}
			}
			await this.doProcess();
		}
		this.inProcess = false;
		await this.conn?.release();
	}
}

/*
const ccm1  = CCManager.getInstance();
ccm1.Add('aaa');
ccm1.Add('BBB');
const ccm2  = CCManager.getInstance();
ccm2.Add('CCC');
*/
