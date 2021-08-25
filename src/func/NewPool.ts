import mariadb from "mariadb";
export default class NewPool {
	private pool: mariadb.Pool;
	constructor(private opt: mariadb.PoolConfig) {
		this.pool = this.createPool();
	}
	public getConnection(redo: boolean = false): Promise<mariadb.PoolConnection | undefined> {
		return new Promise((resolve) => {
			this.pool.getConnection().then((conn) => {
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
		this.pool = this.createPool();
	}
	public createPool() {
		return mariadb.createPool(this.opt);
	}
	private info() {
		return {
			total: this.pool.totalConnections(),
			active: this.pool.activeConnections(),
			idle: this.pool.idleConnections(),
		};
	}
}
