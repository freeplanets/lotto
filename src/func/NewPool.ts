import mariadb from "mariadb";
export default class NewPool {
	private pool: mariadb.Pool;
	private redo = false;
	constructor(private opt: mariadb.PoolConfig) {
		this.pool = this.createPool();
	}
	public getConnection(pool?: mariadb.Pool, doHash: boolean = false): Promise<mariadb.PoolConnection | undefined> {
		if (pool) { this.pool = pool; }
		return new Promise((resolve, rejects) => {
			if (doHash) { rejects({ error: "no more doHash" }); }
			this.pool.getConnection().then((conn) => {
				this.redo = false;
				resolve(conn);
			}).catch((err) => {
				console.log("getConnection Error:", err);
				if (!pool && !this.redo) {
					this.redo = true;
					this.resetPool();
					resolve(this.getConnection());
				}
				this.redo = false;
				rejects(err);
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
