import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import BTCHashResult from "../../../components/class/GetHash/BTC";
import { ErrCode, TermAuto } from "../../../DataSchema/ENum";
import { AnyObject, IKeyVal, IMsg } from "../../../DataSchema/if";
import * as db from "../../../func/db";
// import { doQuery } from "../../../func/db";
import TermInfo, { Term } from "./TermInfo";

interface HashData {
	BlockID: number;
	HashValue: string;
	HashChange?: string;
}
interface Game {
	id: number;
	GType: string;
}
export interface HashBlock extends AnyObject {
	id: string;
	height: number;
}
export default class HashGameManager {
	private HashGame = ["BTCHash", "HashSix"];
	private Term: TermInfo[] = [];
	private GameIDs: number[] = [];
	private heightKeeper: any = 0;
	private btcR: BTCHashResult;
	constructor(btcSourceUrl?: string) {
		this.btcR = new BTCHashResult(btcSourceUrl);
	}
	public async check() {
		const height = await this.btcR.getHeght();
		if (height !== this.heightKeeper) {
			console.log("HashGameManager", this.heightKeeper, height);
			this.heightKeeper = height;
			const conn = await db.getConnection(`HashGameManager check:`);
			if (conn) {
				const myHeight = Number(height);
				const sw = myHeight % TermAuto.GAP;
				switch (sw) {
					case TermAuto.SAVE_DATA:
						await this.saveData(conn, myHeight);
						break;
					case TermAuto.SETTLE_OLD:
						await this.refreshGameData(conn);
						await this.forSettle(myHeight, conn);
						break;
					case TermAuto.CREATE_NEW:
						await this.refreshGameData(conn);
						await this.forNew(myHeight, conn);
				}
				await conn.release();
			}
			// const hash = await this.btcR.getBlock(height);
		}
	}
	private async refreshGameData(conn: PoolConnection) {
		this.Term = [];
		this.GameIDs = [];
		await	this.getGame(conn);
		await this.getTerms(conn);
	}
	private async forSettle(height: number, conn: PoolConnection) {
		const oldHeight = height - TermAuto.SETTLE_OLD;
		const hash = await this.btcR.getBlock(oldHeight);
		await this.saveData(conn, oldHeight, hash);
		const block: HashBlock = {
			id: String(hash),
			height: oldHeight
		};
		console.log("HashGameManager forSettle:", height, oldHeight);
		await Promise.all(this.Term.map((term) => term.forSettle(block, conn)));
	}
	private async forNew(height: number, conn: PoolConnection) {
		await Promise.all(this.Term.map((term) => term.forNew(height, conn)));
	}
	private async saveData(conn: PoolConnection, height: any, hash?: any): Promise<void> {
		if (!hash) {
			hash = await this.btcR.getBlock(height);
		}
		const data: HashData[] = [
			{
				BlockID: Number(height),
				HashValue: String(hash)
			}
		];
		await this.saveHash(data, conn);
	}
	private async saveHash(sData: HashData[], conn: PoolConnection) {
		console.log("saveHash", sData);
		const jt: JTable<HashData> = new JTable(conn, "HashData");
		const ans = await jt.MultiUpdate(sData);
		if (ans) {
			console.log("HashGameMananger saveHash:", ans);
		}
	}
	private async getGame(conn: PoolConnection): Promise<void> {	// get unsettle terms
		const jt = new JTable<AnyObject>(conn, "Games");
		const filters: IKeyVal[] = [{
			Key: "GType",
			Val: `'${this.HashGame.join("','")}'`,
			Cond: "in",
		}, {
			Key: "AutoOpen",
			Val: 1,
		}];
		const msg: IMsg = await jt.Lists(filters, ["id", "GType"]);
		if (msg.ErrNo === ErrCode.PASS) {
			if (Array.isArray(msg.data)) {
				const data = msg.data as Game[];
				console.log("getGame:", msg);
				data.map((itm) => {
					const fIdx = this.Term.findIndex((term) => term.GameID === itm.id);
					if (fIdx === -1) {
						const t: TermInfo = new TermInfo(itm.id, itm.GType);
						this.Term.push(t);
						this.GameIDs.push(itm.id);
					}
				});
			} else {
				console.log("getGame empty", msg);
			}
		} else {
			console.log("getGame error", msg);
		}
	}
	private async getTerms(conn: PoolConnection): Promise<void> {	// get unsettle terms
		const jt = new JTable<AnyObject>(conn, "Terms");
		const filters: IKeyVal[] = [
			{
				Key: "GameID",
				Val: `${this.GameIDs.join(",")}`,
				Cond: "in",
			},
			{
				Key: "isSettled",
				Val: 0,
			},
			{
				Key: "isCanceled",
				Val: 0,
			}
		];
		const msg: IMsg = await jt.Lists(filters, ["id", "GameID", "TermID"], "id");
		if (msg.ErrNo === ErrCode.PASS) {
			const data = msg.data as Term[];
			data.map((itm) => {
				const f = this.Term.find((t) => t.GameID === itm.GameID );
				if (f) {
					f.addTerm(itm);
				}
			});
		}
	}
}
