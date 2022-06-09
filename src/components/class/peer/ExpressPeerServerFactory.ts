import { EventEmitter } from "events";
import { ExpressPeerServer } from "peer";
import WebSocketLib from "ws";
import AMsgMan from "../Message/AMsgMan";

type MyWebSocket = WebSocketLib & EventEmitter;

interface IClient {
  getId(): string;
  getToken(): string;
  getSocket(): MyWebSocket | null;
  setSocket(socket: MyWebSocket | null): void;
  getLastPing(): number;
  setLastPing(lastPing: number): void;
  send(data: any): void;
}

enum MessageType {
  OPEN = "OPEN",
  LEAVE = "LEAVE",
  CANDIDATE = "CANDIDATE",
  OFFER = "OFFER",
  ANSWER = "ANSWER",
  EXPIRE = "EXPIRE",
  HEARTBEAT = "HEARTBEAT",
  ID_TAKEN = "ID-TAKEN",
  ERROR = "ERROR"
}

export default class ExpressPeerServerFactory {
	constructor(private server: any, private msgman: AMsgMan) {}
	public get() {
		return this.create();
	}
	private create() {
		const eps = ExpressPeerServer(this.server, {
			path: "/Service"
		});
		eps.on("connection", async (client: IClient) => {
			const cid = client.getId();
			const msg = this.msgman.UserConnected(cid);
			console.log("peer connection", cid, client.getToken(), JSON.stringify(msg));
			const sock = client.getSocket();
			if (sock) {
				sock.on("close", async () => {
					const cmsg = await this.msgman.UserClosed(cid);
					console.log("user closed::", cid , JSON.stringify(cmsg));
				});
				/*
				sock.on("message", (data: WebSocketLib.Data) => {
					const msg = JSON.parse(data.toString());
					if (msg.type !== MessageType.HEARTBEAT) {
						console.log("useer Message", msg);
					}
				});
				*/
			}
			client.send(`Welcome ${client.getId()}!`);
		});
		/*
		eps.on("id", (conn: any) => {
			conn.send("thisisyourid");
		});
		*/
		eps.on("disconntion", (client: any) => {
			console.log("peer disconnection", client);
		});
		return eps;
	}
}
