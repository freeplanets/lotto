import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AnyObject, IKeyVal, IMsg } from "../../../DataSchema/if";
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
	constructor(private conn: PoolConnection, private HashCodes: HashBlock[]) {}
	public async doit() {
		await this.getGame();
		await this.getTerms();
		this.Term.map((itm) => {
			console.log("doit:", itm.status);
		});
		await this.anaHashCodes();
	}
	public async anaHashCodes() {
		const sData: HashData[] = [];
		if (this.HashCodes) {
			// const lastHash: HashData | null = await this.getLastHash();
			// const hid = lastHash ? lastHash.BlockID : 0;
			const n = this.HashCodes.length;
			for (let i = 0, len = this.HashCodes.length; i < len; i += 1) {
				const itm = this.HashCodes[i];
				// if (itm.height > hid) {
				if (itm.height % 5 === 0 ) { sData.push({BlockID: itm.height, HashValue: itm.id}); }
				// }
				await Promise.all(this.Term.map((term) => term.checkBlockID(itm)));
			}
			console.log("--- anaHashCodes:sData.length ---", sData.length);
			if (sData.length > 0) {
				await this.saveHash(sData);
			}
		}
	}
	private async saveHash(sData: HashData[]) {
		console.log("saveHash", sData);
		const jt: JTable<HashData> = new JTable(this.conn, "HashData");
		const ans = await jt.MultiUpdate(sData);
		if (ans) {
			console.log("HashGameMananger saveHash:", ans);
		}
	}
	private async getGame(): Promise<void> {	// get unsettle terms
		const jt = new JTable<AnyObject>(this.conn, "Games");
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
						const t: TermInfo = new TermInfo(itm.id, itm.GType, this.conn, this.HashCodes);
						this.Term.push(t);
						this.GameIDs.push(itm.id);
						// this.Term.every()
					}
				});
				// console.log("getGame", this.GameIDs);
			} else {
				console.log("getGame empty", msg);
			}
		} else {
			console.log("getGame error", msg);
		}
	}
	private async getTerms(): Promise<void> {	// get unsettle terms
		const jt = new JTable<AnyObject>(this.conn, "Terms");
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
