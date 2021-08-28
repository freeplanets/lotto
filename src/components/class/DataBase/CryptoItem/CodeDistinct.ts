// import { PoolConnection } from "mariadb";
import { doQuery, getConnection } from "../../../../func/db";
import AGet from "./AGet";
export default class CodeDistinct extends AGet {
	private query = doQuery;
	constructor() {
		super();
	}
	public getItem() {
		return new Promise<any>(async (resolve) => {
			const conn = await getConnection();
			let tmp = [];
			if (conn) {
				const sql = "select distinct Code from Items where isActive = 1";
				this.query(sql, conn).then(async (res) => {
					// console.log("done for query", res);
					if (res) {
						tmp = res;
					}
				});
				await conn.release();
				resolve(tmp);
			} else {
				resolve(false);
			}
		});
	}
}
