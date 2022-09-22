// import { PoolConnection } from "mariadb";
import { doQuery, getConnection } from "../../../../func/db";
import AOneFunction from "./AOneFunction";
export default class CodeDistinct extends AOneFunction {
	private query = doQuery;
	constructor() {
		super();
	}
	public execute() {
		return new Promise<any>(async (resolve) => {
			const conn = await getConnection("CodeDistinct getItem");
			let tmp = [];
			if (conn) {
				const sql = "select distinct Code from Items where isActive = 1";
				this.query(sql, conn).then(async (res) => {
					// console.log("done for query", res);
					if (res) {
						tmp = res;
					}
					await conn.release();
					resolve(tmp);
				}).catch(async (err) => {
					console.log("CodeDistinct", err);
					await conn.release();
					resolve(false);
				});
			} else {
				resolve(false);
			}
		});
	}
}
