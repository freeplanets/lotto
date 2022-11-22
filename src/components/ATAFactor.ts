import { PoolConnection } from "mariadb";
import { AskTable, HasUID } from "../DataSchema/if";
import { getConnection } from "../func/db";
import ATACreator from "./ATACreator";
import AskTableAccess from "./class/Ask/AskTableAccess";

export default class ATAFactor {
  private conn: PoolConnection| undefined;
  public async getATA(ask: AskTable, SettleServiceID?: number): Promise<AskTableAccess<HasUID>> {
    if (!this.conn) {
      // console.log("ATAFactor create conn:");
      this.conn = await getConnection("ATAFactor getATA");
    } else if (!this.conn.isValid()) {
      console.log("ATAFactor recreate conn:");
      await this.conn.release();
      this.conn = await getConnection("ATAFactor getATA again");
    }
    if (this.conn) {
      return new ATACreator(ask, this.conn, "AskTable", SettleServiceID).getATA();
    } else {
      console.log("ATAFactor no conn");
      return this.getATA(ask, SettleServiceID);
    }
  }
}
