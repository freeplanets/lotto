import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { MessageKey } from "./MessageKey";

export class Message {
	constructor(private conn: PoolConnection) {}
	public KeyExisted(key: string) {
		// const jt = new JTable(this.conn, "MessageKey");
		// const ans = jt.getOne();
	}
}
