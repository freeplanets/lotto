import JTable from "../../../../class/JTable";
import { IKeyVal } from "../../../../DataSchema/if";
import { getConnection } from "../../../../func/db";
import AGet from "./AGet";

export default class GetUnFinishedAsks extends AGet {
	public getItem() {
		return new Promise<any>(async (resolve, reject) => {
			const conn = await getConnection();
			if (conn) {
				const jt = new JTable(conn, "AskTable");
				const filter: IKeyVal = {
					Key: "ProcStatus",
					Val: 2,
					Cond: "<",
				};
				// console.log("before list");
				const ans = await jt.List(filter);
				if (ans) {
					// console.log("before resolve");
					resolve(ans);
				} else {
					resolve(false);
				}
			} else {
				resolve(false);
			}
		});
	}
}
