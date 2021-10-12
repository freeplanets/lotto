import JTable from "../../../../class/JTable";
import { AskTable, IKeyVal } from "../../../../DataSchema/if";
import { getConnection } from "../../../../func/db";
import AOneFunction from "./AOneFunction";

export default class GetUnFinishedAsks extends AOneFunction {
	public execute() {
		return new Promise<any>(async (resolve) => {
			const conn = await getConnection("GetUnFinishedAsks getItem");
			// console.log("conn:", conn);
			if (conn) {
				const jt: JTable<AskTable> = new JTable(conn, "AskTable");
				const filter: IKeyVal = {
					Key: "ProcStatus",
					Val: 2,
					Cond: "<",
				};
				// console.log("before list");
				const ans = await jt.List(filter);
				await conn.release();
				if (ans) {
					// console.log("before resolve");
					resolve(ans);
				} else {
					// console.log("check1");
					resolve(false);
				}
			} else {
				// console.log("check2");
				resolve(false);
			}
		});
	}
}
