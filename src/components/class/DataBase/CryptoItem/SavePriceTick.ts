import JTable from "../../../../class/JTable";
import { PriceTick } from "../../../../DataSchema/if";
import { getConnection } from "../../../../func/db";
import AOneFunction from "./AOneFunction";

export default class SavePriceTick extends AOneFunction {
	constructor(private data?: PriceTick[]) {
		super();
	}
	public execute() {
		return new Promise<any>(async (resolve) => {
			if (this.data && this.data.length > 0) {
				const conn = await getConnection();
				if (conn) {
					const jt: JTable<PriceTick> = new JTable(conn, "PriceTick");
					const ans = await jt.MultiInsert(this.data, true);
					await conn.release();
					resolve(ans);
				}
			} else {
				resolve(false);
			}
		});
	}
}
