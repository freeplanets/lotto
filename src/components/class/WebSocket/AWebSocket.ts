import WebSocket, { ClientOptions, Data } from "ws";
import { WsMsg } from "../../../DataSchema/if";

export default abstract class AWebSocket {
  get isConnected() {
    if (!this.ws) { return false; }
    return this.ws.readyState === this.ws.OPEN;
  }
  protected ws!: WebSocket;
  constructor(protected url: string, private opts: ClientOptions) {
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
  public Send(msg: WsMsg) {
    // console.log("before Send Mesage:", msg);
    if (!this.isConnected) { return; }
    // console.log("Send Mesage:", msg);
    // this.ws.send(msg);
    try {
      this.ws.send(JSON.stringify(msg));
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
	public abstract OnMessage(data: string): void;
	public abstract OnOpen(ws: WebSocket): void;
  private createConnection() {
    console.log("connect to:", this.url);
    this.ws = new WebSocket(this.url, this.opts);
    // code: 'ETIMEDOUT',
    // syscall: 'read',
    this.ws.on("timeout", (chk: any, error: any) => {
      if (error) {
        console.log("timeout err:", error);
      }
    });
    this.ws.on("streamread", (chk: any, error: any) => {
      if (error) {
        console.log("steamread err:", error);
      }
    });
    /*
    this.ws.on("read", (chk: any, error: any) => {
      if (error) {
        console.log("read err:", error);
      }
    });
    */
    this.ws.on("error", (err) => {
      console.log("createConnection error:", err);
    });
    this.ws.on("disconnect", (data) => {
      console.log("disconnect:", data);
    });
    this.ws.on("open", (ws: WebSocket) => {
      this.OnOpen(ws);
		});
    this.ws.on("message", (data: Data) => {
			this.OnMessage(data.toString());
		});
    this.ws.on("close", () => {
      console.log("connection close.");
      const me = this;
      setTimeout(() => {
        console.log("do reconnect");
        me.createConnection();
      }, 5000);
    });
  }
}
