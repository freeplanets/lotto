import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, IKeyVal, IMsg, LedgerLever } from "../../../DataSchema/if";
import Member from "../GainLose/Member";
import ALedger from "./ALedger";

export default class LedgerLeverAccess extends ALedger<LedgerLever> {
  private MGL: Member;
  constructor(conn: PoolConnection, tablename: string) {
    super(conn, tablename);
    this.MGL = new Member(conn);
  }
  public async add(ask: AskTable): Promise<IMsg> {
    // console.log("LedgerLeverAccess add:", ask.id, ask.SetID, ask.USetID);
    let  msg: IMsg = { ErrNo: ErrCode.PASS };
    if (ask.USetID || ask.SetID) {
      msg = await this.SettleOne(ask);
    }
    return msg;
    /*
    else {
      return await this.CreateNew(ask);
    }
    */
  }
  private async SettleOne(ask: AskTable): Promise<IMsg> {
    // console.log("LedgerLeverAccess SettleOne", ask.SetID, ask.USetID);
    let msg: IMsg = { ErrNo: ErrCode.PASS };
    let SearchID = ask.SetID ? ask.SetID : 0;
    if (ask.USetID) { SearchID = ask.USetID; }
    const kv: IKeyVal = {
      Key: "BuyID",
      Val: SearchID,
    };
    const ldg: LedgerLever[] | undefined = await this.jtable.List(kv);
    // console.log("SettleOne", JSON.stringify(kv), JSON.stringify(ldg), JSON.stringify(ask));
    let ldgOne: LedgerLever | undefined;
    if (ldg) {
      // console.log("LedgerLeverAccess SettleOne chk1");
      if (ldg.length > 0) {
        ldgOne = ldg[0];
        ldgOne.SellID = ask.id;
        ldgOne.SellPrice = ask.Price;
        ldgOne.GainLose = ( ldgOne.SellPrice - ldgOne.BuyPrice ) * ldgOne.ItemType * ldgOne.Lever * ldgOne.Qty;
        ldgOne.TFee = ask.TFee,
        ldgOne.SellFee = ask.Fee,
        ldgOne.SellTime = ask.DealTime;
        msg = await this.jtable.Update(ldgOne);
      } else {
        // console.log("LedgerLeverAccess SettleOne chk2");
        const jt: JTable<AskTable> = new JTable(this.conn, "AskTable");
        const ans = await jt.getOne(SearchID);
        if (ans) {
          const Lever = ans.Lever ? ans.Lever : 1;
          ldgOne = {
            id: 0,
            UserID: ans.UserID,
            UpId: ans.UpId,
            ItemID: ans.ItemID,
            ItemType: ans.ItemType,
            BuyID: ans.id,
            SellID: ask.id,
            Qty: ans.Qty,
            BuyPrice: ans.Price,
            SellPrice: ask.Price,
            BuyFee: ans.Fee ? ans.Fee : 0,
            SellFee: ask.Fee,
            TFee: ask.TFee,
            Lever,
            GainLose: ( ask.Price - ans.Price ) * ans.ItemType * Lever * ans.Qty,
            BuyTime: ans.DealTime ? ans.DealTime : 0,
            SellTime: ask.DealTime ? ask.DealTime : 0,
          };
          msg = await this.MGL.add(ldgOne);
          if (msg.ErrNo === ErrCode.PASS) {
            msg = await this.jtable.Insert(ldgOne);
          }
        } else {
          msg.ErrNo = ErrCode.DB_QUERY_ERROR;
          msg.ErrCon = "LedgerLever and Ask record not found!";
        }
      }
    } else {
      msg.ErrNo = ErrCode.DB_QUERY_ERROR;
      msg.ErrCon = "LedgerLever record not found!";
    }
    if (ldgOne && ldgOne.GainLose) {
      msg.Credit = (ask.LeverCredit || 0) + (ask.ExtCredit || 0) + ldgOne.GainLose;
    }
    return msg;
  }
  private async CreateNew(ask: AskTable): Promise<IMsg> {
    // console.log("LedgerLeverAccess CreateNew", ask.SetID, ask.USetID);
    const ledger: LedgerLever = {
      id: 0,
      UserID: ask.UserID,
      UpId: ask.UpId,
      ItemID: ask.ItemID,
      ItemType: ask.ItemType,
      BuyID: ask.id,
      BuyPrice: ask.Price,
      BuyFee: ask.Fee ? ask.Fee : 0,
      Qty: ask.Qty,
      Lever: ask.Lever as number,
      BuyTime: ask.DealTime as number,
    };
    return await this.jtable.Insert(ledger);
  }
}
