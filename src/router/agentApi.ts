import express, { Request, Response, Router } from "express";
import {Connection} from "mariadb";
import { userInfo } from "os";
import EDS from "../class/EncDecString";
import {IDbAns, IGameAccessParams, IMsg} from "../DataSchema/if";
import {IUser} from "../DataSchema/user";
import dbPool from "../db";
import {ModifyCredit} from "../func/Credit";

interface IAnsData {
    code: number;
    fullUrl?: string; // :"http://<server>?userCode=10001&token=FBE54A7273EE4F15B363C3F98F32B19F&lang=zh-CN&gameId=0",
    token?: string;  // "FBE54A7273EE4F15B363C3F98F32B19F",
    path?: string;   // "http://<server2>,http:/11 / 45 /<server3>,http://<server4>"
    money?: string;  // "100.81",
    freeMoney?: string;  // "100.56"
    [key: string]: string|number|object|undefined;
}
let defaultUrl = "http://localhost:8080";
if (process.env.NODE_ENV !== "development") {
    defaultUrl = "http://lotocm.uuss.net";
}
const memberUrl: string = defaultUrl;
const staytime: number = 3000;   // sec
const agentApi: Router = express.Router();
agentApi.get("/1", async (req: Request, res: Response) => {
    const params = req.query;
    console.log("agentApi/1 :", params);
    const msg: IMsg = {ErrNo: 0};
    const data: IAnsData = {code: 0};
    const conn = await dbPool.getConnection();
    const Agent: IUser = await getAgent(params.agentId, conn);
    console.log("agent Api /1", Agent);
    if (Agent.DfKey) {
        const eds = new EDS(Agent.DfKey);
        const param = decParam(eds.Decrypted(params.param));
        console.log("agentApi/1 param:", param);
        const ans: boolean = await addUser(params.agentId, Agent.PayClassID, param, conn);
        // console.log("after addUser:", ans);
        if (ans) {
            msg.ErrCon = "ok!!";
            const Ans: any = await getUser(param.userCode, params.agentId, conn);
            if (Ans) {
                const usr = Ans as IUser;
                let skey: string = eds.KeyString;
                const ans1 = await addLoginInfo(usr.id, usr.Account, params.agentId, skey, conn);
                if (ans1) {
                    if (typeof(ans1) === "object") {
                        if (ans1.logkey) { skey = ans1.logkey; }
                    }
                    data.fullUrl = `${memberUrl}?userCode=${usr.Account}&token=${skey}&lang=${param.lang}`;
                    data.token = skey;
                    msg.data = data;
                }
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Member not found!!";
                msg.param = param;
                msg.params = param;
                msg.Agent = Agent;
            }
        } else {
            msg.ErrCon = param;
        }
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Agent not found!!";
    }
    conn.release();
    res.send(JSON.stringify(msg));
});
agentApi.get("/memberlogin", async (req: Request, res: Response) => {
    const param = req.query;
    console.log("memberlogin", param);
    const conn = await dbPool.getConnection();
    const msg: IMsg = {ErrNo: 0};
    const login = await getUserLogin(param.Account, param.token, conn);
    if (login) {
        const User: IUser | boolean = await getUser(param.Account, login.AgentID, conn);
        if (User) {
            msg.data = User as IUser;
        }
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Error: Member not found!!";
    }
    conn.release();
    res.send(JSON.stringify(msg));
});
agentApi.get("/3", async (req: Request, res: Response) => {
    await CreditAC(req, res, 3);
});
agentApi.get("/4", async (req: Request, res: Response) => {
    await CreditAC(req, res, 4);
});
agentApi.get("/logHandle", async (req: Request, res: Response) => {
    await getTicketDetail(req, res);
});
async function CreditAC(req: Request, res: Response, ac: number) {
    const params = req.query;
    const conn = await dbPool.getConnection();
    console.log(`agentApi/${ac} param:`, params);
    const msg: IMsg = {ErrNo: 0};
    const data: IAnsData = {code: 0};
    data.tradeType = (ac === 3 ? 1 : 2);
    const Agent: IUser = await getAgent(params.agentId, conn);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    console.log("agentApi/1 param:", param);
    const noUser: IUser | boolean = await getUser(param.userCode, params.agentId, conn) as IUser;
    if (noUser) {
        data.code = 9;
        msg.data = data;
        msg.ErrNo = 9;
        msg.ErrCon = "No user found!!";
    } else {
        const user = noUser as IUser;
        const money: number = parseInt(param.money as string, 10);
        const key: number = (ac === 3 ? 1 : -1);
        const ans = await ModifyCredit(user.id, user.Account, params.agentId,
            money * key, param.orderId as string, conn);
        if (ans) {
            data.money = ans.balance + "";
            data.freeMoney = ans.balance + "";
            data.orderMoney = money + "";
        } else {
            data.status = 2;
        }
        msg.data = data;
    }
    conn.release();
    res.send(JSON.stringify(msg));
}
async function getAgent(id: string, conn: Connection) {
    const sql: string = "select * from User where id=?";
    console.log("getAgent:", sql);
    const row = await conn.query(sql, [id]);
    return row[0];
}
function decParam(param: string): IGameAccessParams {
    const gap: IGameAccessParams = {
        ac: "1",
        userCode: "",
        ip: ""
    };
    const tmp = param.split("&");
    tmp.map((itm) => {
        const p = itm.split("=");
        gap[p[0]] = p[1];
    });
    return gap;
}
async function addUser(AgentId: string, PayClassID: number, param: IGameAccessParams, conn: Connection): Promise<boolean> {
    if (!param.userCode) {
        console.log("addUser userCode", param, AgentId);
        return false;
    }
    if (!param.nickName) {
        param.nickName = param.userCode;
    }
    const usr: IUser | boolean = await getUser(param.userCode, AgentId, conn);
    // console.log("addUser getUser:", usr);
    if (usr) { return true; }
    const sql = `Insert into User(Account,Password,Nickname,Types,UpId,PayClassID) values(
        '${param.userCode}',Password('${new Date().getTime()}'),'${param.nickName}',0,${AgentId},${PayClassID}
    )`;
    const ans: IDbAns = await conn.query(sql);
    // console.log("addUser", ans);
    if (ans.affectedRows > 0) {
        return true;
    } else {
        return false;
    }
}
async function addLoginInfo(uid: number, Account: string, AgentId: string, skey: string, conn: Connection) {
    const act1 = await chkLoginAction(uid, conn);
    console.log("after chkLoginAction", act1);
    if (act1) {
        const act2 = await chkLogin(uid, conn);
        if (act2) {
            console.log("after chkLogin", act2);
            return {logkey: act2.logkey};
        }
    }
    const sql = `insert into LoginInfo(uid,Account,AgentID,logkey) values(
        ${uid},'${Account}',${AgentId},'${skey}'
    )`;
    const ans: IDbAns = await conn.query(sql);
    if (ans.affectedRows > 0) {
        return true;
    }
    return false;
}
function getUser(Account: string, AgentId: string, conn: Connection ): Promise<IUser|boolean> {
    return new Promise(async (resolve, reject) => {
        const param: {[key: number]: any} = [Account, AgentId];
        const sql = "select * from User where Account=? and UpId=?";
        await conn.query(sql, param).then((rows) => {
            console.log("getUser:", rows.length, sql, param);
            if (rows.length === 0) {
                resolve(false);
            }
            resolve(rows[0]);
        }).catch((err) => {
            console.log("getUser error", err);
            reject(false);
        });
    });
}
async function getUserLogin( Account: string, skey: string, conn: Connection) {
    const sql = "select * from LoginInfo where Account=?  and logkey=? and isActive=1";
    const rows = await conn.query(sql, [Account, skey]);
    console.log("getUserLogin", rows, sql);
    if (rows[0]) {
        return rows[0];
    } else {
        return false;
    }
}
async function chkLogin(uid: number, conn: Connection) {
    const sql = "select * from LoginInfo where uid=? and isActive=1";
    const ans = await conn.query(sql, [uid]);
    // console.log("chkLogin", ans);
    if (ans.length > 0) { return ans[0]; }
    return false;
}
async function chkLoginAction(uid: number, conn: Connection) {
    /*
    const ts = new Date().getTime();
    let sql: string = `select * from LoginInfo where uid=${uid} order by id desc limit 0,1`;
    const rows = await conn.query(sql);
    if (rows) {
        console.log(rows, ts, rows[0].timeproc - ts);
    }
    */
    const sql = `update LoginInfo set isActive=0 where uid=${uid} and isActive=1 and CURRENT_TIMESTAMP-timeproc>${staytime}`;
    const ans: IDbAns = await conn.query(sql);
    console.log("chkLoginAction", sql, ans);
    if (ans) { return true; }
    return false;
}
async function getTicketDetail(req, res) {
    const params = req.query;
    console.log("getTicketDetail:", params);
    const data: IAnsData = {code: 0};
    const conn = await dbPool.getConnection();
    const UpId = params.agentId;
    const Agent: IUser = await getAgent(UpId, conn);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    console.log("getTicketDetail param:", param);
    const sql = `select id,Account userCode,tid TermID,GameID,BetType,Num,Odds,Amt,WinLose,
        UNIX_TIMESTAMP(CreateTime) CreateTime,UNIX_TIMESTAMP(ModifyTime) ModifyTime
        from BetTable where UpId=${UpId} and isCancled=0 and
        ModifyTime between from_unixtime(${param.startTime}) and from_unixtime(${param.endTime})`;
    await conn.query(sql).then((rows) => {
        data.list = rows;
        console.log("getTicketDetail", sql);
    }).catch((err) => {
        data.code = 9;
        data.error = err;
        console.log("getTicketDetail error", data);
        // res.send(JSON.stringify(data));
    });
    conn.release();
    res.send(JSON.stringify(data));
}
/*
async function ModifyCredit(uid: number, Account: string,
                            AgentId: string, money: number, idenkey: string, conn: Connection) {
    let sql = `select balance from UserCredit where uid=? order by id desc limit 0,1`;
    const ans = await conn.query(sql, [uid]);
    let balance: number = money;
    if (ans[0]) {
        balance = balance + ans[0].balance;
    }
    sql = `insert into UserCredit(uid,Account,AgentID,idenkey,DepWD,Balance) values(?,?,?,?,?,?)`;
    const param = [uid, Account, AgentId, idenkey, money, balance];
    const dbans: IDbAns = await conn.query(sql, param);
    if (dbans.affectedRows > 0) {
        // return true;
       const bans =  await ModifyUserCredit(uid, balance, conn);
       if (bans) {
           return { balance, orderId: dbans.insertId};
       }
    }
    return false;
}
async function ModifyUserCredit(uid: number, balance: number, conn: Connection) {
    const sql = `update User set Balance=${balance} where id=${uid}`;
    const ans: IDbAns = await conn.query(sql);
    if (ans.affectedRows > 0) { return true; }
    return false;
}
*/
export default agentApi;
