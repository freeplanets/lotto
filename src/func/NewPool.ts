import mariadb, { Connection, PoolConnection } from "mariadb";
export default class NewPool {
	private pool: mariadb.Pool;
	private curCaller = "";
	constructor(private opt: mariadb.PoolConfig) {
		this.pool = this.createPool();
	}
	public getConnection(caller: string= ""): Promise<mariadb.PoolConnection | undefined> {
		return new Promise((resolve) => {
			this.pool.getConnection().then((conn) => {
				if (caller) { console.log("NewPool getConnection:", caller); }
				this.curCaller = caller;
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
		const showInfo = (action: string, conn?: Connection) => {
			let id: number | null = null;
			if (conn) {
				id = conn.info ? conn.info.threadId : 0;
			}
			let caller = this.curCaller;
			if (action === "connection") { caller = ""; }
			console.log(`NewPool ${action}:`, this.info(id, caller));
		};
		pool.on("release", (conn) => {
			showInfo("release", conn);
		});
		/*
		pool.on("connection", (conn) => {
			showInfo("connection", conn);
		});
		*/
		pool.on("acquire", (conn) => {
			showInfo("acquire", conn);
		});
		pool.on("enqueue", () => {
			showInfo("enqueue");
		});
		// console.log("NewPool Info:", this.info(this.opt.connectionLimit));
		return pool;
	}
	public async resetPool() {
		console.log("resetPool:", this.info());
		await this.pool.end();
		this.pool = this.createPool();
		const conn = await this.getConnection();
		return conn;
	}
	private info(idorfunc?: number | null, funcName?: string) {
		let info: any = {};
		if (this.pool) {
			info = {
				total: this.pool.totalConnections(),
				active: this.pool.activeConnections(),
				idle: this.pool.idleConnections(),
			};
			if (idorfunc) {
				info.connID = idorfunc;
			}
			if (funcName) {
				info.func = funcName;
			}
		}
		return JSON.stringify(info);
	}
}
