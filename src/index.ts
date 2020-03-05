import cors from "cors";
import express, {Request, Response} from "express";
import mariadb from "mariadb";
import {getOddsData, getPayClass, getUsers} from "./API/MemberApi";
import Zadic from "./class/Animals";
import {Bet} from "./class/Bet";
import { Gets } from "./class/Gets";
import JDate from "./class/JDate";
import JTable from "./class/JTable";
import {SaveNums} from "./class/Settlement";
import {IBTItem, IGameItem, IMsg} from "./DataSchema/if";
import { IBasePayRateItm, IDBAns, IGame , IPayClassParam , IPayRateItm , ITerms, IUser} from "./DataSchema/user";
import dbPool, {port} from "./db";
import agentApi from "./router/agentApi";
import apiRouter from "./router/api";

interface IBetItem {
    BetType: string;
    Num: string;
}

const app = express();
/*
dbPool.getConnection().then((conn) => {
});
*/
    // define a route handler for the default home page
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.get("/", async (req: Request, res: Response) => {
        const conn = await dbPool.getConnection();
        let tmp: string = "";
        conn.query("select * from User").then((rows: IUser[]) => {
            rows.map((u: IUser) => {
                if (u.Account) {
                    tmp += u.Account + ",";
                    u.CDate = new Date(u.CreateTime);
                    console.log("getUserCrateTime",
                        u.Account, u.CDate.getFullYear(), u.CDate.getMonth() + 1, u.CDate.getDate());
                }
            });
            // const str: string = JSON.stringify(rows);
            conn.release();
            res.send(tmp);
        }).catch((err) => {
            console.log("query error:", err);
        });
    });
app.get("/login", async (req, res) => {
        // console.log(req.query);
        const conn = await dbPool.getConnection();
        const param = req.query;
        let sql: string = "";
        const params = [param.Account, param.Password];
        sql = `Select * from User where Account= ? and Password=Password(?)`;
        console.log(sql, params);
        conn.query(sql, params).then((rows) => {
            console.log("login:", rows);
            let msg: string = "";
            if (rows.length > 0) {
                let row: any;
                row = rows.pop();
                msg = JSON.stringify(row);
            }
            conn.release();
            res.send(msg);
        }).catch((err) => {
            console.log(err);
        });
    });
    // start the Express server
app.get("/saveGames", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const params = [param.id, param.name];
        const sql = `insert into Games(id,name) values(?,?)`;
        console.log(sql, params);
        conn.query(sql, params).then((v) => {
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("saveGames", err);
        });
    });
app.get("/api/getGames", async (req, res) => {
        const conn = await dbPool.getConnection();
        const sql = "select id,name from Games order by id";
        conn.query(sql).then((v) => {
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("saveGames", err);
        });
    });
app.post("/api/saveBtClass", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        const params = [param.GameID, param.BCName, param.BetTypes, param.ModifyID];
        const sql = "insert into BetClass(GameID,BCname,BetTypes,ModifyID) values(?,?,?,?) on duplicate key update BetTypes=values(BetTypes),ModifyID=values(ModifyID)";
        conn.query(sql, params).then((v) => {
            console.log("saveBtClass", v);
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("saveBtClass error", err);
        });
    });
app.get("/api/getBtClass", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const params = [param.GameID];
        const sql = "select BCName,BetTypes from BetClass where GameID = ?";
        conn.query(sql, params).then((v) => {
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("etBtClass", err);
        });
    });
app.get("/api/getPayClass", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const params = [param.GameID];
        const sql = "select id,PayClassName from PayClass where GameID = ?";
        conn.query(sql, params).then((v) => {
            // console.log("getPayClass", v, params);
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("getPayClass error", err);
        });
    });

app.post("/api/savePayClass", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        console.log("param chk", param);
        const params = [param.GameID, param.PayClassName, param.ModifyID];
        const sql = `insert into PayClass(GameID,PayClassName,ModifyID) values(?,?,?) on duplicate key update PayClassName=values(PayClassName),ModifyID=values(ModifyID)`;
        let rlt: IDBAns = {
            affectedRows: 0,
            insertId: 0,
            warningStatus: 0
        };
        await conn.query(sql, params).then((v) => {
            // console.log("savePayClass", v);
            // res.send(JSON.stringify(v));
            rlt = v;
        }).catch((err) => {
            console.log("savePayClass error", err);
            conn.release();
            res.send(JSON.stringify(err));
        });
        let ans;
        const cond = JSON.parse(param.condition);
        const p: IPayClassParam = {
            GameID: param.GameID,
            PayClassID : rlt.insertId,
            ModifyID: param.ModifyID,
            RateType: cond.type
        };
        if (cond.type < 3) {
            p.RateDiff = cond.param;
            ans = await setPayRate(p, conn);
        } else {
            p.RateCond = cond.param;
            ans = await setPayRate(p, conn);
        }
        console.log("savePayClass", ans);
        conn.release();
        res.send(JSON.stringify(ans));

    });
app.get("/api/getBasePayRate", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const params = [param.GameID];
        const sql = "select BetType,Title,SubTitle,SubType,Profit,DfRate,TopRate,Probability,Steps,TopPay,OneHand,PlusRate from BasePayRate where GameID = ?";
        conn.query(sql, params).then((v) => {
            // console.log("getBasePayRate", v, params);
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("getBasePayRate error", err);
        });
    });
app.get("/api/getPayRate", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const params = [param.PayClassID, param.GameID];
        const sql = `select p.BetType,p.SubType,b.DfRate,p.Rate,b.Probability,b.Steps,b.OneHand
            from  BasePayRate b left join PayRate p on b.GameID=p.GameID and b.BetType = p.BetType and b.SubType = p.SubType where p.PayClassID=? and p.GameID = ?`;
        conn.query(sql, params).then((v) => {
            console.log("getPayRate", v, params);
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("getPayRate error", err);
        });
    });
app.post("/api/batch/saveBasePayRate", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        console.log(param);
        param.data = JSON.parse(param.data);
        const valstr: string[] = [];
        param.data.map((itm: IBasePayRateItm) => {
            if (!itm.SubTitle) { itm.SubTitle = ""; }
            if (!itm.Profit) { itm.Profit = 0; }
            if (!itm.DfRate) { itm.DfRate = 0; }
            if (!itm.TopRate) { itm.TopRate = 0; }
            if (!itm.Probability) { itm.Probability = 0; }
            if (!itm.Steps) { itm.Steps = 0; }
            const tmp = `(${param.GameID},${itm.BetType},'${itm.Title}','${itm.SubTitle}',${itm.SubType},${itm.Profit},${itm.DfRate},${itm.TopRate},${itm.Probability},${itm.Steps},${itm.TopPay},${itm.OneHand},${itm.PlusRate},${param.ModifyID})`;
            valstr.push(tmp);
        });
        let sql = "insert into BasePayRate(GameID,BetType,Title,SubTitle,SubType,Profit,DfRate,TopRate,Probability,Steps,TopPay,OneHand,PlusRate,ModifyID) values";
        sql += valstr.join(",");
        sql += " ON DUPLICATE KEY UPDATE Profit=values(Profit),DfRate=values(DfRate),TopRate=values(TopRate),Probability=values(Probability),Steps=values(Steps),TopPay=values(TopPay),OneHand=values(OneHand),PlusRate=values(PlusRate),ModifyID=values(ModifyID)";
        conn.query(sql).then((v) => {
            // console.log("getPayRate", v, params);
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("getPayRate error", err);
            conn.release();
            res.send(JSON.stringify(err));
        });
    });
app.post("/api/batch/savePayRate", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        console.log("savePayRate", req.body);
        param.data = JSON.parse(param.data);
        const valstr: string[] = [];
        param.data.map((itm: IPayRateItm) => {
            const tmp = `(${param.PayClassID},${param.GameID},${itm.BetType},${itm.SubType},${itm.Rate})`;
            valstr.push(tmp);
        });
        let sql: string = "insert into PayRate(PayClassID,GameID,BetType,SubType,Rate) values";
        sql += valstr.join(",");
        sql += " ON DUPLICATE KEY UPDATE Rate=values(Rate)";
        conn.query(sql).then((v) => {
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("savePayRate error", err);
            conn.release();
            res.send(JSON.stringify(err));
        });
    });
app.post("/api/saveTerms", async (req, res) => {
        const param: ITerms = req.body;
        const msg: IMsg = {
            ErrNo: 0,
            ErrCon: ""
        };
        let ans;
        if (param) {
            if (!param.TermID) {
                msg.ErrNo = 9;
                msg.ErrCon = "TermID is Empty!!";
            }
            if (!param.GameID) {
                msg.ErrNo = 9;
                msg.ErrCon = "TermID is Empty!!";
            }
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "All params is empty!!";
        }
        if (msg.ErrNo !== 0) {
            res.send(JSON.stringify(msg));
            return;
        }
        const conn = await dbPool.getConnection();
        ans = await chkTermIsSettled(param.GameID, conn);
        // console.log("chkTermIsSettled", ans);
        // res.send(JSON.stringify(ans));
        if (!ans) {
            const params = [
                param.GameID, param.TermID, param.PDate, param.PTime, param.StopTime, param.StopTimeS, param.ModifyID];
            const fields = ["GameID", "TermID", "PDate", "PTime", "StopTime", "StopTimes", "ModifyID"];
            const values = ["?", "?", "?", "?", "?", "?", "?"];
            const extSql = ` on duplicate key update
                GameID=values(GameID),TermID=values(TermID),PDate=values(PDate),PTime=values(PTime),
                StopTime=values(StopTime),StopTimeS=values(StopTimeS),ModifyID=values(ModifyID)
            `;
            if (param.id) {
                params.push(param.id);
                fields.push("id");
                values.push("?");
            }
            let sql = `insert into Terms(${fields.join(",")})
                values(${values.join(",")})`;
            if (param.id) {
                sql = sql + extSql;
            }
            let tid;
            await conn.beginTransaction();
            await conn.query(sql, params).then((row) => {
                // res.send(JSON.stringify(row));
                ans = row;
                msg.ErrCon = row;
                tid = row.insertId;
            }).catch((err) => {
                // ans=err;
                console.log(err);
                msg.ErrNo = 8;
                msg.ErrCon = err;
                msg.debug = sql + ">>" + params.join(",");
                // res.send(JSON.stringify(err));
            });
            if (ans) {
               const codAns = await CreateOddsData(param.GameID, tid, conn);
               if (codAns.ErrNo !== 0) {
                    await conn.rollback();
                    conn.release();
                    res.send(JSON.stringify(codAns));
               } else {
                   await conn.commit();
               }
            } else {
                await conn.rollback();
            }
            conn.release();
            res.send(JSON.stringify(msg));
        }
    });
app.get("/api/getTerms", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const sql = "select * from Terms where GameID=?";
        const msg: IMsg = {
            ErrNo: 0,
            ErrCon: ""
        };
        await conn.query(sql, [param.GameID]).then((rows) => {
            // console.log("getTerms", rows);
            msg.data = rows;
        }).catch((err) => {
            msg.ErrNo = 9;
            msg.ErrCon = err;
        });
        res.send(JSON.stringify(msg));
    });
app.post("/api/createBetItems", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        const GameID = param.GameID;
        const ModifyID = param.ModifyID;
        // console.log("createBetItems data:", param.data);
        const data: IBetItem[] = JSON.parse(param.data);
        const val: string[] = [];
        data.map((itm) => {
            const tmp: string = `(${GameID},${itm.BetType},'${itm.Num}',${ModifyID})`;
            // console.log(tmp);
            val.push(tmp);
        });
        const msg: IMsg = {
            ErrNo: 0,
            ErrCon: ""
        };
        if (data.length <= 0) {
            msg.ErrNo = 9;
            msg.ErrCon = "No Data !!!";
            res.send(JSON.stringify(msg));
        }
        let sql = "insert into dfOddsItems(GameID,BetType,Num,ModifyID) values";
        sql = sql + val.join(",");
        console.log("sql:", sql);
        conn.query(sql).then((row) => {
            conn.release();
            res.send(JSON.stringify(row));
        }).catch((err) => {
            conn.release();
            res.send(JSON.stringify(err));
        });

    });
app.get("/api/GameList", async (req, res) => {
        const conn = await dbPool.getConnection();
        const jt: JTable<IGame> = new JTable(conn, "games");
        const games: IGame[] = await jt.List();
        // console.log("/api/GameList", JSON.stringify(games));
        conn.release();
        res.send(JSON.stringify(games));
    });
app.post("/api/UpdateGame", async (req, res) => {
        const conn = await dbPool.getConnection();
        const jt: JTable<IGame> = new JTable(conn, "games");
        const param: IGame = req.body;
        const ans = await jt.Update(param);
        console.log("UpdateGame", ans);
        conn.release();
        res.send(JSON.stringify(ans));
    });
app.get("/api/member/getAnimals", (req, res) => {
        res.send(JSON.stringify(Zadic));
    });
app.get("/api/member/wagerLotto", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const games: IGameItem[] = await getGameList(conn);
        const btlist: IBTItem[] = await getBtList(param.GameID, conn);
        const msg: IMsg = {
            ErrNo: 0,
            ErrCon: ""
        };
        if (games) {
            msg.gameLists = games;
        }
        if (btlist) {
            msg.btLists = btlist;
        }
        conn.release();
        res.send(JSON.stringify(msg));
    });
app.get("/api/member/getOddsItems", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        // console.log("/api/member/getOddsItems", param);
        const ans = await getOddsData(param.GameID, param.PayClassID, param.maxOID, conn);
        conn.release();
        res.send(JSON.stringify(ans));
    });
app.post("/api/member/mwagermulti", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        console.log("/api/member/mwagermulti", param);
        const UserID = param.UserID;
        const Account = param.Account;
        const tid = param.LNoID;
        const GameID = param.LottoID;
        const PayClassID = param.PayClassID;
        const UpId = param.UpId;
        const btrans = await conn.beginTransaction();
        console.log("Begin:", btrans);
        const snb: Bet = new Bet(UserID, Account, UpId , tid, GameID, PayClassID, conn);
        const ans: IMsg = await snb.AnaNum(param.WagerContent);
        // if (ans.warningStatus === 0) {
        if (ans.ErrNo === 0) {
            const cmm = await conn.commit();
            console.log("Commit:", cmm);
        } else {
            const rback = await conn.rollback();
            console.log("Rollback:", rback);
        }
        conn.release();
        res.send(JSON.stringify(ans));
    });
app.post("/api/member/mwagerjn", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        console.log("/api/member/mwagerjn", param);
        const UserID = param.UserID;
        const Account = param.Account;
        const UpId = param.UpId;
        const tid = param.LNoID;
        const GameID = param.LottoID;
        const PayClassID = param.PayClassID;
        const btrans = await conn.beginTransaction();
        console.log("Begin:", btrans);
        const snb: Bet = new Bet(UserID, Account, UpId, tid, GameID, PayClassID, conn);
        const ans: IMsg = await snb.Parlay(param.wgtype, param.OddsID, param.JoinNumber, param.StakeMoney);
        // if (ans.warningStatus === 0) {
        if (ans.ErrNo === 0) {
            const cmm = await conn.commit();
            console.log("Commit:", cmm);
        } else {
            const rback = await conn.rollback();
            console.log("Rollback:", rback);
        }
        conn.release();
        res.send(JSON.stringify(ans));
    });
app.get("/api/member/getWagerItems", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const gets: Gets = new Gets(conn);
        // console.log("/api/member/getWagerItems", param);
        if (param.data === "") {
            param.date = JDate.DateStr;
        }
        const msg: IMsg = await gets.getBetLists(param.UserID, param.date);
        conn.release();
        res.send(JSON.stringify(msg));
    });
app.post("/api/SaveUser", async (req, res) => {
        const conn = await dbPool.getConnection();
        const jt: JTable<IUser> = new JTable(conn, "User");
        const param: IUser = req.body;
        console.log("SaveUser", param);
        let ans;
        if (param.id) {
            ans = await jt.Update(param);
        } else {
            ans = await jt.Insert(param);
        }
        conn.release();
        res.send(JSON.stringify(ans));
    });
app.get("/api/getUsers", async (req, res) => {
        const conn = await dbPool.getConnection();
        const ans = await getUsers(conn);
        const msg: IMsg = {ErrNo: 0};
        if (ans) {
            msg.data = ans;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Get Users Error!!";
        }
        conn.release();
        res.send(JSON.stringify(msg));
    });
app.get("/api/member/getPayClass", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const msg: IMsg = {ErrNo: 0};
        if (!param.GameID) {
            msg.ErrNo = 9;
            msg.ErrCon = "GameID is missing!!";
        } else {
            const ans = getPayClass(param.GameID, conn);
            if (ans) {
                msg.data = ans;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Get Pay Class Error!!";
            }
        }
        conn.release();
        res.send(JSON.stringify(msg));
    });
app.post("/api/SaveNums", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body.params;
        const msg: IMsg = {ErrNo: 0};
        console.log("SaveNums", param);
        if (!param.GameID) {
            msg.ErrNo = 9;
            msg.ErrCon = "GameID is missing!!";
        }
        if (!param.Nums) {
            msg.ErrNo = 9;
            msg.ErrCon = "Nums is missing!!";
        }
        if (msg.ErrNo === 0) {
            const Nums = SaveNums(param.tid, param.GameID, param.Nums, conn);
            msg.Data = Nums;
        }
        conn.release();
        res.send(JSON.stringify(msg));
    });
app.use("/agentApi", agentApi);
app.use("/test", apiRouter);
app.listen(port, () => {
        console.log(`server started at http://localhost:${ port }`);
    });
/*
}).catch((err) => {
    console.log("db error:", err);
});
*/
async function setPayRate(param: IPayClassParam, conn: mariadb.PoolConnection) {
    let diff: string = "";
    if (param.RateType === 0) {
        diff = param.RateDiff as string;
    } else if (param.RateType === 1) {
        diff = `Round(${param.RateDiff}*Probability*Steps)*Steps`;
    } else {
        diff = `Round(((1-${param.RateDiff})/Probability-DfRate)/Steps)*Steps`;
    }

    const sql = `insert into PayRate(PayClassID,GameID,BetType,SubType,Rate,ModifyID)
        select ${param.PayClassID},GameID,BetType,SubType,${diff},${param.ModifyID}
        from BasePayRate where GameID = ?
    `;
    let ans;
    console.log("sql:", sql);
    await conn.query(sql, [param.GameID]).then((v) => {
        // console.log(JSON.stringify(v));
        ans = v;
    }).catch((err) => {
        console.log("setPayRate error", err);
        ans = err;
    });
    return ans;
}

async function CreateOddsData(GameID: string|number, tid: number, conn: mariadb.PoolConnection) {
    let sql: string = "";
    sql = "select * from CurOddsInfo where tid = ? and GameID= ? limit 0,1";
    const params = [tid, GameID];
    let isEmpty: boolean = false;
    let msg: IMsg = {
        ErrNo: 0,
        ErrCon: "",
    };
    await conn.query(sql, params).then((row) => {
        if (row.affectedRows > 0) { isEmpty = true; }
    }).catch((err) => {
        console.log(err);
        msg.ErrNo = 6;
        msg.ErrCon = JSON.stringify(err);
        msg.debug =  sql + ">>" + params.join(",");
    });
    if (!isEmpty) {
        sql = `insert into CurOddsInfo(tid,OID,GameID,BetType,Num,Odds,MaxOdds,Steps)
            SELECT ${tid} tid,1 OID,d.GameID,d.BetType,d.Num,(b.DfRate+b.PlusRate) Odds,(TopRate+b.PlusRate) MaxOdds,Steps
        FROM dfOddsItems d left join BasePayRate b on d.GameID=b.GameID and d.BetType = b.BetType and d.SubType = b.SubType
        where d.GameID= ${GameID}
        `;
        await conn.query(sql).then((row) => {
            msg.ErrCon = JSON.stringify(row);
        }).catch((err) => {
            console.log(err);
            msg.ErrNo = 7;
            msg.ErrCon = JSON.stringify(err);
            msg.debug = sql;
        });
        if (msg.ErrNo === 0 && GameID === 1) {
            msg = await setBt15Odds(tid, GameID, conn);
        }
    }
    return msg;
}
async function chkTermIsSettled(GameID: string|number, conn: mariadb.PoolConnection) {
    const sql = "select * from Terms where GameID=? and isSettled=0";
    let ans;
    await conn.query(sql, [GameID]).then((rows) => {
        // console.log("chkTermIsSettled:", rows, sql, GameID);
        ans = rows.affectedRows > 0;
    }).catch((err) => {
        ans = err;
    });
    return ans;
}
async function getGameList(conn: mariadb.PoolConnection) {
    const sql: string = "select id,name from Games where 1";
    let ans;
    await conn.query(sql).then((rows) => {
       ans = rows;
    }).catch((err) => {
        ans = err;
    });
    return ans;
}
async function getBtList(GameID: number|string, conn: mariadb.PoolConnection) {
    const sql: string = "select BetType id,Title name,isParlay from BasePayRate where GameID=?  and SubType=0";
    let ans;
    await conn.query(sql, [GameID]).then((rows) => {
        ans = rows;
    }).catch((err) => {
        ans = err;
    });
    return ans;
}

async function setBt15Odds(tid: number, GameID: number|string, conn: mariadb.PoolConnection) {
    let msg: IMsg = await getGameParams(GameID, conn);
    const twoside: number[] = [12, 13];
    const colorwave: number[] = [14];
    if (msg.ErrNo !== 0) {
        return msg;
    }
    const games: IGame = msg.data as IGame;
    msg = await updateCurOdds(tid, GameID, twoside, games.PDiffTwoSide, conn);
    if (msg.ErrNo !== 0 ) {
        return msg;
    }
    msg = await updateCurOdds(tid, GameID, colorwave, games.PDiffColorWave, conn);
    return msg;
}

async function getGameParams(GameID: number|string, conn: mariadb.PoolConnection) {
    const msg: IMsg = {ErrNo: 0};
    const sql = "select * from Games where id=?";
    await conn.query(sql, [GameID]).then((rows) => {
        if (rows.length > 0) {
            msg.data = rows.pop();
        }
    }).catch((err) => {
        console.log("getGameParams:", err);
        msg.ErrNo = 9;
        msg.ErrCon = err;
    });
    if (!msg.data) {
        msg.ErrNo = 8;
    }
    return msg;
}
async function updateCurOdds(tid: number, GameID: string|number, Bts: number[],
                             OddsPlus: number, conn: mariadb.PoolConnection) {
    let sql = `
        select CONCAT(BetType,Num) Num,(Odds + ${OddsPlus}) Odds, MaxOdds,Steps
        from CurOddsInfo where tid=${tid} and GameID = ${GameID} and BetType in (${Bts.join(",")})
    `;
    const msg: IMsg = {ErrNo: 0};
    await conn.query(sql).then((rows) => {
        msg.data = rows;
    }).catch((err) => {
        console.log("updateCurOdds:", err);
        msg.ErrNo = 9;
        msg.ErrCon = err;
    });
    if (msg.ErrNo !== 0) {
        return msg;
    }
    const dtas: any = msg.data;
    const data: string[] = [];
    dtas.map((itm) => {
        data.push(`(${tid},${GameID},15,${itm.Num},${itm.Odds},${itm.MaxOdds},${itm.Steps})`);
    });
    sql = `
    insert into  CurOddsInfo(tid,GameID,BetType,Num,Odds,MaxOdds,Steps)
    values${data.join(",")}
    on duplicate key update Odds=values(Odds),MaxOdds=values(MaxOdds),Steps=values(Steps)
`;
    console.log("updateCurOdds", sql);
    await conn.query(sql).then((row) => {
        msg.ErrCon = row;
    }).catch((err) => {
        console.log("updateCurOdds:", err);
        msg.ErrNo = 9;
        msg.ErrCon = err;
    });
    return msg;
}
