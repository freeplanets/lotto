import { PoolConnection } from "mariadb";
import { HasUID, IMsg } from "../DataSchema/if";
import AskTableAccess from "./class/AskTableAccess";
import DealOrder from "./class/DealOrder";
import DeleteOrder from "./class/DeleteOrder";
import NewOrder from "./class/NewOrder";

export default class ATACreator {
  private ATA: AskTableAccess<HasUID>;
  constructor(ask: HasUID, conn: PoolConnection, tableName: string) {
    switch (ask.ProcStatus) {
      case 2: // 成交後處理
        this.ATA = new DealOrder(ask, conn, tableName);
        break;
      case 3: // 刪除
        this.ATA = new DeleteOrder(ask, conn, tableName);
        break;
      default: // 新單
        this.ATA = new NewOrder(ask, conn, tableName);
    }
  }
  public getATA() {
    return this.ATA;
  }
  public async doit(): Promise<IMsg> {
    return await this.ATA.doit();
  }
}
