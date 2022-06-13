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
			this.ccm.init();
		}
		return this.ccm;
	}
	private static ccm: CCManager;
	private list: IFromCenter[] = [];
	private CC: CenterCall | undefined;
	private conn: PoolConnection | undefined;
	private inProcess = false;
	public init() {
		this.on("Add", async (param) => {
			this.list.push(param);
			if (!this.inProcess) { await this.doProcess(); }
		});
	}
	public async Add(param: IFromCenter) {
		this.emit("Add", param);
	}
	private async doProcess() {
		let msg: IMsg = {};
		this.inProcess = true;
		console.log("do process start:", this.inProcess);
		if (!this.conn) {
			this.conn = await getConnection("CCManager");
		}
		const param = this.list.pop();
		if (param && this.conn) {
			if (!this.CC) { this.CC = new CenterCall(param, this.conn); }
			if (this.CC) {
				if (param.op) {
					if (typeof(this.CC[param.op]) === "function") {
						console.log("do process:", param.lottoid, param.op, JSON.stringify(param));
						msg = await this.CC[param.op]();
					} else {
						msg.ErrNo = 9;
						msg.error = `op:${param.op} has no funcion ,${JSON.stringify(param)}`;
					}
					console.log("op done:", param.lottoid, param.op, this.list.length, JSON.stringify(msg));
				}
			}
			await this.doProcess();
		}
		this.inProcess = false;
		await this.conn?.release();
		console.log("do process end:", this.inProcess);
	}
}

/*
const ccm1  = CCManager.getInstance();
ccm1.Add('aaa');
ccm1.Add('BBB');
const ccm2  = CCManager.getInstance();
ccm2.Add('CCC');
*/
