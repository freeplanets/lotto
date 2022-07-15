import { EventEmitter } from "events";
import WebSocketLib from "ws";

type MyWebSocket = WebSocketLib & EventEmitter;
enum PAction {
	LOGIN = "login",
	LEAVE = "leave",
}
interface SMsg {
	cid: string;
	action: PAction;
}

export interface IClient {
  getId(): string;
  getToken(): string;
  getSocket(): MyWebSocket | null;
  setSocket(socket: MyWebSocket | null): void;
  getLastPing(): number;
  setLastPing(lastPing: number): void;
  send(data: any): void;
}

export class ClientManager {
	private clients: IClient[] = [];
	public Add(client: IClient) {
		const fIdx = this.clients.findIndex((clt) => clt.getId() === client.getId());
		if (fIdx === -1) {
			const msg: SMsg = {
				cid: client.getId(),
				action: PAction.LOGIN,
			};
			this.NotifyUser(msg);
			this.clients.push(client);
		}
	}
	public Remove(cid: string) {
		const fIdx = this.clients.findIndex((clt) => clt.getId() === cid);
		this.clients.splice(fIdx, 1);
		console.log("remove:", cid, this.clients.length);
		const msg: SMsg = {
			cid,
			action: PAction.LEAVE,
		};
		this.NotifyUser(msg);
	}
	private NotifyUser(msg: SMsg) {
		this.clients.forEach((clt) => {
			// console.log(`message to ${clt.getId()}: ${cid} leaved!!`);
			clt.send(msg);
			/*
			const sock = clt.getSocket();
			if (sock) {
				sock.send(`${cid} leaved!!`, (err) => {
					console.log(`message to ${clt.getId()}: ${cid} leaved!!`);
					if (err) { console.log("send client", err); }
				});
			}
			*/
		});
	}
}
export default new ClientManager();
