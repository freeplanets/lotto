import { PoolConnection } from "mariadb";
import JTable from "../../class/JTable";
import ErrCode from "../../DataSchema/ErrCode";
import { AskTable, IKeyVal, IMsg, LedgerLever, LedgerTotal} from "../../DataSchema/if";
import { getUserCredit } from "../../func/Credit";

export default class UserInfoCrypto {
  constructor(private UserID, private conn: PoolConnection) {}
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
  public async getLedgerLever(): Promise<IMsg> {
    const msg: IMsg = { ErrNo: ErrCode.PASS };
    const filter: IKeyVal = {
      Key: "UserID",
      Val: this.UserID
    };
    const jt: JTable<LedgerLever> = new JTable(this.conn, "LedgerLever");
    const ans = await jt.Lists(filter);
    if (ans) {
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
        msg.Asks = ans.data;
      }
    }
    ans = await this.getLedger();
    if (ans.ErrNo === ErrCode.PASS ) {
      if (ans.data) {
        msg.LedgerTotal = ans.data;
      }
    }
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
