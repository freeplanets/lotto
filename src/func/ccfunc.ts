import { Response } from "express";
import jwt from "jsonwebtoken";
import { PoolConnection } from "mariadb";
import JTable from "../class/JTable";
import ATACreator from "../components/ATACreator";
import EmergencyClose from "../components/class/Ask/EmergencyClose";
import UserInfoCrypto from "../components/class/Ledger/UserInfoCrypto";
import Message from "../components/class/Message/Message";
import ReceiverManager from "../components/class/Order/ReceiverManager";
import MemberReport from "../components/class/Report/Member";
import wsclient from "../components/webSC";
import { ErrCode, StopType } from "../DataSchema/ENum";
import { AnyObject, AskTable, ChatMsg, HasUID, IHasID, IKeyVal, IMsg, Items, Lever, NoDelete, WebParams, WsMsg } from "../DataSchema/if";
import { AuthExpire, AuthKey, AuthLimit, JWT_KEY } from "../func/db";
import { GetPostFunction } from "./ExpressAccess";

interface IMyFunction<T> extends GetPostFunction {
  (param: T, conn: PoolConnection): IMsg;
}
export const f: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const msg: IMsg = {ErrNo: 0};
  msg.ErrCon = `id:${param.id} > ${conn.info?.status}`;
  await conn.release();
  return msg;
};
export const save: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = {ErrNo: 0};
  // console.log("savedata", param);
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
  // console.log("savedata", param);
  if (param.TableName && param.TableData) {
    const jt = new JTable(conn, param.TableName);
    if (typeof param.TableData === "string") {
      try {
        param.TableDatas = JSON.parse(param.TableData.replace(/\\/g, ""));
      } catch (err) {
        msg.ErrNo = ErrCode.MISS_PARAMETER;
        msg.ErrCon = "TableData parse error!!";
        return msg;
      }
    } else if (Array.isArray(param.TableData)) {
      param.TableDatas = (param.TableData as string[]).map((itm) => typeof(itm) === "string" ? JSON.parse(itm) : itm );
    }
    // console.log("savedata after chk:", param);
    if (param.TableDatas) {
      if (Array.isArray(param.TableDatas)) {
        // console.log("saveData isArray", param.TableDatas.length, param.TableDatas);
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
        } else if (param.Filter) {
          msg = await jt.Updates(param.TableDatas, param.Filter);
        } else {
          msg = await jt.Insert(param.TableDatas);
        }
      }
      if (param.EC) { // 緊急關閉
        const ec = new EmergencyClose(wsclient, conn);
        await ec.doit();
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
    // console.log("getdata:", param);
    let filters: string | IKeyVal | IKeyVal[] | undefined;
    if (Array.isArray(param.Filter)) {
      filters = param.Filter.map((itm) => {
        if (typeof(itm) === "string") {
          itm = JSON.parse(itm);
        }
        return itm;
      });
    } else {
      if (typeof(param.Filter) === "string") {
        const filter = `${param.Filter}`.replace(/\\/g, "");
        try {
          filters = JSON.parse(filter);
        } catch (err) {
          filters = filter;
        }
      }
    }
    // let jt: JTable<IHasID> | MemberReport;
    switch (param.TableName) {
      case "MemberReport":
        if (filters) {
          const mr: MemberReport = new MemberReport();
          msg = mr.getGainLose(filters, conn);
        } else {
          msg.ErrNo = ErrCode.MISS_PARAMETER;
        }
        break;
      // case "PriceTick":
      //  msg = getPriceTick(param, conn);
      //  break;
      default:
        const jt: JTable<IHasID> = new JTable(conn, param.TableName);
        msg = await jt.Lists(filters, param.Fields, param.orderField);
        // console.log("getData msg", msg);
    }
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
  // const Account = param.Account as string;
  // const sid = param.sid;
  if (!param.order) {
    msg.ErrNo = ErrCode.MISS_PARAMETER;
    msg.ErrCon = "No order found!!";
    return msg;
  }
  const order = param.order;
  // console.log("SendOrder order:", order);
  let Odr: HasUID = {
    id: order.id,
    UserID
  };
  if ( !order.ProcStatus || order.ProcStatus < 2) {
    if ( !order.BuyType ) {   // 買
      if ( !order.Amount || !order.AskPrice) {
        msg.ErrNo = ErrCode.MISS_PARAMETER;
        msg.ErrCon = "No Price found";
        return msg;
      }
    } else { // 賣
      if (!order.USetID) { // 非會員平倉單
        if ( !((order.Qty && !order.Amount) || (!order.Qty && order.Amount)) ) {
          msg.ErrNo = ErrCode.MISS_PARAMETER;
          msg.ErrCon = " Qty XOR Amount false!!";
          return msg;
        }
      }
    }
    const jt = new JTable<Items>(conn, "Items");
    const Item = await jt.getOne(order.ItemID);
    if (!Item) {
      msg.ErrNo = ErrCode.NO_DATA_FOUND;
      msg.ErrCon = "Item not found!!";
      return msg;
    }
    if (Item.isLoan) {
      let ST = StopType.LONG_STOP;
      if ( order.ItemType === -1 ) { ST = StopType.SHORT_STOP; }
      const isClosed: boolean = !!(Item.Closed & ST);
      if (isClosed) {
        let str = "short";
        if (ST === StopType.LONG_STOP ) { str = "long"; }
        msg.ErrNo = ErrCode.NUM_STOPED;
        msg.ErrCon = `Not accpet new ${str} order now!!`;
        return msg;
      }
    }
    const newOrder: AskTable = {
      id: order.id,
      UserID,
      UpId,
      CLevel: param.CLevel,
      ItemID: Item.id,
      ItemType: order.ItemType,
      Code: Item.Code,
      AskType: order.AskType,
      BuyType: order.BuyType,
      AskPrice: order.AskPrice,
      Amount: order.Amount,
      AskFee: 0,
      Price: 0,
      Qty: order.Qty ? order.Qty : 0,
      ProcStatus: 0,
    };
    if (order.USetID) {
      newOrder.USetID = order.USetID;
      newOrder.SetID = 0;
    }
    /*
    if (order.BuyType === 0) {
      newOrder.AskFee = Item.Type === 1 ? Item.OpenFee : Item.CloseFee;
    }
    */
    newOrder.AskFee = order.BuyType ? Item.CloseFee : Item.OpenFee;
    if (order.Lever) {
      if (Item.OneHand) {
        const onehand = (newOrder.Amount / newOrder.AskPrice) * order.Lever;
        if (onehand > Item.OneHand) {
          msg.ErrNo = ErrCode.OVER_MAX_HAND;
          msg.ErrCon = "Over onehand!";
          return msg;
        }
      }
      newOrder.Lever = order.Lever;
      if (order.GainPrice) { newOrder.GainPrice = order.GainPrice; }
      if (order.LosePrice) { newOrder.LosePrice = order.LosePrice; }
      const lvr = new JTable<Lever>(conn, "Lever");
      const leverParam: IKeyVal = {
        Multiples: order.Lever,
      };
      const lvAns = await lvr.getOne(leverParam);
      if (lvAns) {
        if (newOrder.BuyType === 0) {
          newOrder.AskFee = newOrder.ItemType === 1 ? lvAns.LongT : lvAns.ShortT;
        }
        newOrder.StopGain = Item.StopGain;
        newOrder.StopLose = Item.StopLose;
      } else {
        msg.ErrNo = ErrCode.NO_DATA_FOUND;
        msg.ErrCon = "No Lever data found";
        return msg;
      }
    }
    Odr = newOrder;
  } else {
    if (order.ProcStatus === 2 ) {
      Odr.isUserSettle = 1;
    } else {
      Odr.ProcStatus = order.ProcStatus;
    }
  }
  // console.log("before ModifyOrder:", JSON.stringify(Odr));
  msg = await ModifyOrder(Odr, conn);
  if (msg.ErrNo === ErrCode.PASS) {
      const wsmsg: WsMsg = Object.assign({}, msg);
      delete wsmsg.ErrNo;
      wsclient.Send(wsmsg);
    }

  return msg;
};
export const SendOrderNew: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = {};
  const Receiver: ReceiverManager = new ReceiverManager(conn, wsclient);
  msg = await Receiver.Process(param);
  // console.log("before ModifyOrder:", JSON.stringify(msg));

  if (msg.ErrNo === ErrCode.PASS) {
    const Odr = msg.data as HasUID;
    msg = await ModifyOrder(Odr, conn);
    if (msg.ErrNo === ErrCode.PASS) {
      const wsmsg: WsMsg = Object.assign({}, msg);
      delete wsmsg.ErrNo;
      wsclient.Send(wsmsg);
    }
  }
  return msg;
};
export const getOrder: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const UserID = param.UserID;
  const filter: IKeyVal[] = [];
  filter.push({ Key: "UserID", Val: UserID });
  filter.push({ Key: "ProcStatus", Val: 2, Cond: "<"});
  const jt: JTable<AskTable> = new JTable(conn, "AskTable");
  return await jt.Lists(filter);
};

export const DeleteOrder: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  let msg: IMsg = { ErrNo: ErrCode.PASS };
  if (param.AskID) {
    const table: NoDelete = {
      id: param.AskID as number,
      UserID: param.UserID,
      ProcStatus: 3,
    };
    msg = await ModifyOrder(table, conn);
    if (msg.ErrNo === ErrCode.PASS) {
      const wsmsg: WsMsg = Object.assign({}, msg);
      delete wsmsg.ErrNo;
      wsclient.Send(wsmsg);
    }
  } else {
    msg.ErrNo = ErrCode.MISS_PARAMETER;
    msg.ErrCon = "AskID not found!!";
  }
  return msg;
};
export const getLedgerInfo: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const UserID = param.UserID;
  const uic: UserInfoCrypto = new UserInfoCrypto(UserID, conn);
  return uic.getLedgerInfo();
};
export const getLedgerLeverInfo: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const UserID = param.UserID;
  const uic: UserInfoCrypto = new UserInfoCrypto(UserID, conn);
  return uic.getLedgerLever();
};
export const getLedgerDetail: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const UserID = param.UserID;
  const ItemID = param.ItemID as number;
  const uic: UserInfoCrypto = new UserInfoCrypto(UserID, conn);
  return uic.getLedgerDetail(ItemID);
};
export const ModifyOrder = async (ask: HasUID, conn: PoolConnection) => {
  const ata: ATACreator = new ATACreator(ask, conn, "AskTable");
  return ata.doit();
};
/*
export const getPriceTick: IMyFunction<WebParams> = async (param: WebParams, conn: PoolConnection) => {
  const code = param.code as string;
  const dealtime = param.DealTime as number;
  const gapMS = 3000;
  const filter: IKeyVal[] = [];
  filter.push({ Key: "code", Val: code });
  filter.push({ Key: "ticktime", Val: dealtime - gapMS , Val2: dealtime + gapMS, Cond: "BETWEEN"});
  const jt: JTable<PriceTick> = new JTable(conn, "PriceTick");
  return await jt.Lists(filter);
};
*/
export const sendMessage = async (param: WebParams, conn: PoolConnection) => {
  // const UserID = param.UserID;
  if (param.WsMsg) {
    try {
      // console.log("sendMessage wsmsg", param.WsMsg);
      const wsmsg: WsMsg = param.WsMsg;
      // console.log("sendMessage:", wsmsg);
      if (wsmsg.Message) {
        const chatMsg: ChatMsg = JSON.parse(wsmsg.Message) as ChatMsg;
        console.log("sendMessage chatMsg", chatMsg);
        const Msger: Message = new Message(chatMsg, conn);
        const msg = await Msger.Add();
        // console.log("sendMessage msg", msg);
        if (msg.ErrNo === ErrCode.PASS) {
          msg.MKey = Msger.MKey;
          if (!chatMsg.MKey) { chatMsg.MKey = Msger.MKey; }
          wsmsg.Message = JSON.stringify(chatMsg);
          wsclient.Send(wsmsg);
          return msg;
        }
      }
    } catch (err) {
      console.log("sendMessage error:", err);
    }
  }
  return { ErrNo: ErrCode.MISS_PARAMETER };
};
export const getEmergencyLog = async (conn: PoolConnection) => {
  const sql = "Select e.*, u.Account from EmergencyClose e left join User u on e.ModifyID = u.id order by e.ModifyTime desc limit 0,10";
};
export const AddAuthHeader = (obj: AnyObject, res: Response): Response => {
  const jsign = jwt.sign(obj, JWT_KEY, {expiresIn: AuthExpire});
  res.setHeader("AuthKey", AuthKey);
  res.setHeader("Authorization", jsign);
  res.setHeader("AuthLimit", AuthLimit);
  res.setHeader("Access-Control-Expose-Headers", "Authorization, AuthKey, AuthLimit");
  return res;
};
