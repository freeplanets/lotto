import dotenv from "dotenv";
import WebSocket, { ClientOptions } from "ws";
import { Channels, ErrCode, FuncKey } from "../DataSchema/ENum";
import { WsMsg } from "../DataSchema/if";
import ATAFactor from "./ATAFactor";
import FuncKeyManager from "./FuncKeyManager";

dotenv.config();

const ATAF = new ATAFactor();

const wsSERVER =  process.env.WS_SERVER === "localhost:4001" ? `ws://${process.env.WS_SERVER}` : `wss://${process.env.WS_SERVER}`;
const wsOptions: ClientOptions = {
  // localAddress: 'localhost',
};
const ChannelName = Channels.API_SERVER;

class WsClient {
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
      this.ws.send(JSON.stringify(wsmsg));
    }
  }
  public Send(msg: string) {
    // console.log("before Send Mesage:", msg);
    if (!this.isConnected) { return; }
    console.log("Send Mesage:", msg);
    // this.ws.send(msg);
    try {
      this.ws.send(msg);
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
      console.log("error:", data);
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
          new FuncKeyManager(wsmsg.Func, this.ws).doit();
          console.log("after FuncKeyManager doit");
        }
        if (wsmsg.Ask) {
          // const ask: AskTable = JSON.parse(data as string);
          const ask = wsmsg.Ask;
          const Askman = await ATAF.getATA(ask);
          const msg = await Askman.doit();
          // console.log("after doit:", JSON.stringify(msg));
          if (msg.ErrNo === ErrCode.PASS ) {
            const newWsmsg: WsMsg = Object.assign({}, msg);
            delete newWsmsg.ErrNo;
            // console.log("before send", JSON.stringify(newWsmsg));
            if ( this.ws.readyState === WebSocket.OPEN ) {
              // console.log("Send msg to WS");
              this.ws.send(JSON.stringify(newWsmsg));
            } else {
              console.log(`WS Server error, code:${this.ws.readyState}, try build store mesage function later!`);
            }
          } else {
            console.log(JSON.stringify(msg));
          }
        }
        if (wsmsg.Message) {
          console.log("Message from server:", wsmsg.Message);
        }
      } catch (error) {
        console.log("message json parse error:", data, error);
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
      }, 15000);
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
      this.ws.send(JSON.stringify(msg));
    }
  }
}
const wsclient = new WsClient(wsSERVER, wsOptions);
export default wsclient;
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
