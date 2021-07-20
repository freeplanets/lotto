import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, IKeyVal, IMsg, Ledger, LedgerTotal } from "../../../DataSchema/if";
import { Query } from "../../../func/db";
import ALedger from "./ALedger";

export default class LedgerAccess extends ALedger<Ledger> {
  constructor(conn: PoolConnection, tablename: string) {
    super(conn, tablename);
  }
  public async add(ask: AskTable): Promise<IMsg> {
    const key = ask.BuyType === 0 ? 1 : -1;
    const ledger: Ledger = {
      id: 0,
      UserID: ask.UserID,
      UpId: ask.UpId,
      ItemID: ask.ItemID,
      AskID: ask.id,
      Qty: ask.Qty * key,
      Amount: ask.Amount,
      Fee: ask.Fee ? ask.Fee : 0,
    };
    // const jt = new JTable<Ledger>(conn, "Ledger");
    const msg: IMsg = await this.jtable.Insert(ledger);
    if (msg.ErrNo === ErrCode.PASS ) {
      const sql = `insert into LedgerTotal(UserID,ItemID,Qty)
          values(${ledger.UserID},${ledger.ItemID},${ledger.Qty})
          on duplicate key update Qty = Qty + values(Qty)`;
      // console.log("LedgerAccess add:", sql);
      return  await Query(sql, this.conn);
    } else {
      return msg;
    }
  }
  public async get(UserID: number): Promise<IMsg> {
    const param: IKeyVal = {
      Key: "UserID",
      Val: UserID
    };
    const jt: JTable<LedgerTotal> = new JTable(this.conn, "LedgerTotal");
    return await jt.Lists(param);
  }
}
