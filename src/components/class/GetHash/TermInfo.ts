import { PoolConnection } from "mariadb";
import { createTerms, setStop } from "../../../API/ApiFunc";
import { SaveNums } from "../../../class/Settlement";
import { CancelTerm } from "../../../class/Settlement";
import { TermAuto } from "../../../DataSchema/ENum";
import { ITerms } from "../../../DataSchema/user";
import { doQuery } from "../../../func/db";
import FuncDate from "../Functions/MyDate";
import { HashBlock } from "./HashGameManager";
import HashNum from "./HashNum";

export interface Term {
	id: number;
	GameID: number;
	TermID: string;
}
export default class TermInfo {
	get GameID() {
		return this.gameid;
	}
	get status() {
		return {
			GameID: this.gameid,
			GType: this.gtype,
			CurTerm: this.curTerm,
			LastTerm: this.lastTerm,
		};
	}
	private curTerm: Term = { id: 0, GameID: 0, TermID: "0" };
	private lastTerm: Term = { id: 0, GameID: 0, TermID: "0" };
	private nextTermID = 0;	// 應開下期ID
	constructor(private gameid: number, private gtype: string, private conn: PoolConnection, private hashblocks: HashBlock[]) {}
	public async checkBlockID(block: HashBlock) {
		// console.log(`${this.gameid}:${this.gtype} checkBlockID`, JSON.stringify(block));
		const sw = block.height % TermAuto.GAP;
		switch (sw) {
			case TermAuto.SETTLE_OLD:
				await this.forSettle(block);
				break;
			case TermAuto.CREATE_NEW:
				await this.forNew(block);
		}
	}
	public addTerm(term: Term) {
		if (!this.curTerm.id) {
			this.setTerm(this.curTerm, term);
		} else if (term.id > this.curTerm.id) {
			this.setTerm(this.lastTerm, this.curTerm);
			this.setTerm(this.curTerm, term);
		} else {
			this.setTerm(this.lastTerm, term);
		}
	}
	private async forNew(block: HashBlock): Promise<void> {
		console.log("forNew", this.nextTermID, this.GameID, this.gtype, block.height);
		if (this.nextTermID) {
			return;
		}
		// const conn = await getConnection("forNew");
		if (this.conn) {
			if (this.curTerm.id) {	// 已有彩期
				console.log("closeCurrentTerm", block.height, this.curTerm.TermID);
				if (block.height - parseInt(this.curTerm.TermID, 10) === 1) {
					await this.closeCurrentTerm(this.conn);
				}
			}
			this.nextTermID = block.height + 6;
			await this.createNextTerm(this.conn);
			// await conn.release();
		}
	}
	private async forSettle(block: HashBlock): Promise<void> {
		if (this.lastTerm.id) {
			console.log("TermInfo forSetle", JSON.stringify(this.lastTerm), JSON.stringify(block));
			const lastTermID = parseInt(this.lastTerm.TermID, 10);
			if (block.height - lastTermID === TermAuto.SETTLE_OLD) {
				const f = this.hashblocks.find((itm) => itm.height === lastTermID);
				if (f) {
					const num = this.genHashNum(block.id);
					// const conn = await getConnection("TermInfo settleTerm");
					if (this.conn) {
						const chk = await this.checkSettle(this.lastTerm.id, this.conn);
						console.log("checkSettle", chk);
						if (chk && chk[0].isSettled === 0) {
							if (num) {
								const ans = await SaveNums(this.lastTerm.id, this.GameID, num, this.conn);
								console.log("TermInfo forSettle:", ans);
							} else {
								const ans = await CancelTerm(this.lastTerm.id, this.conn);
								console.log("TermInfo CancelTerm:", ans);
							}
						}
						// await conn.release();
					}
				}
			}
		}
	}
	private async closeCurrentTerm(conn: PoolConnection): Promise<any> {
		console.log("closeCurrentTerm");
		const chk = await this.checkStop(this.curTerm.id, this.curTerm.GameID, conn);
		console.log("checkStop", this.curTerm.GameID, chk[0].cnt);
		if (chk && chk[0].cnt > 0) {
			const ans = await setStop(this.curTerm.id, this.curTerm.GameID, 1, 0, conn);
			return ans;
		}
	}
	private async checkStop(tid: number, GameID: number, conn: PoolConnection) {
		const sql = `select count(*) cnt from CurOddsInfo where tid=${tid} and GameID=${GameID} and isStop=0`;
		console.log("checkStop sql: ", sql);
		return await doQuery(sql, conn);
	}
	private async checkSettle(tid: number, conn: PoolConnection) {
		const sql = `select isSettled from Terms where id=${tid}`;
		return await doQuery(sql, conn);
	}
	private async createNextTerm(conn: PoolConnection): Promise<any> {
		console.log("createNextTerm", this.nextTermID, parseInt(this.curTerm.TermID, 10), this.GameID, this.gtype);
		if (this.nextTermID && (this.curTerm.TermID && this.nextTermID > parseInt(this.curTerm.TermID, 10))) {
			console.log("createNextTerm start");
			const term: ITerms = {
				id:  0,
				GameID: this.GameID,
				TermID: `${this.nextTermID}`,
				PDate: FuncDate.toDbDateString(FuncDate.getDate().getTime()),
				PTime: "23:59",
				StopTime: "23:59",
				StopTimeS: "",
				ModifyID: 0
			};
			const msg = await createTerms(this.gtype, term, conn);
			console.log("createNextTerm end", this.nextTermID, this.curTerm.TermID, this.GameID, this.gtype, msg);
		} else {
			console.log("createNextTerm do nothing");
		}
	}
	private setTerm(df: Term, add: Term) {
		df.id = add.id;
		df.GameID = add.GameID;
		df.TermID = add.TermID;
	}
	private genHashNum(hash: string): false | string {
		let num: false | string = "";
		if (this.gtype === "HashSix") {
			num = new HashNum(hash, 49, 0, 6, false, true, true, true).NumLine.join(",");
			if (num.split(",").length !== 6) { num = false; }
		} else {
			num = new HashNum(hash, 9, 0, 5, true, true, false, true).NumLine.join(",");
			if (num.split(",").length !== 5) { num = false; }
		}
		return num;
	}
}
