import {PoolConnection} from "mariadb";
import JTable from "../class/JTable";
import wsclient from "../components/webSC";
import ErrCode from "../DataSchema/ErrCode";
import { AskTable, IKeyVal, IMsg, Items, NoDelete, WebParams } from "../DataSchema/if";
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
  const UpId = param.UpId as number;
  const Account = param.Account as string;
  // const sid = param.sid;
  if (!param.order) {
    msg.ErrNo = ErrCode.MISS_PARAMETER;
    msg.ErrCon = "No order found!!";
    return msg;
  }
  const order = param.order;
  if ( !order.Amount || !order.Price) {
    msg.ErrNo = ErrCode.MISS_PARAMETER;
    msg.ErrCon = "No Price found";
    return msg;
  }
  const jt = new JTable<Items>(conn, "Items");
  const Item = await jt.getOne(order.id);
  if (Item) {
    const newOrder: AskTable = {
      id: 0,
      UserID,
      UpId,
      ItemID: Item.id,
      Code: Item.Code,
      AskType: order.AskType,
      BuyType: order.BuyType,
      Amount: order.Amount,
      AskFee: Item.OpenFee,
    };
    const credit = await getUserCredit(UserID, conn);
    if (credit > newOrder.Amount) {
      await conn.beginTransaction();
      newOrder.AskPrice = order.Price;
      // newOrder.AskCredit = Amount;
      newOrder.Fee = newOrder.AskFee * newOrder.Amount;
      newOrder.Credit = newOrder.Amount + newOrder.Fee;
      const cojt = new JTable<AskTable>(conn, "AskTable");
      msg = await cojt.Insert(newOrder);
      if (msg.ErrNo !== 0) {
        await conn.rollback();
        msg.ErrNo = ErrCode.DB_QUERY_ERROR;
        return msg;
      }
      const AskID = msg.insertId as number;
      const ts = new Date().getTime();
      const mcAns = await ModifyCredit(UserID, Account, UpId, newOrder.Credit * -1, `${ts}ts${UserID}`, conn);
      if (!mcAns) {
        await conn.rollback();
        msg.ErrNo = ErrCode.NO_CREDIT;
        return msg;
      } else {
        msg.balance = mcAns.balance;
      }
      await conn.commit();
      msg.data = await cojt.getOne(AskID);
      if (wsclient.isConnected) {
        if (msg.data) {
          wsclient.Send(JSON.stringify(msg.data));
        }
      }
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
  filter.push({ Key: "ProcStatus", Val: 2, Cond: "<="});
  const jt: JTable<AskTable> = new JTable(conn, "AskTable");
  return await jt.Lists(filter);
};

export const DeleteOrder: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = {};
  if (param.AskID) {
    const table: NoDelete = {
      id: param.AskID as number,
      ProcStatus: 3,
    };
    const jt: JTable<NoDelete> = new JTable(conn, "AskTable");
    msg = await jt.Update(table);
    if (msg.ErrNo === 0) {
      const ans = await jt.getOne(table.id);
      if (ans) {
        if (wsclient.isConnected) {
          console.log("Send", JSON.stringify(ans));
          wsclient.Send(JSON.stringify(ans));
        } else {
          console.log("wsclinet gone away...", wsclient.isConnected);
        }
      }
    }
  } else {
    msg.ErrNo = ErrCode.MISS_PARAMETER;
    msg.ErrCon = "AskID not found!!";
  }
  return msg;
};

export const ModifyOrder = async (ask:AskTable, conn: PoolConnection) => {
  let msg: IMsg = {};
  if(ask.ProcStatus === 2 && ask.Amount && ask.AskType === 0){
    const credit = await getUserCredit(ask.UserID, conn);
    ask.Fee = ask.AskFee * ask.Amount;
    ask.Credit = ask.Amount + ask.Fee;  
    if (credit < (ask.Amount+ask.Fee)) {
      msg.ErrNo = ErrCode.NO_CREDIT;
      msg.ErrCon = "No credit found";
      return;
    }
  }

  await conn.beginTransaction();
  const cojt = new JTable<AskTable>(conn, "AskTable");
  if(ask.ProcStatus === 0){
    msg = await cojt.Insert(ask);   
  } else {
    msg = await cojt.Update(ask);
  }
  if (msg.ErrNo !== 0) {
    await conn.rollback();
    msg.ErrNo = ErrCode.DB_QUERY_ERROR;
    return msg;
  }

  const ts = new Date().getTime();
  const mcAns = await ModifyCredit(UserID, Account, UpId, newOrder.Credit * -1, `${ts}ts${UserID}`, conn);
  if (!mcAns) {
    await conn.rollback();
    msg.ErrNo = ErrCode.NO_CREDIT;
    return msg;
  } else {
    msg.balance = mcAns.balance;
  }
  await conn.commit();
  msg.data = await cojt.getOne(AskID);
  if (wsclient.isConnected) {
    if (msg.data) {
      wsclient.Send(JSON.stringify(msg.data));
    }
  }
  return msg;
};
