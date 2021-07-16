import { PoolConnection } from "mariadb";
import sha256 from "sha256";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { IKeyVal, IMsg, MsgKey } from "../../../DataSchema/if";
import IfMsgkey from "../Interface/MsgKey";

export default class MessageKey implements IfMsgkey {
	private jt: JTable<MsgKey>;
	private service: boolean;
	private mkey: string;
	constructor(private key: string, conn: PoolConnection) {
		this.jt = new JTable(conn, "MessageKey");
		this.service = this.isServiceAcc();
		const shakey = `Key:${this.key}, CreateTime:${new Date().getTime()}`;
		this.mkey = sha256(shakey);
		// console.log("MessageKey constructor", shakey, this.mkey);
	}
	public async List(): Promise<IMsg> {
		const f: IKeyVal = {
			Key: "UserKey",
			Val: this.key,
		};
		if (this.isService) {
			f.Val2 = "";
		}
		return await this.jt.Lists(f);
	}
	public async Add(mkey?: string): Promise<IMsg> {
		const MKey: MsgKey = {
			id: 0,
			UserKey: this.key,
			MKey: mkey ? mkey : this.MKey,
		};
		return this.jt.Insert(MKey);
	}
	get isService() {
		return this.service;
	}
	public async isKeyExist(mkey: string) {
		let isExist = false;
		const filter: IKeyVal = {
			UserKey: this.key,
			MKey: mkey,
		};
		const ans = await this.jt.getOne(filter);
		if (ans) {
			this.mkey = ans.MKey;
			isExist = true;
		} else {
			const msg = await this.Add(mkey);
			if (msg.ErrNo === ErrCode.PASS) { isExist = true; }
		}
		return isExist;
	}
	public isServiceAcc(): boolean {
		let b = false;
		const c: string[] = this.key.split("@");
		if (c[1] === "service") { b = true; }
		return b;
	}
	get MKey() {
		return this.mkey;
	}
}
