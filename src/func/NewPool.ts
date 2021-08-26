import mariadb from "mariadb";
export default class NewPool {
	private pool: mariadb.Pool;
	constructor(opt: mariadb.PoolConfig) {
		this.pool = mariadb.createPool(opt);
	}
	public getConnection(redo: boolean = false): Promise<mariadb.PoolConnection | undefined> {
		return new Promise((resolve) => {
			this.pool?.getConnection().then((conn) => {
				resolve(conn);
			}).catch((err) => {
				console.log("getConnection Error:", err);
				if (!redo) {
					this.resetPool();
					resolve(this.getConnection(true));
				}
				resolve(undefined);
			});
		});
	}
	public resetPool() {
		console.log("PoolInfo:", this.info());
		this.pool.end();
	}
	private info() {
		return {
			total: this.pool.totalConnections(),
			active: this.pool.activeConnections(),
			idle: this.pool.idleConnections(),
		};
	}
}
