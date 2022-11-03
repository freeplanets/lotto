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
	constructor(url: string, opt: ClientOptions, dfChanel: string) {
		super(url, opt);
		this.dfChannel = dfChanel;
	}
	public OnOpen(ws: WebSocket) {
		console.log("connectd:", this.url);
		// console.log("status", this.ws.readyState, this.ws.OPEN);
		this.SendMessage("First Message");
		this.registerChannel(this.dfChannel);
	}
	public async OnMessage(data: Data) {
		try {
			const wsmsg: WsMsg = JSON.parse(data as string);
			if (wsmsg.Func) {
				new FuncKeyManager(wsmsg, this).doit();
				// console.log("after FuncKeyManager doit");
			}
			if (wsmsg.Ask) {
				// const ask: AskTable = JSON.parse(data as string);
				const ask = wsmsg.Ask;
				const Askman = await this.ATAF.getATA(ask, wsmsg.SettleServiceID);
				const msg = await Askman.doit();
				if (msg.ErrNo === ErrCode.PASS ) {
					const newWsmsg: WsMsg = { ...msg };
					delete newWsmsg.ErrNo;
					if ( this.ws.readyState === WebSocket.OPEN ) {
						// console.log("Send msg to WS");
						this.ws.send(StrFunc.stringify(newWsmsg));
					} else {
						console.log(`WS Server error, code:${this.ws.readyState}, try build store mesage function later!`);
					}
				} else {
					console.log("webSC on message:", StrFunc.stringify(msg));
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
  private registerChannel(channel: string) {
    if (this.ws.readyState === this.ws.OPEN) {
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
