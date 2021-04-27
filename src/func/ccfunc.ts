import {PoolConnection} from "mariadb";
import JTable from "../class/JTable";
import ErrCode from "../DataSchema/ErrCode";
import { AskTable, IKeyVal, IMsg, Items, WebParams } from "../DataSchema/if";
import { getUserCredit, ModifyCredit } from "../func/Credit";
import { GetPostFunction } from "./ExpressAccess";

interface IMyFunction<T> extends GetPostFunction {
  (param: T, conn: PoolConnection): IMsg;
}
export const f: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const msg: IMsg = {ErrNo: 0};
  msg.ErrCon = `id:${param.id} > ${conn.info?.status}`;
  conn.release();
  return msg;
};
export const savedata: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = {ErrNo: 0};
  if (param.TableName && param.TableData) {
    const jt = new JTable(conn, param.TableName);
    if (typeof param.TableData === "string") { param.TableDatas = JSON.parse(param.TableData.replace(/\\/g, "")); }
    if (param.TableDatas) {
      if (Array.isArray(param.TableDatas)) {
        console.log("saveData", param.TableDatas.length, param.TableDatas);
        msg = await jt.MultiInsert(param.TableDatas);
      } else {
        console.log("saveData", param.TableDatas);
        if (param.TableDatas.id) {
          msg = await jt.Update(param.TableDatas);
        } else {
          msg = await jt.Insert(param.TableDatas);
        }
      }
    }
  } else {
    msg.ErrNo = ErrCode.MISS_PARAMETER;
    msg.ErrCon = "Missing Table Name!!";
  }
  return msg;
};
export const getdata: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = {};
  if (param.TableName) {
    const jt = new JTable(conn, param.TableName);
    msg = await jt.Lists();
  } else {
    msg.ErrNo = ErrCode.MISS_PARAMETER;
    msg.ErrCon = "Missing Table Name!!";
  }
  return msg;
};

export const SendOrder: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = {};
  const UserID = param.UserID;
  const UpId = param.UpId as string;
  const Account = param.Account as string;
  const sid = param.sid;
  if (!param.order) {
    msg.ErrNo = ErrCode.MISS_PARAMETER;
    msg.ErrCon = "No order found!!";
    return msg;
  }
  const order = param.order;
  const jt = new JTable<Items>(conn, "Items");
  const Item = await jt.getOne(order.id);
  if (Item) {
    const newOrder: AskTable = {
      id: 0,
      UserID,
      ItemID: Item.id,
      Code: Item.Code,
      AskType: order.AskType,
      BuyType: order.BuyType,
      Qty: order.Qty,
      AskFee: Item.OpenFee,
    };
    if ((!order.Qty && !order.Amount ) || !order.Price) {
      msg.ErrNo = ErrCode.MISS_PARAMETER;
      msg.ErrCon = "No Price found";
      return msg;
    }
    const Amount = order.Amount ? order.Amount : order.Price * order.Qty;
    const credit = await getUserCredit(UserID, conn);
    if (credit && credit * 0.95 > Amount) {
      await conn.beginTransaction();
      newOrder.AskPrice = order.Price;
      newOrder.AskCredit = Amount;
      const cojt = new JTable<AskTable>(conn, "AskTable");
      msg = await cojt.Insert(newOrder);
      if (msg.ErrNo !== 0) {
        await conn.rollback();
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        return msg;
      }
      const AskID = msg.insertId as number;
      const mcAns = await ModifyCredit(UserID, Account, UpId, Amount * -1, sid, conn);
      if (!mcAns) {
        await conn.rollback();
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        return msg;
      } else {
        msg.balance = mcAns.balance;
      }
      await conn.commit();
      msg.data = await cojt.getOne(AskID);
    } else {
      msg.ErrNo = ErrCode.NO_CREDIT;
      msg.ErrCon = "No credit found";
    }
  } else {
    msg.ErrNo = ErrCode.NO_DATA_FOUND;
    msg.ErrCon = "Item not found!!";
  }
  return msg;
};

export const getOrder: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const msg: IMsg = {};
  const UserID = param.UserID;
  const filter: IKeyVal[] = [];
  filter.push({ Key: "UserID", Val: UserID });
  filter.push({ Key: "ProcStatus", Val: 1, Cond: "<="});
  const jt: JTable<AskTable> = new JTable(conn, "AskTable");
  return await jt.Lists(filter);
};
