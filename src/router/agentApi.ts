import express, { Request, Response, Router } from "express";
import { PoolConnection } from "mariadb";
import EDS from "../class/EncDecString";
import JTable from "../class/JTable";
import DataAccess from "../components/class/DataBase/DataAccess";
import StrFunc from "../components/class/Functions/MyStr";
import { ErrCode } from "../DataSchema/ENum";
import { IDbAns, IGameAccessParams, IHasID, IMsg } from "../DataSchema/if";
import { CryptoOp, IAgent, IUser } from "../DataSchema/user";
import { AddAuthHeader } from "../func/ccfunc";
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
let defaultMCurl = "http://localhost:8080";
if (process.env.NODE_ENV !== "development") {
    defaultUrl = "https://lotocm.uuss.net";
    defaultCCUrl = "https://crypto.uuss.net";
    defaultMCurl = "https://lotoqs.uuss.net";
}
const memberUrl = defaultUrl;
const memberCCUrl = defaultCCUrl;
const adminUrl = defaultMCurl;
const staytime: number = 3000;   // sec
const agentApi: Router = express.Router();
const defaultLang = "zh-cn";
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
});
agentApi.get("/memberlogin", async (req: Request, res: Response) => {
    const param = req.query;
    // console.log("memberlogin", param);
    let msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("agentApi memberlogin");
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "system busy!!";
        res.send(StrFunc.stringify(msg));
        return;
    }
    const Account = param.Account as string;
    const token = param.token as string;
    if (!Account || !token) {
        msg.ErrNo = ErrCode.MISS_PARAMETER;
        msg.ErrCon = "Miss Parameters!!";
        await conn.release();
        res.send(StrFunc.stringify(msg));
        return;
    }
    const login = await getUserLogin(Account, token, conn);
    if (login) {
        const User: IUser | null = await getUser(Account, login.AgentID, conn);
        if (User) {
            const user: IUser = User;
            const da = new DataAccess(conn, true);
            msg = await da.getOpParam(user.CLevel || "");
            if (msg.ErrNo === ErrCode.PASS) {
                user.Params = msg.data as CryptoOp[];
                msg.data = user;
                msg.wsServer = process.env.WS_SERVER;
                msg.chatServer = process.env.WS_CHATSERVER;
                // msg.chatServer = "6ojrsmeztg.execute-api.ap-southeast-1.amazonaws.com/dev";
                msg.chatSite = process.env.SITE_NAME;
                user.uid = user.Account;
                user.meta = { nickname: user.Nickname };
                user.identity = 0;
                user.site = process.env.SITE_NAME;
                res = AddAuthHeader(user, res);
            }
        }
    } else {
        msg.ErrNo = ErrCode.NO_DATA_FOUND;
        msg.ErrCon = "Error: Member not found!!";
    }
    await conn.release();
    // console.log("memberlogin getUser:", msg, process.env.WS_SERVER);
    res.send(StrFunc.stringify(msg));
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
// newsite
agentApi.get("/11", async (req: Request, res: Response) => {
    console.log("ac 11, newSite", req.query);
    newSite(req.query, res, 11);
});

agentApi.get("/GCaption", async (req: Request, res: Response) => {
    await getGameDataCaption(req, res);
});
agentApi.get("/logHandle", async (req: Request, res: Response) => {
    await getTicketDetail(req, res);
});
async function CreditAC(params, res: Response, ac: number) {
    // const params = req.query;
    console.log(`agentApi/${ac} param:`, params);
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("agentApi CreditAC");
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "system busy!!";
        res.send(StrFunc.stringify(msg));
        return;
    }
    const data: IAnsData = {code: 0};
    const justquery: boolean = ac === 2;
    data.tradeType = (ac === 3 ? 1 : 2);
    // const Agent: IUser = await getAgent(params.agentId, conn);
    const Agent: IAgent = await getAgentNew(params.agentId, params.site, conn);
    // const eds = new EDS(Agent.DfKey);
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
    // console.log("agentApi/1 param:", param);
    const hasUser: IUser | boolean = await getUser(param.userCode, Agent.id, conn) as IUser;
    if (!hasUser) {
        data.code = 9;
        msg.data = data;
        msg.ErrNo = 9;
        msg.ErrCon = "No user found!!";
    } else {
        const user = hasUser as IUser;
        const money: number = param.money ?  parseInt(param.money as string, 10) : 0;
        const key: number = (ac === 3 ? 1 : -1);
        const ans = await ModifyCredit(user.id, user.Account, user.UpId,
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
    res.send(StrFunc.stringify(msg));
}
function getAgentNew(agentId: string, site: string, conn: PoolConnection): Promise<any> {
    return new Promise<any>((resolve) => {
        const sqlh = "select u.id, c.MKey DfKey,u.PayClassID from ClientKey c left join User u on c.id = u.UpId where";
        // const sqlb = !!site ? `c.id = ? and SiteName= ?` : `u.upid = ?`;
        let sqlb = "";
        const param = [ agentId ];
        if (site) {
            sqlb = "c.id = ? and SiteName= ?";
            param.push(site);
        } else {
            sqlb = "u.UpId = ?";
        }
        // console.log("getAgentNew:", param);
        conn.query(`${sqlh} ${sqlb}`, param).then((res) => {
            // console.log("getAgent", res);
            if (site) {
                resolve(res[0]);
            } else {
                let DfKey = "";
                const agent = (res as IAgent[]).map((itm) => {
                    DfKey = itm.DfKey;
                    return itm.id;
                });
                resolve({id: agent, DfKey});
            }
        }).catch((err) => {
            console.log("getAgentNew error:", err);
            resolve(false);
        });
    });
}
async function getAgentOld(id: string | string[], conn: PoolConnection) {
    const filter = Array.isArray(id) ? `id in (${id.join(",")})` : `id = ${id}` ;
    const sql: string = `select * from User where ${filter}`;
    console.log("getAgent:", sql, id);
    const row = await conn.query(sql);
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
async function addUser(AgentId: string|number, PayClassID: number, param: IGameAccessParams, conn: PoolConnection): Promise<boolean> {
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
            console.log("ChangeNickName", param.nickName, StrFunc.stringify(tmsg));
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
export async function addLoginInfo(remoteIP: string, uid: number, Account: string, AgentId: string | number, skey: string, conn: PoolConnection, isAdmin?: boolean) {
    const act1 = await chkLoginAction(uid, conn, isAdmin);
    // console.log("after chkLoginAction", act1);
    if (act1) {
        const act2 = await chkLogin(uid, conn, isAdmin);
        if (act2) {
            // console.log("after chkLogin", act2);
            return {logkey: act2.logkey};
        }
    }
    const sql = `insert into LoginInfo(uid,Account,AgentID,logkey, remoteIP) values(
        ${uid},'${Account}',${AgentId},'${skey}','${remoteIP}'
    )`;
    const ans: IDbAns = await conn.query(sql);
    if (ans.affectedRows > 0) {
        return true;
    }
    return false;
}
function getUser(Account: string, AgentId: string | number, conn: PoolConnection, key?: string ): Promise<IUser|null> {
    return new Promise(async (resolve) => {
        let user: IUser | null = null;
        const param = [AgentId];
        let sql = "";
        if (key) {
            sql = "select * from User where id = ?";
        } else {
            sql = "select m.*,u.PayClass from Member m,User u where m.UpId=u.id and m.UpId=? and m.Account=?";
            param.push(Account);
        }
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
export async function getUserLogin( Account: string, skey: string, conn: PoolConnection, isAdmin?: boolean) {
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
    const conn = await getConnection("agentApi getTicketDetail");
    if (!conn) {
        data.code = 9;
        data.ErrCon = "system busy!!";
        res.send(StrFunc.stringify(data));
        return;
    }
    if (!params.agentId || !params.param) {
        data.code = 9;
        data.ErrCon = "parameter is missing!!";
        await conn.release();
        res.send(StrFunc.stringify(data));
        return;
    }
    const Agent: IAgent = await getAgentNew(params.agentId, params.site, conn);
    // console.log("Agent:", Agent);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    console.log("getTicketDetail param:", param);
    const idcond = param.id ? ` and id > ${param.id} ` : "";
    const UpidFilter = Array.isArray(Agent.id) ? `UpId in (${Agent.id.join(",")})` : `UpId = ${Agent.id}`;
    const sql = `select id,betid,Account userCode,tid TermID,GameID,BetType,Num,Odds,Amt,validAmt,WinLose,
        UNIX_TIMESTAMP(CreateTime) CreateTime,UNIX_TIMESTAMP(ModifyTime) ModifyTime,case isCancled when 1 then 3 else isSettled+1 end as \`status\`
        from BetTable where ${UpidFilter} and isCancled=0 and
        ModifyTime between from_unixtime(${param.startTime}) and from_unixtime(${param.endTime})${idcond}
        order by ModifyTime,id limit 0, 1000
        `;
    console.log("getTicketDetail", sql);
    conn.query(sql).then((rows) => {
        data.list = rows;
        // console.log("getTicketDetail", sql);
    }).catch((err) => {
        data.code = 9;
        data.error = err;
        console.log("getTicketDetail error", data);
        // res.send(StrFunc.stringify(data));
    });
    await conn.release();
    res.send(StrFunc.stringify(data));
}
async function getGameDataCaption(req, res) {
    const params = req.query;
    // console.log("getTicketDetail:", params);
    const data: IAnsData = {code: 0};
    const conn = await getConnection("agentApi getGameDataCaption");
    if (!conn) {
        data.code = 9;
        data.ErrCon = "system busy!!";
        res.send(StrFunc.stringify(data));
        return;
    }
    if (!params.agentId || !params.param) {
        data.code = 9;
        data.ErrCon = "parameter is missing!!";
        await conn.release();
        res.send(StrFunc.stringify(data));
        return;
    }
    const Agent: IAgent = await getAgentNew(params.agentId, params.site, conn);
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
            // res.send(StrFunc.stringify(data));
        });
    } else {
        data.code = 9;
        data.error = "param error!!";
    }
    await conn.release();
    res.send(StrFunc.stringify(data));
}
function paramcheck(msg: IMsg, param: any, option = ["agentId", "site"]): void {
    const isPass = option.every((key) => !!param[key]);
    if (!isPass) {
        msg.ErrNo = ErrCode.MISS_PARAMETER;
        msg.ErrCon = "missing param!!";
    }
}
async function register(params, res: Response) {
    // const params = req.query;
    // console.log("agentApi/1 :", params);
    const msg: IMsg = {ErrNo: 0};
    const data: IAnsData = {code: 0};
    const conn = await getConnection("agentApi register");
    if (!conn) {
        msg.ErrNo = ErrCode.GET_CONNECTION_ERR;
        msg.ErrCon = "system busy!!";
        res.send(StrFunc.stringify(msg));
        return;
    }
    // const Agent: IUser = await getAgent(params.agentId, conn);
    const Agent: IAgent = await getAgentNew(params.agentId, params.site, conn);
    console.log("agent Api /1", Agent);
    if (Agent && Agent.DfKey) {
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
        let ans = false;
        if (param.key && param.key === "admin") {
            ans = true;
        } else {
            ans = await addUser(Agent.id, Agent.PayClassID, param, conn);
        }
        // console.log("after addUser:", ans);
        if (ans) {
            msg.ErrCon = "ok!!";
            const Ans: any = await getUser(param.userCode, Agent.id, conn, param.key);
            if (Ans) {
                const usr = Ans as IUser;
                let skey: string = eds.KeyString;
                const ans1 = await addLoginInfo(params.remoteIP , usr.id, usr.Account, Agent.id, skey, conn);
                if (ans1) {
                    if (typeof(ans1) === "object") {
                        if (ans1.logkey) { skey = ans1.logkey; }
                    }
                    let url = memberUrl;
                    if (param.key) {
                        url = adminUrl;
                    } else {
                        if (param.gameType === "cc") { url = memberCCUrl; }
                    }
                    data.fullUrl = `${url}?userCode=${usr.Account}&token=${skey}&lang=${param.lang || defaultLang}`;
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
            msg.ErrCon = StrFunc.stringify(param);
        }
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Agent not found!!";
    }
    await conn.release();
    // console.log("doRegister:", msg);
    res.send(StrFunc.stringify(msg));
}
async function getLedgerLever(req, res) {
    const params = req.query;
    // console.log("getTicketDetail:", params);
    const data: IAnsData = {code: 0};
    const conn = await getConnection("agentApi getLedgerLever");
    if (!conn) {
        data.code = 9;
        data.ErrCon = "system busy!!";
        res.send(StrFunc.stringify(data));
        return;
    }
    if (!params.agentId || !params.param) {
        data.code = 9;
        data.ErrCon = "parameter is missing!!";
        await conn.release();
        res.send(StrFunc.stringify(data));
        return;
    }
    const Agent: IAgent = await getAgentNew(params.agentId, params.site, conn);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    const UpidFilter = Array.isArray(Agent.id) ? `UpId in (${Agent.id.join(",")})` : `UpId = ${Agent.id}`;
    console.log("getLedgerLever param:", StrFunc.stringify(param));
    // param.startTime change to id
    const sql = `select LedgerLever.id,Member.Account userCode,ItemID,ItemType,BuyID,SellID,Qty,BuyPrice,SellPrice,(BuyFee + TFee) Fee,Lever,Qty*BuyPrice*Lever Amt,
        GainLose,(GainLose - BuyFee - TFee) WinLose,floor(BuyTime/1000) BuyTime,SellTime
        from LedgerLever left join Member on LedgerLever.UserID = Member.id where LedgerLever.${UpidFilter} and BuyTime > 0 and
        LedgerLever.id > ${param.startTime} order by LedgerLever.id limit 0,1000`;
    console.log("getLedgerLever", sql);
    conn.query(sql).then((rows) => {
        data.list = rows;
        // console.log("getTicketDetail", sql);
    }).catch((err) => {
        data.code = 9;
        data.error = err;
        console.log("getLedgerLever error", data);
        // res.send(StrFunc.stringify(data));
    });
    await conn.release();
    res.send(StrFunc.stringify(data));
}
async function getAskTable(req, res) {
    const params = req.query;
    // console.log("getTicketDetail:", params);
    const data: IAnsData = {code: 0};
    const conn = await getConnection("agentApi getAskTable");
    if (!conn) {
        data.code = 9;
        data.ErrCon = "system busy!!";
        res.send(StrFunc.stringify(data));
        return;
    }
    if (!params.agentId || !params.param) {
        data.code = 9;
        data.ErrCon = "parameter is missing!!";
        await conn.release();
        res.send(StrFunc.stringify(data));
        return;
    }
    const Agent: IAgent = await getAgentNew(params.agentId, params.site, conn);
    const eds = new EDS(Agent.DfKey);
    const param = decParam(eds.Decrypted(params.param));
    const startTime = param.startTime ? param.startTime : 0;
    const endTime = param.endTime ? param.endTime : 0;
    const UpidFilter = Array.isArray(Agent.id) ? `UpId in (${Agent.id.join(",")})` : `UpId = ${Agent.id}`;
    console.log("getAskTable param:", StrFunc.stringify(param));
    const sql = `select AskTable.id,Member.Account userCode,ItemID,ItemType,AskType,BuyType,Qty,Price,
        Amount*Lever Amount,Fee,UNIX_TIMESTAMP(AskTable.CreateTime) CreateTime,UNIX_TIMESTAMP(AskTable.ModifyTime) ModifyTime,
        AskTable.DealTime DealTime
        from AskTable left join Member on AskTable.UserID = Member.id where AskTable.${UpidFilter} and
        AskTable.DealTime between ${startTime} and ${endTime}
        order by AskTable.DealTime limit 0,1000`;
        // AskTable.DealTime between ${startTime} and ${endTime}
        // AskTable.ModifyTime between from_unixtime(${startTime}) and from_unixtime(${endTime})
    // console.log("getAskTable", sql);
    conn.query(sql).then((rows) => {
        data.list = rows;
        // console.log("getTicketDetail", sql);
    }).catch((err) => {
        data.code = 9;
        data.error = err;
        console.log("getAskTable error", data);
        // res.send(StrFunc.stringify(data));
    });
    await conn.release();
    res.send(StrFunc.stringify(data));
}
function ModifyNickName(id: number, Nickname: string, conn: PoolConnection) {
    const jt: JTable<IHasID> = new JTable(conn, "Member");
    return jt.Update({id, Nickname});
}
async function newSite(params, res: Response, ac: number) {
    // const params = req.query;
    console.log(`agentApi/${ac} param:`, params);
    let msg: IMsg = {ErrNo: 0};
    const conn = await getConnection("agentApi newSite");
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "system busy!!";
        res.send(StrFunc.stringify(msg));
        return;
    }
    const data: IAnsData = {code: 0};
    const justquery: boolean = ac === 2;
    data.tradeType = (ac === 3 ? 1 : 2);
    // const Agent: IUser = await getAgent(params.agentId, conn);
    const Agent: IAgent | undefined = await getAgentNew(params.agentId, params.site, conn);
    if (!Agent) {
        msg = await createSiteUser(params.agentId, params.site, conn);
        msg.code = msg.ErrNo;
        if (msg.ErrNo !== ErrCode.PASS) {
            console.log("createSiteUser error", msg);
        }
    }
    await conn.release();
    res.send(StrFunc.stringify(Agent));
}
/**
 * tablename: User
 * fields:
 *      SiteName, Account, Password, Nickname, Types = 1, Levels = 0, DfKey = '',
 *      UpId, PayClassID = 0, Balance = 0, forcePWChange = 0, isChkGA = 0, Programs = ''
 */
async function createSiteUser(agentId: string, site: string, conn: PoolConnection): Promise<IMsg> {
    const user: IUser = {
        TableName: "User",
        id: 0,
        SiteName: site,
        Account: site,
        Password: "",
        Nickname: "",
        Types: 1,
        Levels: 0,
        DfKey: "",
        UpId: parseInt(agentId, 10),
        PayClassID: 0,
        Balance: 0,
        forcePWChange: 0,
        isChkGA: 0,
        Programs: "",
    };
    const jt = new JTable<IUser>(conn, user.TableName || "User");
    return await jt.Insert(user);
}
export default agentApi;
