import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { ChatMsg, IHasID, IMsg, MsgCont, NameAndText } from "../../../DataSchema/if";
import StrFunc from "../Functions/MyStr";
import AMessage from "./AMessage";
import MessageKey from "./MessageKey";

export default class Message extends AMessage {
	get MKey() {
		return this.mkey;
	}
	private jt: JTable<IHasID>;
	private UserKey: string;
	// private ReceiverID: string;
	private cont: string;
	private MK: MessageKey;
	private mkey?: string;
	constructor(SMsg: ChatMsg, conn: PoolConnection) {
		super();
		this.UserKey = this.StringID(SMsg.UpID, SMsg.SenderID);
		// this.ReceiverID = this.StringID(SMsg.UpID, SMsg.ReceiverID);
		const nameText: NameAndText = {
			name: SMsg.name,
			text: SMsg.text,
		};
		if (SMsg.MKey) { this.mkey = SMsg.MKey; }
		this.cont = StrFunc.stringify(nameText);
		// this.MKey = MKey ? MKey : this.sha256;
		this.MK = new MessageKey(this.UserKey, conn);
		this.jt = new JTable(conn, "Messages");
	}
	public async Get(): Promise<IMsg> {
		const msg: IMsg = { ErrNo: ErrCode.PASS };
		if (this.MKey) {
			const ans = await this.jt.Lists({Key: "MKey", Val: this.MKey });
			if ( ans ) {
				msg.data = ans;
			} else {
				msg.ErrNo = ErrCode.DB_QUERY_ERROR;
				msg.ErrCon = "Get MsgKey error!!";
			}
		} else {
			msg.data = [];
		}
		return msg;
	}
	public async Add(): Promise<IMsg> {
		let msg: IMsg = {};
		if (!this.mkey) {
			this.mkey = await this.getMKey();
		}
		if (this.mkey) {
			const isMKeyExist = await this.MK.isKeyExist(this.mkey);
			if (isMKeyExist) {
				const msgC: MsgCont = {
					id: 0,
					MsgCont: this.cont,
					MKey: this.mkey,
				};
				msg = await this.jt.Insert(msgC);
			} else {
				msg.ErrNo = ErrCode.DB_QUERY_ERROR;
				msg.ErrCon = "MKey check exist error!!";
			}
		} else {
			msg.ErrNo = ErrCode.DB_QUERY_ERROR;
			msg.ErrCon = "MKey create error!!";
		}
		return msg;
	}
	public StringID(upid?: number, id?: number): string {
		if (!id) { return ""; }
		const key = upid ? "member" : "service";
		return `${id}@${key}`;
	}
	public SwitchSender(v: MsgCont) {
		const newV = Object.assign({}, v);
		newV.ReceiverID = v.SenderID;
		newV.SenderID = v.ReceiverID;
		return newV;
	}
	private async getMKey(): Promise<string | undefined> {
		let mkey: string|undefined;
		const msg = await this.MK.Add();
		if (msg.ErrNo === ErrCode.PASS) { mkey = this.MK.MKey; }
		return mkey;
	}
}
