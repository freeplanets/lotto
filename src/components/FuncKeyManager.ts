import { Channels, FuncKey } from "../DataSchema/ENum";
import { WsMsg } from "../DataSchema/if";
import AOneFunction from "./class/DataBase/CryptoItem/AOneFunction";
import CodeDistinct from "./class/DataBase/CryptoItem/CodeDistinct";
import DelUndealedAsks from "./class/DataBase/CryptoItem/DelUndealedAsks";
import GetUnFinishedAsks from "./class/DataBase/CryptoItem/GetUnFinishedAsks";
import SavePriceTick from "./class/DataBase/CryptoItem/SavePriceTick";
// import StrFunc from "./class/Functions/MyStr";
import AWebSocket from "./class/WebSocket/AWebSocket";

export default class FuncKeyManager {
	private ws: AWebSocket;
	private item: AOneFunction | undefined;
	private returnfunc: FuncKey;
	constructor(wsg: WsMsg, ws: AWebSocket) {
		const funckey = wsg.Func ? wsg.Func : FuncKey.DO_NOTHING;
		this.ws = ws;
		// console.log("FuncKeyManager:", wsg);
		this.returnfunc = funckey;
		switch (funckey) {
			case FuncKey.GET_CRYPTOITEM_CODE_DISTINCT:
				// console.log("Create Item");
				this.item = new CodeDistinct();
				break;
			case FuncKey.GET_UNFINISHED_ASKS:
				console.log("get unfinished Asks", this.returnfunc, wsg);
				this.item = new GetUnFinishedAsks();
				break;
			case FuncKey.SAVE_PRICETICK:
				this.returnfunc = FuncKey.DO_NOTHING;
				this.item = new SavePriceTick(wsg.data);
				break;
			case FuncKey.DELETE_UNDEALED_ASKS:
				// console.log(wsg);
				this.item = new DelUndealedAsks(this.ws);
				break;
			default:
		}
	}
	public doit() {
		if (this.item) {
			// console.log("doit funckey:", this.returnfunc);
			const ans = this.item.execute();
			ans.then((res) => {
				// console.log("doit res", this.returnfunc, StrFunc.stringify(res));
				if (this.returnfunc !== FuncKey.DO_NOTHING) {
					// console.log("doit", res);
					if (res) {
						const wsg: WsMsg = {
							Func: this.returnfunc,
							ChannelName: Channels.SETTLE_SERVER,
							data: res,
						};
						// console.log("FuncKeyManager doit", StrFunc.stringify(wsg));
						try {
							// this.ws.send(StrFunc.stringify(wsg));
							this.ws.Send(wsg);
						} catch (err) {
							console.log("FuncKeyManager JSON stringify error:", err);
							console.log(wsg);
						}
					}
				}
			});
		} else {
			console.log("no item found", this.returnfunc);
		}
	}
}
