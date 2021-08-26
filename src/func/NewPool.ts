import mariadb from "mariadb";
export default class NewPool {
	private pool: mariadb.Pool;
	constructor(opt: mariadb.PoolConfig) {
		this.pool = mariadb.createPool(opt);
		console.log("NewPool Info:", this.info(opt.connectionLimit));
	}
	public getConnection(redo: boolean = false): Promise<mariadb.PoolConnection | undefined> {
		return new Promise((resolve) => {
			this.pool?.getConnection().then((conn) => {
				resolve(conn);
			}).catch(async(err) => {
				console.log("getConnection Error:", err);
				if (!redo) {
					await this.resetPool();
					resolve(this.getConnection(true));
				} else {
					resolve(undefined);
				}
			});
		});
	}
	public async resetPool() {
		console.log("PoolInfo:", this.info());
		await this.pool.end();
	}
	private info(max?: number) {
		const info: any = {
			total: this.pool.totalConnections(),
			active: this.pool.activeConnections(),
			idle: this.pool.idleConnections(),
		};
		if (max) {
			info.max = max;
		}
		return info;
	}
}
