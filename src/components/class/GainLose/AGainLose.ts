import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { IHasID, IMsg, LedgerLever } from "../../../DataSchema/if";
import DateFunc from "../Functions/MyDate";

export default abstract class AGainLose {
	protected jt: JTable<IHasID>;
	protected date = DateFunc;
	constructor(protected conn: PoolConnection) {
		this.jt = new JTable(conn, "MemberGainLose");
	}
	public abstract add(ldgLever: LedgerLever): Promise<IMsg>;
	public abstract remove(ldgLever: LedgerLever): Promise<IMsg>;
	public abstract reset(): Promise<IMsg>;
}
