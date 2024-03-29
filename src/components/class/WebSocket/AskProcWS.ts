import WebSocket, { ClientOptions, Data } from "ws";
import ATAFactor from "../../../components/ATAFactor";
import FuncKeyManager from "../../../components/FuncKeyManager";
import { ErrCode, FuncKey } from "../../../DataSchema/ENum";
import { WsMsg } from "../../../DataSchema/if";
import StrFunc from "../Functions/MyStr";
import AWebSocket from "./AWebSocket";

export default class AskProcWS extends AWebSocket {
	private ATAF = new ATAFactor();
	private dfChannel: string = "";
	private chkInfo = new Date().getTime();
	constructor(url: string, opt: ClientOptions, dfChanel: string) {
		super(url, opt);
		this.dfChannel = dfChanel;
		console.log("AskProcWS created:", this.chkInfo);
	}
	public OnOpen(ws: WebSocket) {
		console.log("connectd:", this.url);
		// console.log("status", this.ws.readyState, this.ws.OPEN);
		this.SendMessage("First Message");
		this.registerChannel(this.dfChannel);
	}
	public async OnMessage(data: Data) {
		try {
			// console.log("AskProcWS OnMessage:", data);
			const wsmsg: WsMsg = JSON.parse(data as string);
			if (wsmsg.Func) {
				// if (wsmsg.Func === FuncKey.SAVE_PRICETICK) { console.log("FuncKey.SAVE_PRICETICK", wsmsg.data); }
				new FuncKeyManager(wsmsg, this).doit();
				// console.log("after FuncKeyManager doit");
			}
			if (wsmsg.Ask) {
				// const ask: AskTable = JSON.parse(data as string);
				const ask = wsmsg.Ask;
				console.log("OnMessage Ask:", new Date().toLocaleString(), JSON.stringify(ask));
				const Askman = await this.ATAF.getATA(ask, wsmsg.SettleServiceID);
				const msg = await Askman.doit();
				console.log("After Askman doit:", new Date().toLocaleString(), JSON.stringify(msg));
				if (msg.ErrNo === ErrCode.PASS ) {
					const newWsmsg: WsMsg = { ...msg };
					delete newWsmsg.ErrNo;
					if ( this.ws && this.ws.readyState === WebSocket.OPEN ) {
						newWsmsg.chkey = new Date().toLocaleString();
						// console.log("Send msg to WS", JSON.stringify(newWsmsg));
						this.ws.send(StrFunc.stringify(newWsmsg));
					} else {
						const tmpcode = this.ws ? this.ws.readyState : WebSocket.CLOSED;
						console.log(`WS Server error, code:${tmpcode}, try build store mesage function later!`);
					}
				} else {
					console.log("web_SC on message:", StrFunc.stringify(msg));
				}
			}
			if (wsmsg.Message) {
				console.log("Message from server:", wsmsg.Message);
			}
		} catch (error) {
			console.log("message json parse error:", data);
			console.log(error);
		}
	}
	get Info() {
		return this.dfChannel;
	}
  private registerChannel(channel: string) {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      console.log("Register Channel to Server:", channel);
      const msg: WsMsg = {
        Func: FuncKey.SET_CHANNEL,
        ChannelName: channel,
      };
      // this.ws.send(`SetChannel:${channel}`);
      this.ws.send(StrFunc.stringify(msg));
    }
  }
}
