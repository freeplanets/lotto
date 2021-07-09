import { PoolConnection } from "mariadb";
import { HasUID, IMsg } from "../DataSchema/if";
import AskTableAccess from "./class/Ask/AskTableAccess";
import DealOrder from "./class/Ask/DealOrder";
import DeleteOrder from "./class/Ask/DeleteOrder";
import NewOrder from "./class/Ask/NewOrder";

export default class ATACreator {
  private ATA: AskTableAccess<HasUID>;
  private checkName: string;
  constructor(ask: HasUID, conn: PoolConnection, tableName: string) {
    switch (ask.ProcStatus) {
      case 2: // 成交後處理
        this.ATA = new DealOrder(ask, conn, tableName);
        this.checkName = "DealOrder";
        break;
      case 3: // 刪除
        this.ATA = new DeleteOrder(ask, conn, tableName);
        this.checkName = "DeleteOrder";
        break;
      default: // 新單
        this.ATA = new NewOrder(ask, conn, tableName);
        this.checkName = "NewOrder";
    }
  }
  public getATA() {
    return this.ATA;
  }
  public async doit(): Promise<IMsg> {
    const msg: IMsg = await this.ATA.doit();
    msg.checkName = this.checkName;
    return msg;
  }
}
