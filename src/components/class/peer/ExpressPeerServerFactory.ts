import { ExpressPeerServer } from "peer";
import AMsgMan from "../Message/AMsgMan";
import { IClient } from "./ClientManager";
import SManager from "./SiteManager";

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
	private CM = SManager;
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
			const msg = await this.msgman.UserConnected(cid);
			console.log("peer connection", cid, client.getToken(), JSON.stringify(msg));
			client.send(`Welcome ${client.getId()}!`);
			const sock = client.getSocket();
			if (sock) {
				sock.on("close", async () => {
					const cmsg = await this.msgman.UserClosed(cid);
					this.CM.Remove(cid);
					console.log("user closed::", cid , JSON.stringify(cmsg));
				});
			}
			this.CM.Add(client);
		});
		/*
		eps.on("id", (conn: any) => {
			conn.send("thisisyourid");
		});
		*/
		/*
		eps.on("message", (client, message) => {
			if (message.type === MessageType.HEARTBEAT) { return; }
			console.log(client.getId(), "=>", message);
		});
		*/
		eps.on("disconntion", (client: any) => {
			console.log("peer disconnection", client);
		});
		return eps;
	}
}
