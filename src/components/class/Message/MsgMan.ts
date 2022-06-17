import { PoolConnection } from "mariadb";
import { IMsg } from "../../../DataSchema/if";
import { getConnection } from "../../../func/db";
import AMsgMan from "./AMsgMan";
import AMsgSaver from "./AMsgSaver";

export default class MsgMan extends AMsgMan {
	private conn: PoolConnection | undefined;
	constructor(private saver: AMsgSaver) {
		super();
	}
	public UserConnected(id: string): Promise<IMsg> {
		return new Promise<IMsg>(async (resolve) => {
			const msg = this.saver.UserConnected(id);
			resolve(msg);
		});
	}
	public UserClosed(id: string): Promise<IMsg> {
			return new Promise<IMsg>(async (resolve) => {
				const msg = this.saver.UserClosed(id);
				resolve(msg);
			});
	}
	public SaveMessage(Sender: string, Receiver: string, data: any): Promise<IMsg> {
			return new Promise<IMsg>(async (resolve) => {
				resolve({ErrNo: 0});
			});
	}
	private async getConnection(): Promise<void> {
		return new Promise(async (resolve) => {
			if (!this.conn) {
				this.conn = await getConnection("MsgMan");
				resolve();
			} else {
				resolve();
			}
		});
	}
}
