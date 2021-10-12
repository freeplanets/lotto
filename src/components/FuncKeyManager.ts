import WebSocket from "ws";
import { Channels, FuncKey } from "../DataSchema/ENum";
import { WsMsg } from "../DataSchema/if";
import AOneFunction from "./class/DataBase/CryptoItem/AOneFunction";
import CodeDistinct from "./class/DataBase/CryptoItem/CodeDistinct";
import GetUnFinishedAsks from "./class/DataBase/CryptoItem/GetUnFinishedAsks";
import SavePriceTick from "./class/DataBase/CryptoItem/SavePriceTick";

export default class FuncKeyManager {
	private ws: WebSocket;
	private item: AOneFunction | undefined;
	private returnfunc: FuncKey;
	constructor(wsg: WsMsg, ws: WebSocket) {
		const funckey = wsg.Func ? wsg.Func : FuncKey.DO_NOTHING;
		this.ws = ws;
		// console.log("funcKey:", funckey);
		this.returnfunc = funckey;
		switch (funckey) {
			case FuncKey.GET_CRYPTOITEM_CODE_DISTINCT:
				// console.log("Create Item");
				this.item = new CodeDistinct();
				break;
			case FuncKey.GET_UNFINISHED_ASKS:
				// console.log("get unfinished Asks", this.returnfunc);
				this.item = new GetUnFinishedAsks();
				break;
			case FuncKey.SAVE_PRICETICK:
				this.returnfunc = FuncKey.DO_NOTHING;
				this.item = new SavePriceTick(wsg.data);
				break;
			default:
		}
	}
	public doit() {
		if (this.item) {
			// console.log("doit funckey:", this.returnfunc);
			const ans = this.item.execute();
			ans.then((res) => {
				// console.log("doit res", this.returnfunc, JSON.stringify(res));
				if (this.returnfunc !== FuncKey.DO_NOTHING) {
					// console.log("doit", res);
					if (res) {
						const wsg: WsMsg = {
							Func: this.returnfunc,
							ChannelName: Channels.SETTLE_SERVER,
							data: res,
						};
						// console.log("FuncKeyManager doit", JSON.stringify(wsg));
						this.ws.send(JSON.stringify(wsg));
					}
				}
			});
		} else {
			console.log("no item found", this.returnfunc);
		}
	}
}
