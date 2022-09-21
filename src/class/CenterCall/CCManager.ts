import EventEmitter from "events";
import { PoolConnection } from "mariadb";
import StrFunc from "../../components/class/Functions/MyStr";
import { IMsg } from "../../DataSchema/if";
import { getConnection } from "../../func/db";
import CenterCall, { IFromCenter } from "./CenterCall";

export default class CCManager extends EventEmitter {
	get List() {
		return this.list;
	}
	public static getInstance() {
		if (!this.ccm) {
			console.log("CCM instance create!!");
			this.ccm = new CCManager();
			this.ccm.init();
		}
		return this.ccm;
	}
	private static ccm: CCManager;
	private list: IFromCenter[] = [];
	// private CC: CenterCall | undefined;
	private conn: PoolConnection | undefined;
	private inProcess = false;
	public init() {
		this.on("Add", async (param: IFromCenter) => {
			if (param.lottoid === "30") {
				this.list.push(param);
			} else {
				this.list.splice(0, 0, param);
			}
			// if (!this.inProcess) { await this.doProcess(); }
			this.emit("doProcess");
		});
		this.on("doProcess", async () => {
			if (!this.inProcess && this.list.length > 0) {
				this.inProcess = true;
				await this.doProcess();
			}
		});
	}
	public async Add(param: IFromCenter) {
		this.emit("Add", param);
	}
	private async doProcess() {
		let msg: IMsg = {};
		// console.log("do process start:", this.inProcess);
		if (!this.conn) {
			this.conn = await getConnection("CCManager");
		}
		const param = this.list.pop();
		if (param && this.conn) {
			if (param.op) {
				const CC = new CenterCall(param, this.conn);
				if (typeof(CC[param.op]) === "function") {
					console.log("do process:", param.lottoid, param.op, StrFunc.stringify(param));
					msg = await CC[param.op]();
				} else {
					msg.ErrNo = 9;
					msg.error = `op:${param.op} has no funcion ,${StrFunc.stringify(param)}`;
				}
				console.log("op done:", param.lottoid, param.op, this.list.length, StrFunc.stringify(msg));
			}
			this.inProcess = false;
			this.emit("doProcess");
		}
		// await this.conn?.release();
		// console.log("do process end:", this.inProcess);
	}
}

/*
const ccm1  = CCManager.getInstance();
ccm1.Add('aaa');
ccm1.Add('BBB');
const ccm2  = CCManager.getInstance();
ccm2.Add('CCC');
*/
