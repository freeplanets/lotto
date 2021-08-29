import express, { Request, Response, Router } from "express";
import { PoolConnection } from "mariadb";
import EDS from "../class/EncDecString";
import JTable from "../class/JTable";
import DataAccess from "../components/class/DataBase/DataAccess";
import { ErrCode } from "../DataSchema/ENum";
import { IDbAns, IGameAccessParams, IHasID, IMsg } from "../DataSchema/if";
import { CryptoOp, IUser } from "../DataSchema/user";
import { ModifyCredit } from "../func/Credit";
import { getConnection } from "../func/db";

interface IAnsData {
    code: number;
    fullUrl?: string; // :"http://<server>?userCode=10001&token=FBE54A7273EE4F15B363C3F98F32B19F&lang=zh-CN&gameId=0",
    token?: string;  // "FBE54A7273EE4F15B363C3F98F32B19F",
    path?: string;   // "http://<server2>,http:/11 / 45 /<server3>,http://<server4>"
    money?: string;  // "100.81",
    freeMoney?: string;  // "100.56"
    status?: number;
    [key: string]: string|number|object|undefined;
}
let defaultUrl = "http://localhost:8082";
let defaultCCUrl = "http://localhost:8081";
if (process.env.NODE_ENV !== "development") {
    defaultUrl = "http://lotocm.uuss.net";
    defaultCCUrl = "http://crypto.uuss.net";
}
const memberUrl: string = defaultUrl;
const memberCCUrl: string = defaultCCUrl;
const staytime: number = 3000;   // sec
const agentApi: Router = express.Router();
/**
 * Api for CryptoCur
 */
agentApi.post("/login", async (req: Request, res: Response) => {
    await register(req.body, res);
});
agentApi.post("/modifyCredit", async (req: Request, res: Response) => {
    await CreditAC(req.body, res, 2);
});
agentApi.post("/creditInfo", async (req: Request, res: Response) => {
    await CreditAC(req.body, res, 4);
});

/**
 * Api for CryptoCur
 */
agentApi.get("/1", async (req: Request, res: Response) => {
    await register(req.query, res);
    /*
    const params = req.query;
    console.log("agentApi/1 :", params);
    const msg: IMsg = {ErrNo: 0};
    const data: IAnsData = {code: 0};
    const conn = await getConnection();
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "system busy!!";
        res.send(JSON.stringify(msg));
        return;
    }
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
            msg.ErrCon = JSON.stringify(param);
        }
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Agent not found!!";
    }
    await conn.release();
    res.send(JSON.stringify(msg));
    */
});
agentApi.get("/memberlogin", async (req: Request, res: Response) => {
    const param = req.query;
    // console.log("memberlogin", param);
    // const conn = await dbPool.getConnection();
    let msg: IMsg = {ErrNo: 0};
    const conn = await getConnection();
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "system busy!!";
        res.send(JSON.stringify(msg));
        return;
    }
    const Account = param.Account as string;
    const token = param.token as string;
    if (!Account || !token) {
        msg.ErrNo = ErrCode.MISS_PARAMETER;
        msg.ErrCon = "Miss Parameters!!";
        await conn.release();
        res.send(JSON.stringify(msg));
        return;
    }
    const login = await getUserLogin(Account, token, conn);
    if (login) {
        const User: IUser | null = await getUser(Account, login.AgentID, conn);
        if (User) {
            const user: IUser = User;
            const da = new DataAccess(conn, true);
            msg = await da.getOpParam(user.CLevel);
            if (msg.ErrNo === ErrCode.PASS) {
                user.Params = msg.data as CryptoOp[];
                msg.data = user;
                msg.wsServer = process.env.WS_SERVER;
            }
        }
    } else {
        msg.ErrNo = ErrCode.NO_DATA_FOUND;
        msg.ErrCon = "Error: Member not found!!";
    }
    await conn.release();
    // console.log("memberlogin getUser:", msg, process.env.WS_SERVER);
    res.send(JSON.stringify(msg));
});
agentApi.get("/2", async (req: Request, res: Response) => {
    await CreditAC(req.query, res, 2);
});
agentApi.get("/3", async (req: Request, res: Response) => {
    await CreditAC(req.query, res, 3);
});
agentApi.get("/4", async (req: Request, res: Response) => {
    await CreditAC(req.query, res, 4);
});
// CryptoCur 槓桿損益
agentApi.get("/9", async (req: Request, res: Response) => {
    await getLedgerLever(req, res);
});
// CryptoCur 下注明細
agentApi.get("/10", async (req: Request, res: Response) => {
    await getAskTable(req, res);
});

agentApi.get("/GCaption", async (req: Request, res: Response) => {
    await getGameDataCaption(req, res);
});
agentApi.get("/logHandle", async (req: Request, res: Response) => {
    await getTicketDetail(req, res);
});
async function CreditAC(params, res: Response, ac: number) {
    // const params = req.query;
    // const conn = await dbPool.getConnection();
    // console.log(`agentApi/${ac} param:`, params);
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection();
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "system busy!!";
        res.send(JSON.stringify(msg));
        return;
    }
    const data: IAnsData = {code: 0};
    const justquery: boolean = ac === 2;
    data.tradeType = (ac === 3 ? 1 : 2);
    const Agent: IUser = await getAgent(params.agentId, conn);
    const eds = new EDS(Agent.DfKey);
    let param: IGameAccessParams;
    if (Agent.DfKey === "NOEDS") {
        param = {
            ip: "",
            ac: "2",
            userCode: params.userCode
        };
        if (params.orderId) {
            param.orderId = params.orderId;
            param.money = params.money;
        }
    } else {
        param = decParam(eds.Decrypted(params.param));
    }
    params.param = param;
    console.log(`agentApi/${ac} param:`, params);
    // console.log("agentApi/1 param:", param);
    const hasUser: IUser | boolean = await getUser(param.userCode, params.agentId, conn) as IUser;
    if (!hasUser) {
        data.code = 9;
        msg.data = data;
        msg.ErrNo = 9;
        msg.ErrCon = "No user found!!";
    } else {
        const user = hasUser as IUser;
        const money: number = param.money ?  parseInt(param.money as string, 10) : 0;
        const key: number = (ac === 3 ? 1 : -1);
        const ans = await ModifyCredit(user.id, user.Account, params.agentId,
            money * key, param.orderId as string, conn, justquery);
        if (ans) {
            data.money = ans.balance + "";
            data.freeMoney = ans.balance + "";
            data.orderMoney = money + "";
        } else {
            data.status = 2;
        }
        msg.data = data;
    }
    await conn.release();
    // console.log("CreditAC ModifyCredit:", msg);
    res.send(JSON.stringify(msg));
}
async function getAgent(id: string, conn: PoolConnection) {
    const sql: string = "select * from User where id=?";
    // console.log("getAgent:", sql, id);
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
async function addUser(AgentId: string, PayClassID: number, param: IGameAccessParams, conn: PoolConnection): Promise<boolean> {
    if (!param.userCode) {
        console.log("addUser userCode", param, AgentId);
        return false;
    }
    if (!param.nickName) {
        param.nickName = param.userCode;
    }
    const usr: IUser | null = await getUser(param.userCode, AgentId, conn);
    // console.log("addUser getUser:", usr);
    if (usr) {
        if (param.nickName !== usr.Nickname) {
            const tmsg = await ModifyNickName(usr.id, param.nickName, conn);
            console.log("ChangeNickName", param.nickName, JSON.stringify(tmsg));
        }
        return true;
    }
    const sql = `Insert into Member(Account,Password,Nickname,Types,UpId,PayClassID) values(
        '${param.userCode}',Password('${new Date().getTime()}'),'${param.nickName}',0,${AgentId},${PayClassID}
    )`;
    const ans: IDbAns = await conn.query(sql);
    console.log("addUser", ans, sql);
    if (ans.affectedRows > 0) {
        return true;
    } else {
        return false;
    }
}
export async function addLoginInfo(uid: number, Account: string, AgentId: string, skey: string, conn: PoolConnection, isAdmin?: boolean) {
    const act1 = await chkLoginAction(uid, conn, isAdmin);
    // console.log("after chkLoginAction", act1);
    if (act1) {
        const act2 = await chkLogin(uid, conn, isAdmin);
        if (act2) {
            // console.log("after chkLogin", act2);
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
function getUser(Account: string, AgentId: string, conn: PoolConnection ): Promise<IUser|null> {
    return new Promise(async (resolve) => {
        let user: IUser | null = null;
        const param: {[key: number]: any} = [Account, AgentId];
        const sql = "select m.*,u.PayClass from Member m,User u where m.UpId=u.id and m.Account=? and m.UpId=?";
        conn.query(sql, param).then((rows) => {
            // console.log("getUser:", rows.length, sql, param);
            if (rows.length === 0) {
                resolve(user);
            }
            const r = rows[0] as IUser;
            if (!r.id) {
                console.log("getUser No id:", r);
                resolve(user);
            }
            user = {
                id: r.id,
                Account: r.Account,
                Nickname: r.Nickname,
                Types: r.Types,
                forcePWChange: r.forcePWChange,
                Levels: r.Levels,
                CLevel: r.CLevel,
                PayClassID: r.PayClassID,
                PayClass: r.PayClass,
                DfKey: r.DfKey,
                UpId: r.UpId,
                Balance: r.Balance,
                CreateTime: r.CreateTime,
                ModifyTime: r.ModifyTime,
            };
            resolve(user);
        }).catch((err) => {
            console.log("getUser error", sql, `>Account:${Account},AgentId:${AgentId}`, "\n", err);
            resolve(user);
        });
    });
}
async function getUserLogin( Account: string, skey: string, conn: PoolConnection, isAdmin?: boolean) {
    const sql = `select * from LoginInfo where Account=?  and logkey=? and isActive=1 and AgentID${isAdmin ? "=" : "<>"}0`;
    const rows = await conn.query(sql, [Account, skey]);
    // console.log("getUserLogin", rows, sql);
    if (rows[0]) {
        return rows[0];
    } else {
        return false;
    }
}
async function chkLogin(uid: number, conn: PoolConnection, isAdmin?: boolean) {
    const sql = `select * from LoginInfo where uid=? and isActive=1 and AgentID${isAdmin ? "=" : "<>"}0`;
    const ans = await conn.query(sql, [uid]);
    // console.log("chkLogin", sql);
    if (ans.length > 0) { return ans[0]; }
    return false;
}
async function chkLoginAction(uid: number, conn: PoolConnection, isAdmin?: boolean) {
    /*
    const ts = new Date().getTime();
    let sql: string = `select * from LoginInfo where uid=${uid} order by id desc limit 0,1`;
    const rows = await conn.query(sql);
    if (rows) {
        console.log(rows, ts, rows[0].timeproc - ts);
    }
    */
    const sql = `update LoginInfo set isActive=0 where uid=${uid} and isActive=1
        and AgentID${isAdmin ? "=" : "<>"}0
        and CURRENT_TIMESTAMP-timeproc>${staytime}`;
    const ans: IDbAns = await conn.query(sql);
    // console.log("chkLoginAction", sql, ans);
    if (ans) { return true; }
    return false;
}
async function getTicketDetail(req, res) {
    const params = req.query;
    // console.log("getTicketDetail:", params);
    const data: IAnsData = {code: 0};
    // const conn = await dbPool.getConnection();
    const conn = await getConnection();
    if (!conn) {
        data.code = 9;
        data.ErrCon = "system busy!!";
        res.send(JSON.stringify(data));
        return;
    }
    if (!params.agentId || !params.param) {
        data.code = 9;
        data.ErrCon = "parameter is missing!!";
        await conn.release();
        res.send(JSON.stringify(data));
        return;
    }
    const Agent: IUser = await getAgent(params.agentId, conn);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    console.log("getTicketDetail param:", param);
    const sql = `select id,betid,Account userCode,tid TermID,GameID,BetType,Num,Odds,Amt,validAmt,WinLose,
        UNIX_TIMESTAMP(CreateTime) CreateTime,UNIX_TIMESTAMP(ModifyTime) ModifyTime,case isCancled when 1 then 3 else isSettled+1 end as \`status\`
        from BetTable where UpId=${params.agentId} and isCancled=0 and
        ModifyTime between from_unixtime(${param.startTime}) and from_unixtime(${param.endTime})`;
    // console.log("getTicketDetail", sql);
    conn.query(sql).then((rows) => {
        data.list = rows;
        // console.log("getTicketDetail", sql);
    }).catch((err) => {
        data.code = 9;
        data.error = err;
        console.log("getTicketDetail error", data);
        // res.send(JSON.stringify(data));
    });
    await conn.release();
    res.send(JSON.stringify(data));
}
async function getGameDataCaption(req, res) {
    const params = req.query;
    // console.log("getTicketDetail:", params);
    const data: IAnsData = {code: 0};
    // const conn = await dbPool.getConnection();
    const conn = await getConnection();
    if (!conn) {
        data.code = 9;
        data.ErrCon = "system busy!!";
        res.send(JSON.stringify(data));
        return;
    }
    if (!params.agentId || !params.param) {
        data.code = 9;
        data.ErrCon = "parameter is missing!!";
        await conn.release();
        res.send(JSON.stringify(data));
        return;
    }
    const Agent: IUser = await getAgent(params.agentId, conn);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    console.log("getGameDataCaption param:", param);
    if (param.getKey === "GameDataCaption") {
        const sql = "select Game,BetType from GameDataCaption where Id=1";
        console.log("getGameDataCaption", sql);
        await conn.query(sql).then((rows) => {
            data.list = rows;
            // console.log("getTicketDetail", sql);
        }).catch((err) => {
            data.code = 9;
            data.error = err;
            console.log("getGameDataCaption error", data);
            // res.send(JSON.stringify(data));
        });
    } else {
        data.code = 9;
        data.error = "param error!!";
    }
    await conn.release();
    res.send(JSON.stringify(data));
}
async function register(params, res: Response) {
    // const params = req.query;
    // console.log("agentApi/1 :", params);
    const msg: IMsg = {ErrNo: 0};
    const data: IAnsData = {code: 0};
    const conn = await getConnection();
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "system busy!!";
        res.send(JSON.stringify(msg));
        return;
    }
    const Agent: IUser = await getAgent(params.agentId, conn);
    // console.log("agent Api /1", Agent);
    if (Agent.DfKey) {
        const eds = new EDS(Agent.DfKey);
        let param: IGameAccessParams;
        if (Agent.DfKey === "NOEDS") {
            param = {
                ac: "",
                ip: "",
                userCode: params.userCode,
                nickName: params.nickName ? params.nickName : params.userCode,
                gameType: "cc"
            };
            if (params.orderId) {
                param.orderId = params.orderId;
                param.money = params.money;
            }
        } else {
            param = decParam(eds.Decrypted(params.param));
            // console.log("agentApi/1 param:", param);
        }
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
                    let url = memberUrl;
                    if (param.gameType === "cc") { url = memberCCUrl; }
                    data.fullUrl = `${url}?userCode=${usr.Account}&token=${skey}&lang=${param.lang}`;
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
            msg.ErrCon = JSON.stringify(param);
        }
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Agent not found!!";
    }
    await conn.release();
    console.log("doRegister:", msg);
    res.send(JSON.stringify(msg));
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
    sql = `uid,Account,AgentID,idenkey,DepWD,Balance) values(?,?,?,?,?,?)`;
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
async function getLedgerLever(req, res) {
    const params = req.query;
    // console.log("getTicketDetail:", params);
    const data: IAnsData = {code: 0};
    // const conn = await dbPool.getConnection();
    const conn = await getConnection();
    if (!conn) {
        data.code = 9;
        data.ErrCon = "system busy!!";
        res.send(JSON.stringify(data));
        return;
    }
    if (!params.agentId || !params.param) {
        data.code = 9;
        data.ErrCon = "parameter is missing!!";
        await conn.release();
        res.send(JSON.stringify(data));
        return;
    }
    const Agent: IUser = await getAgent(params.agentId, conn);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    console.log("getLedgerLever param:", JSON.stringify(param));
    const sql = `select LedgerLever.id,Member.Account userCode,ItemID,ItemType,BuyID,SellID,Qty,BuyPrice,SellPrice,BuyFee Fee,Lever,Qty*BuyPrice*Lever Amt,
        GainLose,(GainLose - BuyFee) WinLose,Round(BuyTime/1000, 0) BuyTime,Round(SellTime/1000, 0) SellTime
        from LedgerLever left join Member on LedgerLever.UserID = Member.id where LedgerLever.UpId=${params.agentId} and BuyTime > 0 and
        SellTime between ${param.startTime} and ${param.endTime} order by SellTime limit 0,1000`;
    // console.log("getLedgerLever", sql);
    conn.query(sql).then((rows) => {
        data.list = rows;
        // console.log("getTicketDetail", sql);
    }).catch((err) => {
        data.code = 9;
        data.error = err;
        console.log("getLedgerLever error", data);
        // res.send(JSON.stringify(data));
    });
    await conn.release();
    res.send(JSON.stringify(data));
}
async function getAskTable(req, res) {
    const params = req.query;
    // console.log("getTicketDetail:", params);
    const data: IAnsData = {code: 0};
    // const conn = await dbPool.getConnection();
    const conn = await getConnection();
    if (!conn) {
        data.code = 9;
        data.ErrCon = "system busy!!";
        res.send(JSON.stringify(data));
        return;
    }
    if (!params.agentId || !params.param) {
        data.code = 9;
        data.ErrCon = "parameter is missing!!";
        await conn.release();
        res.send(JSON.stringify(data));
        return;
    }
    const Agent: IUser = await getAgent(params.agentId, conn);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    const startTime = param.startTime ? param.startTime : 0;
    const endTime = param.endTime ? param.endTime : 0;
    console.log("getAskTable param:", JSON.stringify(param));
    const sql = `select AskTable.id,Member.Account userCode,ItemID,ItemType,AskType,BuyType,Qty,Price,
        Amount,Fee,UNIX_TIMESTAMP(AskTable.CreateTime) CreateTime,UNIX_TIMESTAMP(AskTable.ModifyTime) ModifyTime
        from AskTable left join Member on AskTable.UserID = Member.id where AskTable.UpId=${params.agentId} and
        AskTable.ModifyTime between from_unixtime(${startTime}) and from_unixtime(${endTime})
        order by AskTable.ModifyTime limit 0,1000`;
    // console.log("getAskTable", sql);
    conn.query(sql).then((rows) => {
        data.list = rows;
        // console.log("getTicketDetail", sql);
    }).catch((err) => {
        data.code = 9;
        data.error = err;
        console.log("getAskTable error", data);
        // res.send(JSON.stringify(data));
    });
    await conn.release();
    res.send(JSON.stringify(data));
}
function ModifyNickName(id: number, Nickname: string, conn: PoolConnection) {
    const jt: JTable<IHasID> = new JTable(conn, "Member");
    return jt.Update({id, Nickname});
}
export default agentApi;
