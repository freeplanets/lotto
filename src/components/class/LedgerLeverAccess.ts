import { PoolConnection } from "mariadb";
import JTable from "../../class/JTable";
import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, IKeyVal, IMsg, LedgerLever } from "../../DataSchema/if";
import ALedger from "./ALedger";

export default class LedgerLeverAccess extends ALedger<LedgerLever> {
  constructor(conn: PoolConnection, tablename: string) {
    super(conn, tablename);
  }
  public async add(ask: AskTable): Promise<IMsg> {
    // const msg: IMsg = { ErrNo: ErrCode.PASS };
    if (ask.USetID || ask.SetID) {
      return await this.SettleOne(ask);
    } else {
      return await this.CreateNew(ask);
    }
  }
  private async SettleOne(ask: AskTable): Promise<IMsg> {
    // console.log("LedgerLeverAccess SettleOne", ask.SetID, ask.USetID);
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    let SearchID = ask.SetID ? ask.SetID : 0;
    if (ask.USetID) { SearchID = ask.USetID; }
    const kv: IKeyVal = {
      Key: "BuyID",
      Val: SearchID,
    };
    const ldg: LedgerLever[] | undefined = await this.jtable.List(kv);
    // console.log("SettleOne", JSON.stringify(kv), JSON.stringify(ldg), JSON.stringify(ask));
    if (ldg) {
      let ldgOne: LedgerLever;
      if (ldg.length > 0) {
        ldgOne = ldg[0];
        ldgOne.SellID = ask.id;
        ldgOne.SellPrice = ask.Price;
        ldgOne.GainLose = ( ldgOne.SellPrice - ldgOne.BuyPrice ) * ldgOne.ItemType * ldgOne.Lever * ldgOne.Qty;
        ldgOne.SellTime = ask.DealTime;
        return await this.jtable.Update(ldgOne);
      } else {
        const jt: JTable<AskTable> = new JTable(this.conn, "AskTable");
        const ans = await jt.getOne(SearchID);
        if (ans) {
          const Lever = ans.Lever ? ans.Lever : 0;
          ldgOne = {
            id: 0,
            UserID: ans.UserID,
            ItemID: ans.ItemID,
            ItemType: ans.ItemType,
            BuyID: ans.id,
            SellID: ask.id,
            Qty: ans.Qty,
            BuyPrice: ans.Price,
            SellPrice: ask.Price,
            Lever,
            GainLose: ( ask.Price - ans.Price ) * ans.ItemType * Lever * ans.Qty,
            BuyTime: ans.DealTime ? ans.DealTime : 0,
            SellTime: ask.DealTime ? ask.DealTime : 0,
          };
          return await this.jtable.Insert(ldgOne);
        } else {
          msg.ErrNo = ErrCode.DB_QUERY_ERROR;
          msg.ErrCon = "LedgerLever and Ask record not found!";
          return msg;
        }
      }
    } else {
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      msg.ErrCon = "LedgerLever record not found!";
      return msg;
    }

  }
  private async CreateNew(ask: AskTable): Promise<IMsg> {
    console.log("LedgerLeverAccess CreateNew", ask.SetID, ask.USetID);
    const ledger: LedgerLever = {
      id: 0,
      UserID: ask.UserID,
      ItemID: ask.ItemID,
      ItemType: ask.ItemType,
      BuyID: ask.id,
      BuyPrice: ask.Price,
      Qty: ask.Qty,
      Lever: ask.Lever as number,
      BuyTime: ask.DealTime as number,
    };
    return await this.jtable.Insert(ledger);
  }
}