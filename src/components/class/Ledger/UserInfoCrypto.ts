import { PoolConnection } from "mariadb";
import JTable from "../../../class/JTable";
import { ErrCode } from "../../../DataSchema/ENum";
import { AskTable, IKeyVal, IMsg, Ledger, LedgerLever, LedgerTotal} from "../../../DataSchema/if";
import { getUserCredit } from "../../../func/Credit";
import FuncDate from "../Functions/MyDate";

export default class UserInfoCrypto {
  constructor(private UserID, private conn: PoolConnection) {
    if (typeof UserID !== "number") { this.UserID = parseInt(UserID, 10); }
  }
  public async getOrder(): Promise<IMsg> {
    const filter: IKeyVal[] = [];
    filter.push({ Key: "UserID", Val: this.UserID });
    filter.push({ Key: "ProcStatus", Val: 2, Cond: "<"});
    const jt: JTable<AskTable> = new JTable(this.conn, "AskTable");
    return await jt.Lists(filter);
  }
  public async getLedger(): Promise<IMsg> {
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    const filter: IKeyVal = {
      Key: "UserID",
      Val: this.UserID
    };
    const jt: JTable<LedgerTotal> = new JTable(this.conn, "LedgerTotal");
    const ans = await jt.Lists(filter);
    if (ans) {
      msg.data = ans.data;
    } else {
      msg.ErrNo = ErrCode.NO_DATA_FOUND;
    }
    return msg;
  }
  public async getLedgerDetail(itemid: number): Promise<IMsg> {
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    const filter: IKeyVal[] = [
      {
        Key: "UserID",
        Val: this.UserID
      },
      {
        Key: "ItemID",
        Val: itemid
      },
      {
        Key: "CreateTime",
        Val: FuncDate.dayDiff(7),
        Val2: `${FuncDate.dayDiff(0)} 23:59:59`,
        Cond: "Between",
      }
    ] ;
    const jt: JTable<Ledger> = new JTable(this.conn, "Ledger");
    const ans = await jt.Lists(filter, "", "CreateTime desc");
    if (ans) {
      msg.data = ans.data;
    } else {
      msg.ErrNo = ErrCode.NO_DATA_FOUND;
    }
    return msg;
  }
  public async getLedgerLever(): Promise<IMsg> {
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    const filter: IKeyVal[] = [];
    const filter1: IKeyVal = {
      Key: "UserID",
      Val: this.UserID
    };
    filter.push(filter1);
    const filter2: IKeyVal = {
      Key: "SellTime",
      Val: FuncDate.dayDiffTS(7),
      Val2: FuncDate.dayDiffTS(0),
      Cond: "Between",
    };
    filter.push(filter2);
    const jt: JTable<LedgerLever> = new JTable(this.conn, "LedgerLever");
    let ans = await jt.Lists(filter, "", "SellTime desc");
    if (ans) {
      if (ans.data && (ans.data as any[]).length < 10 ) {
        ans = await jt.Lists(`${filter1.Key} = ${filter1.Val}`, "", "SellTime desc limit 0, 10");
      }
      msg.data = ans.data;
    } else {
      msg.ErrNo = ErrCode.NO_DATA_FOUND;
    }
    return msg;
  }
  public async getCredit(): Promise<number> {
    return await getUserCredit(this.UserID, this.conn);
  }
  public async getLedgerInfo(): Promise<IMsg> {
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    let ans: IMsg = await this.getOrder();
    if (ans.ErrNo === ErrCode.PASS) {
      if (ans.data) {
        msg.Asks = ans.data as AskTable[];
      }
    }
    ans = await this.getLedger();
    if (ans.ErrNo === ErrCode.PASS ) {
      if (ans.data) {
        msg.LedgerTotal = ans.data;
      }
    }
    msg.Balance = await this.getCredit();
    // console.log("getLedgerLever:", msg);
    /*
    ans = await this.getLedgerLever();
    if (ans.ErrNo === ErrCode.PASS) {
      if (ans.data) {
        msg.LedgerLever = ans.data;
      }
    }
    msg.balance = await this.getCredit();
    */
    return msg;
  }
}
