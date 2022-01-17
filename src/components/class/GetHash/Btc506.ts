import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AnyObject, IKeyVal, IMsg } from "../../../DataSchema/if";

interface Term {
	id: number;
	GameID: number;
	TermID: string;
}
interface Terms {
	GameID: number;
	GType: string;
	CurTerm?: Term;
	LastTerm?: Term;
}

export default class Btc506 {
	private GameID = [8, 9]; // GameID => ['BTCHash','HashSix'];
	private Term: Terms[] = [];
	constructor(private HashCodes: AnyObject[], private conn: PoolConnection) {}
	public async getTerms() {
		const jt = new JTable<AnyObject>(this.conn, "Terms");
		const filters: IKeyVal[] = [
			{
				Key: "GameID",
				Val: this.GameID.join(","),
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
		const msg: IMsg = await jt.Lists(filters, ["id", "GameID", "TermID"], "order by id");
		if (msg.ErrNo === ErrCode.PASS) {
			const data = msg.data as Term[];
			data.map((itm) => {
				console.log("Btc506", itm);
			});
		}
		return;
	}
}
