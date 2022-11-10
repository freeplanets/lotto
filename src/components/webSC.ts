import dotenv from "dotenv";
import { ClientOptions } from "ws";
// import WebSocket, { ClientOptions } from "ws";
// import { Channels, ErrCode, FuncKey } from "../DataSchema/ENum";
import { Channels } from "../DataSchema/ENum";
// import { WsMsg } from "../DataSchema/if";
// import ATAFactor from "./ATAFactor";
// import FuncKeyManager from "./FuncKeyManager";
import AskProcWS from "./class/WebSocket/AskProcWS";
// import ChatWS from "./class/WebSocket/ChatWS";
// import StrFunc from "./class/Functions/MyStr";

dotenv.config();

// const ATAF = new ATAFactor();
const wsHost =  process.env.WS_SERVER === "localhost:4001" ? `ws://${process.env.WS_SERVER}` : `wss://${process.env.WS_SERVER}`;
// const chatHost = process.env.WS_CHATSERVER === "localhost:4002" ? `ws://${process.env.WS_CHATSERVER}` : `wss://${process.env.WS_CHATSERVER}`;

// const sitename = process.env.SITE_NAME ? process.env.SITE_NAME : "Crypto";
const wsOptions: ClientOptions = {
  // localAddress: 'localhost',
};
const ChannelName = Channels.API_SERVER;
// const ChatSERVER = `${chatHost}/${sitename}/${ChannelName}/apiZero`;
const wsSERVER = `${wsHost}`;
// const chatClient = new ChatWS(ChatSERVER, wsOptions);
// const wsclient = new AskProcWS(wsSERVER, wsOptions, ChannelName);
export class WebSC {
  public static getSock(): AskProcWS {
    if (!this.sock) {
      this.sock = new AskProcWS(wsSERVER, wsOptions, ChannelName);
    }
    return this.sock;
  }
  private static sock: AskProcWS | null = null;
}
// export { chatClient };
// export default wsclient;
/*
export class WsClient {
  get isConnected() {
    if (!this.ws) { return false; }
    return this.ws.readyState === this.ws.OPEN;
  }
  private ws!: WebSocket;
  private pingTimeout: any = 0;
  constructor(private url: string, private opts: ClientOptions) {
    // console.log('WsClient',url,opts)
    // this.ws = this.createConnection();
    this.createConnection();
  }
  public SendMessage(msg: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      // console.log("Send Mesage to Server:", msg);
      const wsmsg: WsMsg = {
        Message: msg,
      };
      this.ws.send(StrFunc.stringify(wsmsg));
    }
  }
  public Send(msg: WsMsg) {
    // console.log("before Send Mesage:", msg);
    if (!this.isConnected) { return; }
    // console.log("Send Mesage:", msg);
    // this.ws.send(msg);
    try {
      this.ws.send(StrFunc.stringify(msg));
    } catch (err) {
      console.log("WsClient Send error:", err);
    }
  }
  public Close() {
      if (this.ws.readyState !== this.ws.OPEN) {
        console.log("wait Server connected.....", this.ws.readyState, this.ws.OPEN);
      } else {
        console.log("disconnect....");
        this.ws.close();
        console.log("done");
      }
  }
  private createConnection() {
    console.log("create connection!!", wsSERVER);
    this.ws = new WebSocket(this.url, this.opts);
    this.ws.on("error", (data) => {
      console.log("createConnection error:", data.message);
    });
    this.ws.on("disconnect", (data) => {
      console.log("disconnect:", data);
    });
    this.ws.on("open", (data) => {
      console.log("WS connected:", data);
      console.log("status", this.ws.readyState, this.ws.OPEN);
      this.SendMessage("First Message");
      this.registerChannel(ChannelName);
    });
    this.ws.on("message", async (data) => {
      // console.log("message from WS:", data);
      try {
        const wsmsg: WsMsg = JSON.parse(data as string);
        if (wsmsg.Func) {
          new FuncKeyManager(wsmsg, this.ws).doit();
          // console.log("after FuncKeyManager doit");
        }
        if (wsmsg.Ask) {
          // const ask: AskTable = JSON.parse(data as string);
          const ask = wsmsg.Ask;
          const Askman = await ATAF.getATA(ask, wsmsg.SettleServiceID);
          const msg = await Askman.doit();
          // console.log("after doit:", StrFunc.stringify(msg));
          if (msg.ErrNo === ErrCode.PASS ) {
            const newWsmsg: WsMsg = { ...msg };
            delete newWsmsg.ErrNo;
            // console.log("before send", StrFunc.stringify(newWsmsg));
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
      }
    });
    // ws.on("ping", this.heartbeat);
    // ws.on("pong", this.heartbeat);
    this.ws.on("close", () => {
      console.log("connection close.");
      const me = this;
      setTimeout(() => {
        console.log("do reconnect");
        me.createConnection();
      }, 5000);
    });
  }
  private heartbeat() {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      this.ws.terminate();
    }, 30000 + 1000);
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
const wsclient = new WsClient(wsSERVER, wsOptions);
export default wsclient;
*/
/*
setTimeout(()=>{
  wsclient.Close();
},1000);
*/
// wsclient.Close();
/*
function test(){
  const options:ClientOptions = {
    // localAddress: 'localhost',
  }
  try{
    const ws = new WebSocket('ws://localhost:3001',options);
    ws.on('open',(data)=>{
      console.log('open',data);
      ws.send('test');
    });
  } catch(err){
    console.log('ws error',err);
  }
}
test();
*/
