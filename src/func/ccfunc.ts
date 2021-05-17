import { PoolConnection } from "mariadb";
import JTable from "../class/JTable";
import ATACreator from "../components/ATACreator";
import wsclient from "../components/webSC";
import ErrCode from "../DataSchema/ErrCode";
import { AskTable, IHasID, IKeyVal, IMsg, Items, NoDelete, WebParams } from "../DataSchema/if";
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
export const save: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = {ErrNo: 0};
  console.log("savedata", param);
  if (param.TableName && param.TableData) {
    const jt = new JTable(conn, param.TableName);
    if (typeof param.TableData === "string") {
      param.TableDatas = JSON.parse(param.TableData.replace(/\\/g, ""));
    }
    if (param.TableDatas) {
      if (Array.isArray(param.TableDatas)) {
        // console.log("saveData", param.TableDatas.length, param.TableDatas);
        msg = await jt.MultiInsert(param.TableDatas);
      } else {
        // console.log("saveData", param.TableDatas);
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
export const savedata: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = {ErrNo: 0};
  console.log("savedata", param);
  if (param.TableName && param.TableData) {
    const jt = new JTable(conn, param.TableName);
    if (typeof param.TableData === "string") {
      param.TableDatas = JSON.parse(param.TableData.replace(/\\/g, ""));
    }
    if (param.TableDatas) {
      if (Array.isArray(param.TableDatas)) {
        // console.log("saveData", param.TableDatas.length, param.TableDatas);
        // msg = await jt.MultiInsert(param.TableDatas);
        param.TableDatas.forEach(async (itm) => {
          if (itm.id) {
            msg = await jt.Update(itm);
          } else {
            msg = await jt.Insert(itm);
          }
        });
      } else {
        // console.log("saveData", param.TableDatas);
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
    msg = await ModifyOrder(newOrder, conn);
    if (msg.ErrNo === ErrCode.PASS) {
      if (wsclient.isConnected) {
        if (msg.data) {
          wsclient.Send(JSON.stringify(msg.data));
        }
      }
    }
  } else {
    msg.ErrNo = ErrCode.NO_DATA_FOUND;
    msg.ErrCon = "Item not found!!";
  }
  return msg;
};

export const getOrder: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const msg: IMsg = { ErrNo: ErrCode.PASS };
  const UserID = param.UserID;
  const filter: IKeyVal[] = [];
  filter.push({ Key: "UserID", Val: UserID });
  filter.push({ Key: "ProcStatus", Val: 2, Cond: "<="});
  const jt: JTable<AskTable> = new JTable(conn, "AskTable");
  return await jt.Lists(filter);
};

export const DeleteOrder: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = { ErrNo: ErrCode.PASS };
  if (param.AskID) {
    const table: NoDelete = {
      id: param.AskID as number,
      ProcStatus: 3,
    };
    msg = await ModifyOrder(table, conn);
    if (msg.ErrNo === ErrCode.PASS) {
      if (msg.data) {
        if (wsclient.isConnected) {
          console.log("Send", JSON.stringify(msg.data));
          wsclient.Send(JSON.stringify(msg.data));
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

export const ModifyOrder = async (ask: IHasID, conn: PoolConnection) => {
  const ata: ATACreator = new ATACreator(ask, conn, "AskTable");
  return ata.doit();
};
