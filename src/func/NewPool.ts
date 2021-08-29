import mariadb, { PoolConnection } from "mariadb";
export default class NewPool {
	private pool: mariadb.Pool;
	constructor(private opt: mariadb.PoolConfig) {
		this.pool = this.createPool();
	}
	public getConnection(caller: string= ""): Promise<mariadb.PoolConnection | undefined> {
		return new Promise((resolve) => {
			this.pool.getConnection().then((conn) => {
				// console.log("NewPool Info:", this.info(caller));
				resolve(conn);
			}).catch(async (err) => {
				console.log("getConnection Error:", err);
				let conn: PoolConnection | undefined;
				if (err.code === "ER_GET_CONNECTION_TIMEOUT") {
					conn = await this.resetPool();
				}
				resolve(conn);
			});
		});
	}
	public createPool() {
		const pool = mariadb.createPool(this.opt);
		pool.on("release", (conn) => {
			 console.log("conn release:", this.info(), "conn info:", conn.info?.threadId);
		});
		console.log("NewPool Info:", this.info(this.opt.connectionLimit));
		return pool;
	}
	public async resetPool() {
		console.log("resetPool:", this.info());
		await this.pool.end();
		this.pool = this.createPool();
		const conn = await this.getConnection();
		return conn;
	}
	private info(max?: number | string) {
		let info: any = {};
		if (this.pool) {
			info = {
				total: this.pool.totalConnections(),
				active: this.pool.activeConnections(),
				idle: this.pool.idleConnections(),
			};
			if (max) {
				if (typeof max === "number") {
					info.max = max;
				}	else {
					info.func = max;
				}
			}
		}
		return info;
	}
}
