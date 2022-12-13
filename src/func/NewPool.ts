import mariadb, { Connection, PoolConnection } from "mariadb";
import StrFunc from "../components/class/Functions/MyStr";

export default class NewPool {
	private pool: mariadb.Pool | null;
	private curCaller = "";
	private chk = false;
	// private maxConns = 0;
	constructor(private opt: mariadb.PoolConfig, private isDebug = false) {
		this.pool = this.createPool(this.chk);
		console.log(">>> NewPool:", new Date().toLocaleString());
	}
	public getConnection(caller: string= ""): Promise<mariadb.PoolConnection | undefined> {
		return new Promise(async (resolve) => {
			/*
			if (!this.maxConns) {
				this.maxConns = await this.getMaxConnections();
				console.log("check maxC:", this.maxConns, this.info());
			}
			*/
			this.curCaller = caller;
			this.pool?.getConnection().then((conn) => {
				if (caller && this.isDebug) { console.log("NewPool getConnection:", caller); }
				resolve(conn);
			}).catch(async (err) => {
				console.log(`${caller} getConnection Error:`, err);
				let conn: PoolConnection | undefined;
				if (err.code === "ER_GET_CONNECTION_TIMEOUT" || err.code === "ER_CLOSING_POOL") {
					conn = await this.resetPool();
					resolve(conn);
				} else {
					resolve(undefined);
				}
			});
		});
	}
	public createPool(withListener: boolean = false) {
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
		if (withListener) {
			pool.on("release", (conn) => {
				showInfo("release", conn);
			});
			pool.on("acquire", (conn) => {
				showInfo("acquire", conn);
			});
			pool.on("enqueue", () => {
				console.log("enqueue");
			});
			pool.on("connection", (conn) => {
				showInfo("connection", conn);
			});
		}
		return pool;
	}
	public async resetPool() {
		console.log("resetPool:", this.info());
		// const activeConn = this.pool?.activeConnections();
		// const maxConn = this.pool.
		/*
		await this.pool?.end();
		this.pool = null;
		this.pool = this.createPool(this.chk);
		*/
		const conn = await this.getConnection(this.curCaller);
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
		return StrFunc.stringify(info);
	}
	/*
	private getMaxConnections(): Promise<number> {
		return new Promise((resolve) => {
			if (this.pool) {
				this.pool.query('SHOW VARIABLES LIKE "max_connections"').then((res) => {
					// console.log("getMaxConnections", res[0]?.Value);
					resolve(res[0]?.Value ? res[0]?.Value : 0);
				}).catch((err) => {
					console.log("getMaxConnections", err);
					resolve(0);
				}).finally(() => {
					console.log("getMaxConnections end");
					resolve(999);
				});
			} else {
				resolve(0);
			}
		});
	}
	*/
}
