import dotenv from "dotenv";
import { timeStamp } from "node:console";
import WebSocket, { ClientOptions } from "ws";

dotenv.config();
const wsSERVER = `ws://${process.env.WS_SERVER}`;
const wsOptions: ClientOptions = {
  // localAddress: 'localhost',
};

class WsClient {
  /*
  createConnection(){
    this.ws = new WebSocket(this.url, this.opts);
    this.ws.on("open", (data) => {
      console.log("WS connected:", data);
      console.log("status", this.ws.readyState, this.ws.OPEN);
      this.Send("First Message");
    });
    this.ws.on("message", (data) => {
      console.log("message from WS:", data);
    });
    this.ws.on("close", () => {
      console.log("connection close.");
    });
  }
  */
  get isConnected() {
    return this.ws.readyState === this.ws.OPEN;
  }
  private ws: WebSocket;
  private pingTimeout: any = 0;
  constructor(private url: string, private opts: ClientOptions) {
    // console.log('WsClient',url,opts)
    this.ws = this.createConnection();
  }
  public Reconnect() {
    this.ws = this.createConnection();
  }
  public Send(msg: string) {
    if (this.ws.readyState === this.ws.OPEN) {
      console.log("Send Mesage to Server:", msg);
      this.ws.send(msg);
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
    console.log("create connection!!");
    const ws = new WebSocket(this.url, this.opts);
    ws.on("open", (data) => {
      console.log("WS connected:", data);
      console.log("status", this.ws.readyState, this.ws.OPEN);
      this.Send("First Message");
      this.registerChannel("AskCreator");
    });
    ws.on("message", (data) => {
      console.log("message from WS:", data);
    });
    // ws.on("ping", this.heartbeat);
    // ws.on("pong", this.heartbeat);
    ws.on("close", () => {
      console.log("connection close.");
      const me = this;
      setTimeout(() => {
        console.log("do reconnect");
        me.Reconnect();
      }, 15000);
      /*
      setTimeout(() => {
        this.createConnection();
      }, 5000);
      console.log("ws close state:", this.ws.readyState);
      */
    });
    return ws;
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
      this.ws.send(`SetChannel:${channel}`);
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
