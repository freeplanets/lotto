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
      console.log("Send Mesage to Server:", msg);
      const wsmsg: WsMsg = {
        Message: msg,
      };
      this.ws.send(StrFunc.stringify(wsmsg));
    }
  }
  public Send(msg: WsMsg) {
    // console.log("before Send Mesage:", msg);
    if (!this.isConnected) { return; }
    // this.ws.send(msg);
    try {
      if (this.ws) {
        // console.log("Send Mesage:", msg);
        if (msg.Ask || msg.Asks) {
          console.log("Send Ask", JSON.stringify(msg));
        }
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
    if (AWebSocket.inCreateProc) {
      console.log("connecting......");
      return;
    }
    this.ws = null;
    const me = this;
    AWebSocket.inCreateProc = true;
    console.log("connect to:", this.url);
    this.ws = new WebSocket(this.url, this.opts);
    // code: 'ETIMEDOUT',
    // syscall: 'read',
    this.ws.on("unexpected-response", (chk: any, error: any) => {
      if (error) {
        console.log("unexpected-response", chk, error);
      }
      // console.log("connection close.");
      if (me.ws?.readyState !== 1) {
        setTimeout(() => {
          console.log("unexpected-response do reconnect");
          me.createConnection();
        }, 5000);
      }
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
      console.log("error:", err);
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
    this.ws.on("close", () => {
      console.log("connection close.", new Date().toLocaleString());
      setTimeout(() => {
        console.log("close then do reconnect");
        me.createConnection();
      }, 5000);
    });
    AWebSocket.inCreateProc = false;
  }
}
