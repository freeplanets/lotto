import { AskTable, HasUID } from "../DataSchema/if";
import { getConnection } from "../func/db";
import ATACreator from "./ATACreator";
import AskTableAccess from "./class/Ask/AskTableAccess";

export default class ATAFactor {
  public async getATA(ask: AskTable): Promise<AskTableAccess<HasUID>> {
    const conn = await getConnection();
    if (conn) {
      return new ATACreator(ask, conn, "AskTable").getATA();
    } else {
      return this.getATA(ask);
    }
  }
}
