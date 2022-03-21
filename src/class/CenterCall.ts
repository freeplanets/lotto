import {PoolConnection} from "mariadb";
import {createTerms} from "../API/ApiFunc";
import JDate from "../class/JDate";
import {IMsg} from "../DataSchema/if";
import {IBroadCasts, IGame, ITerms} from "../DataSchema/user";
import JTable from "./JTable";
import {CancelTerm, SaveNums} from "./Settlement";

export interface IFromCenter {
  issueno: string;  // 彩期編號 '20200702089',
  lrid: string; // 彩期中心代號 '1420082',
  openbet: string; // 自動開盤 'true',
  lastresultissue: string; // 上期編號'20200702087',
  op: string; // 功能代號 'issue',
  Method: string; // web 接收方式 'POST',
  lottoid?: string;  // 遊戲代號 '37',
  drawtime?: string; // 開獎時間 '2020-07-02 14:50:00',
  setdate?: string;  // 立帳時期 '2020-07-02',
  result: string;  // '04,35,02,21,34,01',
  result2?: string; // '40',
  gettime?: string; // '2020-07-02 14:31:11',
  memo?: string; // 'macau.mark6',
}

export default class CenterCall {
  private msg: IMsg = {ErrNo: 0};
  private Dt = JDate;
  private createTerms = createTerms;
  private doSettle = SaveNums;
  private cancelTerm = CancelTerm;
  constructor(private param: IFromCenter, private conn: PoolConnection) {}
  public async issue() {
    const param = this.param;
    const conn = this.conn;
    // console.log("issue", param);
    const game: JTable<IGame> = new JTable(conn, "Games");
    if (param.lottoid) {
      const term: ITerms = this.Term;
      const gInfo = await game.getOne(parseInt(param.lottoid, 10));
      // console.log("issue", gInfo);
      if (gInfo) {
        term.GameID = gInfo.id;
        term.TermID = param.issueno;
        const tmp: string[] | undefined = param.drawtime?.split(" ");
        if (tmp) {
          term.PDate = tmp[0];
          term.PTime = tmp[1];
        }
        const sec = gInfo.StopBeforeEnd ? -1 * gInfo.StopBeforeEnd : -20;
        term.StopTimeS = this.Dt.timeMoveSec(term.PTime, sec);
        term.StopTime = term.StopTimeS;
        term.lrid = parseInt(param.lrid, 10);
        // console.log("issue term", term);
        if (!param.issueno) {
          this.msg.ErrNo = 9;
          this.msg.ErrCon = "issueno is empty!!";
        } else {
          this.msg = await this.createTerms(gInfo.GType, term, conn);
        }
      } else {
        this.msg.ErrNo = 10;
        this.msg.ErrCon = `lottoid:${param.lottoid} Game not found!!`;
      }
    } else {
      this.msg.ErrNo = 9;
      this.msg.ErrCon = "lottoid is missing!!";
    }
    return this.msg;
  }
  public async result() {
    const param = this.param;
    const conn = this.conn;
    if (param.lottoid) {
      const jt: JTable<ITerms> = new JTable(conn, "Terms");
      const filter = {
        GameID: param.lottoid,
        lrid: param.lrid
      };
      const term: ITerms|undefined = await jt.getOne(filter);
      if (term) {
          if (!term.isCanceled) {
            if (param.result2) {  // 台灣賓果多送特碼
              const aryNum = param.result.split(',');
              if (aryNum[aryNum.length -1] === param.result2) {
                param.result2 = '';
              }
            }
            const num: string = param.result + (param.result2 ? "," + param.result2 : "");
            const ans = await this.doSettle(term.id, term.GameID, num, conn, term.isSettled);
            if (!ans) {
              this.msg.ErrNo = 9;
              this.msg.ErrCon = "Settle failed!!";
            }
          } else {
            this.msg.ErrNo = 9;
            this.msg.ErrCon = `lottoid:${param.lottoid} issueno:${param.issueno} is canceled!!`;
          }
      } else {
        this.msg.ErrNo = 9;
        this.msg.ErrCon = `lottoid:${param.lottoid} Term is not found!!`;
      }
    } else {
      this.msg.ErrNo = 9;
      this.msg.ErrCon = "lottoid is missing!!";
    }
    return this.msg;
  }
  public async updateresult() {
    return await this.result();
  }
  public async broadcast() {
    const param = this.param;
    const conn = this.conn;
    if (param.lottoid) {
      if (!param.memo) {
        this.msg.ErrNo = 9;
        this.msg.ErrCon = "memo is empty!!";
      } else {
        const bc: IBroadCasts = {
          id: 0,
          GameID: parseInt(param.lottoid, 10),
          lrid: parseInt(param.lrid, 10),
          memo: param.memo
        };
        const jt: JTable<IBroadCasts> = new JTable(conn, "BroadCasts");
        const ans = await jt.Insert(bc);
        if (!ans) {
          this.msg.ErrNo = 9;
          this.msg.ErrCon = "BroadCasts failed!!";
        }
      }
    } else {
      this.msg.ErrNo = 9;
      this.msg.ErrCon = "lottoid is missing!!";
    }
    return this.msg;
  }
  public async cancel() {
    const param = this.param;
    const conn = this.conn;
    if (param.lottoid) {
      const GameID = parseInt(param.lottoid, 10);
      const lrid = parseInt(param.lrid, 10);
      const jt: JTable<ITerms> = new JTable(conn, "Terms");
      const filter = {
        GameID,
        lrid
      };
      const term: ITerms|undefined = await jt.getOne(filter);
      if (term) {
        this.msg = await this.cancelTerm(term.id, conn);
      } else {
        this.msg.ErrNo = 9;
        this.msg.ErrCon = `Term not found lottoid=${GameID},lrid=${lrid}`;
      }
    } else {
      this.msg.ErrNo = 9;
      this.msg.ErrCon = "lottoid is missing!!";
    }
    return this.msg;
  }
  public async updateissue() {
    const param = this.param;
    const conn = this.conn;
    if (param.lottoid) {
      const GameID = parseInt(param.lottoid, 10);
      const lrid = parseInt(param.lrid, 10);
      const jt: JTable<ITerms> = new JTable(conn, "Terms");
      const filter = {
        GameID,
        lrid
      };
      const term: ITerms|undefined = await jt.getOne(filter);
      if (term) {
        term.TermID = param.issueno;
        const ans = await jt.Update(term);
        if (!ans) {
          this.msg.ErrNo = 9;
          this.msg.ErrCon = `Issue update failed, lottoid=${GameID},lrid=${lrid},issueno=${param.issueno}`;
        }
      } else {
        this.msg.ErrNo = 9;
        this.msg.ErrCon = `Term not found lottoid=${GameID},lrid=${lrid}`;
      }
    } else {
      this.msg.ErrNo = 9;
      this.msg.ErrCon = "lottoid is missing!!";
    }
    return this.msg;
  }
  get Term(): ITerms {
    const term: ITerms = {
      id: 0,
      GameID: 0,
      PDate: "",
      PTime: "",
      TermID: "",
      StopTime: "",
      StopTimeS: "",
      ModifyID: 0
    };
    return term;
  }
}
