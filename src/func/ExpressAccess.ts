import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PoolConnection } from "mariadb";
import StrFunc from "../components/class/Functions/MyStr";
import { ErrCode } from "../DataSchema/ENum";
import { AnyObject, IKeyVal, IMsg } from "../DataSchema/if";
import { AddAuthHeader } from "./ccfunc";
import { getConnection } from "./db";

export type GetPostFunction = (param: any, conn: PoolConnection) => Promise<IMsg>;
export default class ExpressAccess {
  protected getConnection = getConnection;
  protected msg: IMsg = {ErrNo: 0};
  public async process(req: Request, res: Response, f: GetPostFunction) {
     // params = req.query ? req.query : req.body;
    let params = this.combineParams({}, req.body);
    params = this.combineParams(params, req.query as IKeyVal);
    const conn: PoolConnection | undefined = await this.getConnection("ExpressAccess process");
    if (conn) {
      this.msg = await f(params, conn);
      await conn.release();
    } else {
      this.msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
      this.msg.ErrCon = "Get connection error!!";
    }
    /*
    const info: any = jwt.decode(String(req.headers.authorization));
    if (info) {
      // delete info.exp;
      res = AddAuthHeader(info as AnyObject, res);
    }
    */
    res.send(StrFunc.stringify(this.msg));
  }
  private combineParams(old: IKeyVal, add: IKeyVal): IKeyVal {
    if (!old) { old = {}; }
    /*
    if (add) {
      Object.keys(add).map((key) => {
        old[key] = add[key];
      });
    }
    */
    if (add) { Object.assign(old, add); }
    return old;
  }
}
