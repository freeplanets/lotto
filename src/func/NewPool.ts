import mariadb from "mariadb";
export default class NewPool {
	private pool: mariadb.Pool;
	constructor(opt: mariadb.PoolConfig) {
		this.pool = mariadb.createPool(opt);
		console.log("NewPool Info:", this.info(opt.connectionLimit));
	}
	public getConnection(caller: string= ""): Promise<mariadb.PoolConnection | undefined> {
		return new Promise((resolve) => {
			this.pool?.getConnection().then((conn) => {
				console.log("NewPool Info:", this.info(caller));
				conn.release();
				resolve(conn);
			}).catch(async (err) => {
				console.log("getConnection Error:", err);
				resolve(undefined);
			});
		});
	}
	public async resetPool(func: string) {
		console.log("PoolInfo:", this.info(func));
		await this.pool.end();
	}
	private info(max?: number | string) {
		const info: any = {
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
		return info;
	}
}
