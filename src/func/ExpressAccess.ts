import { Request, Response } from "express";
import { Pool, PoolConnection } from "mariadb";
import { ErrCode } from "../DataSchema/ENum";
import {IKeyVal, IMsg} from "../DataSchema/if";
import {getConnection} from "./db";
export type GetPostFunction = (param: any, conn: PoolConnection) => Promise<IMsg>;
export default class ExpressAccess {
  protected getConnection = getConnection;
  protected msg: IMsg = {ErrNo: 0};
  constructor(private pool: Pool) {
  }
  public async process(req: Request, res: Response, f: GetPostFunction) {
     // params = req.query ? req.query : req.body;
    let params = this.combineParams({}, req.body);
    params = this.combineParams(params, req.query as IKeyVal);
    const conn: PoolConnection | undefined = await this.getConnection(this.pool);
    if (conn) {
      this.msg = await f(params, conn);
      conn.release();
    } else {
      this.msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
      this.msg.ErrCon = "Get connection error!!";
    }
    res.send(JSON.stringify(this.msg));
  }
  private combineParams(old: IKeyVal, add: IKeyVal): IKeyVal {
    if (!old) { old = {}; }
    if (add) {
      Object.keys(add).map((key) => {
        old[key] = add[key];
      });
    }
    return old;
  }
}
