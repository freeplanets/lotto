import WebSocket from "ws";
import { Channels, FuncKey } from "../DataSchema/ENum";
import { WsMsg } from "../DataSchema/if";
import AGet from "./class/DataBase/CryptoItem/AGet";
import CodeDistinct from "./class/DataBase/CryptoItem/CodeDistinct";
import GetUnFinishedAsks from "./class/DataBase/CryptoItem/GetUnFinishedAsks";

export default class FuncKeyManager {
	private ws: WebSocket;
	private item: AGet | undefined;
	private returnfunc: FuncKey;
	constructor(funcKey: FuncKey, ws: WebSocket) {
		this.ws = ws;
		// console.log("funcKey:", funcKey);
		this.returnfunc = funcKey;
		switch (funcKey) {
			case FuncKey.GET_CRYPTOITEM_CODE_DISTINCT:
				console.log("Create Item");
				this.item = new CodeDistinct();
				break;
			case FuncKey.GET_UNFINISHED_ASKS:
				this.item = new GetUnFinishedAsks();
			default:
		}
	}
	public doit() {
		if (this.item) {
			const ans = this.item.getItem();
			ans.then((res) => {
				if (res) {
					const wsg: WsMsg = {
						Func: this.returnfunc,
						ChannelName: Channels.SETTLE_SERVER,
						data: res,
					};
					// console.log("FuncKeyManager doit", JSON.stringify(wsg));
					this.ws.send(JSON.stringify(wsg));
				}
			});
		} else {
			console.log("no item found");
		}
	}
}
