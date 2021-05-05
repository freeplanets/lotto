import dotenv from "dotenv";
import WebSocket, { ClientOptions } from "ws";

dotenv.config();
const wsSERVER = `ws://${process.env.WS_SERVER}`;
const wsOptions: ClientOptions = {
  // localAddress: 'localhost',
};

class WsClient {
  private ws: WebSocket;
  private pingTimeout: any = 0;
  constructor(private url: string, private opts: ClientOptions) {
    // console.log('WsClient',url,opts)
    this.ws = this.createConnection();
  }
  public createConnection() {
    console.log("create connection!!");
    const ws = new WebSocket(this.url, this.opts);
    ws.on("open", (data) => {
      console.log("WS connected:", data);
      console.log("status", this.ws.readyState, this.ws.OPEN);
      this.Send("First Message");
    });
    ws.on("message", (data) => {
      console.log("message from WS:", data);
    });
    ws.on("close", () => {
      console.log("connection close.");
      setTimeout(() => {
        this.createConnection();
      }, 5000);
      console.log("ws close state:", this.ws.readyState);
    });
    return ws;
  }
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
    if (!this.ws) {
      this.ws = this.createConnection();
    }
    return this.ws.readyState === this.ws.OPEN;
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
