import { PoolConnection } from "mariadb";
import { createTerms, setStop } from "../../../API/ApiFunc";
import { SaveNums } from "../../../class/Settlement";
import { CancelTerm } from "../../../class/Settlement";
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
	// private nextTermID = 0;	// 應開下期ID
	constructor(private gameid: number, private gtype: string) {}
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
	public async closeLast(height: number, conn: PoolConnection): Promise<void> {
		console.log("closeLast", this.GameID, this.gtype, height);
		/*
		if (this.nextTermID) {
			return;
		}
		*/
		// const conn = await db.getConnection(`${this.gtype} forNew ${height}`);
		if (conn) {
			if (this.curTerm.id) {	// 已有彩期
				console.log("closeCurrentTerm", height, this.curTerm.TermID);
				if (height - parseInt(this.curTerm.TermID, 10) === 1) {
					await this.closeCurrentTerm(conn);
				}
			}
			// this.nextTermID = height + 5;
			// await this.createNextTerm(conn);
			// await conn.release();
		}
	}
	public async forSettle(block: HashBlock, conn: PoolConnection): Promise<void> {
		console.log("TermInfo forSettle", this.lastTerm.TermID, block.height);
		if (this.lastTerm.id && this.lastTerm.TermID === String(block.height)) {
			const num = this.genHashNum(block.id);
			// const conn = await db.getConnection(`${this.gtype} forSette ${block.height}`);
			if (conn) {
				const chk = await this.checkSettle(this.lastTerm.id, conn);
				console.log("checkSettle", chk, block);
				if (chk && chk[0].isSettled === 0) {
					if (num) {
						const ans = await SaveNums(this.lastTerm.id, this.GameID, num, conn);
						console.log("TermInfo forSettle:", ans);
					} else {
						const ans = await CancelTerm(this.lastTerm.id, conn);
						console.log("TermInfo CancelTerm:", ans);
					}
				}
				// await conn.release();
			}
		}
	}
	public async createNextTerm(nextHeight: number, conn: PoolConnection): Promise<any> {
		console.log("createNextTerm", nextHeight, parseInt(this.curTerm.TermID, 10), this.GameID, this.gtype);
		if (nextHeight && (this.curTerm.TermID && nextHeight > parseInt(this.curTerm.TermID, 10))) {
			console.log("createNextTerm start");
			const term: ITerms = {
				id:  0,
				GameID: this.GameID,
				TermID: `${nextHeight}`,
				PDate: FuncDate.toDbDateString(FuncDate.getDate().getTime()),
				PTime: "23:59",
				StopTime: "23:59",
				StopTimeS: "",
				ModifyID: 0
			};
			const msg = await createTerms(this.gtype, term, conn);
			// console.log("createNextTerm end", this.nextTermID, this.curTerm.TermID, this.GameID, this.gtype, msg);
		} else {
			console.log("createNextTerm do nothing");
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
