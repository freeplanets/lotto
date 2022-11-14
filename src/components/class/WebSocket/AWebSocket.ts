import WebSocket, { ClientOptions, Data } from "ws";
import { WsMsg } from "../../../DataSchema/if";
import StrFunc from "../Functions/MyStr";

export default abstract class AWebSocket {
  get isConnected() {
    if (!this.ws) { return false; }
    return this.ws.readyState === this.ws.OPEN;
  }
  private static inCreateProc = false;
  protected ws: WebSocket | null = null;
  constructor(protected url: string, private opts: ClientOptions) {
    this.createConnection();
  }
  public SendMessage(msg: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
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
      if (this.ws) {
        this.ws.send(StrFunc.stringify(msg));
      }
    } catch (err) {
      console.log("WsClient Send error:", err);
    }
  }
  public Close() {
      if (this.ws && this.ws.readyState !== this.ws.OPEN) {
        console.log("wait Server connected.....", this.ws.readyState, this.ws.OPEN);
      } else {
        console.log("disconnect....");
        if (this.ws) { this.ws.close(); }
        console.log("done");
      }
  }
	public abstract OnMessage(data: string): void;
	public abstract OnOpen(ws: WebSocket): void;
  private createConnection() {
    if (AWebSocket.inCreateProc) { return; }
    const me = this;
    AWebSocket.inCreateProc = true;
    console.log("connect to:", this.url);
    this.ws = new WebSocket(this.url, this.opts);
    // code: 'ETIMEDOUT',
    // syscall: 'read',
    this.ws.on("unexpected-response", (chk: any, error: any) => {
      if (error) {
        console.log("unexpected-response", error);
      }
      // console.log("connection close.");
      setTimeout(() => {
        console.log("do reconnect");
        me.createConnection();
      }, 5000);
    });
    /*
    this.ws.on("streamread", (chk: any, error: any) => {
      if (error) {
        console.log("steamread err:", error);
      }
    });
    this.ws.on("read", (chk: any, error: any) => {
      if (error) {
        console.log("read err:", error);
      }
    });
    */
    this.ws.on("ping", () => {
      console.log("get ping " + new Date().toLocaleString());
    });
    this.ws.on("error", (err) => {
      console.log("createConnection error:", err);
      /*
      setTimeout(() => {
        console.log("do reconnect");
        me.createConnection();
      }, 5000);
      */
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
    this.ws.on("close", (ws: WebSocket) => {
      console.log("connection close.", ws);
      setTimeout(() => {
        console.log("do reconnect");
        me.createConnection();
      }, 5000);
    });
    AWebSocket.inCreateProc = false;
  }
}
