import cors from "cors";
import express, {Request, Response} from "express";
import mariadb from "mariadb";
import minimist from "minimist";
import {getOddsData, getOpParams, getPayClass, getUsers} from "./API/MemberApi";
import Zadic from "./class/Animals";
import {Bet} from "./class/Bet";
import { Gets } from "./class/Gets";
import JDate from "./class/JDate";
import JTable from "./class/JTable";
import {SaveNums} from "./class/Settlement";
import {IBTItem, IComments, IGameItem, IMsg, IOParam} from "./DataSchema/if";
import { IBasePayRateItm, IDBAns, IGame , IPayClassParam , IPayRateItm , ITerms, IUser} from "./DataSchema/user";
import dbPool, {doQuery, getConnection, port} from "./db";
import agentApi from "./router/agentApi";
import apiRouter from "./router/api";
// const args: minimist.ParsedArgs = minimist(process.argv.slice(2), {});
// console.log("minimist:", args);
interface IBetItem {
    BetType: string;
    Num: string;
}
interface IOdds {
    Odds: number;
    MaxOdds: number;
    isStop: number;
    Steps: number;
}
const app = express();
/*
dbPool.getConnection().then((conn) => {
});
*/
    // define a route handler for the default home page
const crosOption: cors.CorsOptions = {
};
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(crosOption));
app.get("/", async (req: Request, res: Response) => {
        /*
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
        */
       res.send("ok");
    });
app.get("/login", async (req, res) => {
        // console.log(req.query);
        const conn: mariadb.PoolConnection|undefined =  await getConnection();
        const msg: IMsg = { ErrNo: 0};
        if (conn) {
            const param = req.query;
            let sql: string = "";
            const params = [param.Account, param.Password];
            sql = `Select * from User where Account= ? and Password=Password(?)`;
            const ans = await doQuery(sql, conn, params);
            if (ans) {
                if (ans.length > 0) {
                    msg.data = ans.pop();
                }
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "User not found";
            }
            conn.release();
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Get connection error!!";
        }
        res.send(JSON.stringify(msg));
    });
    // start the Express server
app.get("/saveGames", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const params = [param.id, param.name];
        const sql = `insert into Games(id,name) values(?,?)`;
        console.log(sql, params);
        await conn.query(sql, params).then((v) => {
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("saveGames", err);
            res.send(err);
        });
    });
app.get("/api/getGames", async (req, res) => {
        // const conn = await dbPool.getConnection();
        const conn = await getConnection();
        const msg: IMsg = {ErrNo: 0};
        if (conn) {
            const sql = "select id,name,GType from Games order by id";
            const ans = await doQuery(sql, conn);
            if (ans) {
                msg.data = ans;
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Games not found!!";
            }
            conn.release();
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "get connection error!!";
        }
        res.send(JSON.stringify(msg));
        /*
        await conn.query(sql).then((v) => {
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("saveGames", err);
            res.send(err);
        });
        */
    });
app.post("/api/saveBtClass", async (req, res) => {
        const conn = await getConnection();
        const msg: IMsg = {ErrNo: 0};
        if (conn) {
            const param = req.body;
            const params = [param.GameID, param.BCName, param.BetTypes, param.ModifyID];
            const sql = "insert into BetClass(GameID,BCname,BetTypes,ModifyID) values(?,?,?,?) on duplicate key update BetTypes=values(BetTypes),ModifyID=values(ModifyID)";
            const ans = await doQuery(sql, conn, params);
            if (ans) {
                msg.data = ans;
            } else {
                msg.ErrCon = "Save BetType class error!!";
            }
            conn.release();
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "get connection error!!";
        }
        res.send(JSON.stringify(msg));
    });
app.get("/api/getBtClass", async (req, res) => {
        const conn = await getConnection();
        const msg: IMsg = {ErrNo: 0};
        if (conn) {
            const param = req.query;
            const params = [param.GameID];
            const sql = "select id,BCName,BetTypes from BetClass where GameID = ?";
            const ans = await doQuery(sql, conn, params);
            if (ans) {
                msg.data = ans;
            } else {
                msg.ErrCon = "BetClass Not found!!";
            }
            conn.release();
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "get connection error!!";
        }
        res.send(JSON.stringify(msg));
    });
app.get("/api/delBtClass", async (req, res) => {
    const conn = await getConnection();
    const msg: IMsg = {ErrNo: 0};
    if (conn) {
        const param = req.query;
        const params = [param.GameID, param.BCName];
        const sql = "delete from BetClass where GameID=?  and BCName=?";
        const ans = await doQuery(sql, conn, params);
        if (ans) {
            msg.data = ans;
        } else {
            msg.ErrCon = "BetClass delete fail!!";
        }
        conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "get connection error!!";
    }
    res.send(JSON.stringify(msg));
});
app.get("/api/getPayClass", async (req, res) => {
    const conn = await dbPool.getConnection();
    const msg: IMsg = {ErrNo: 0};
    const param = req.query;
    const ans = await getPayClass(conn, param.GameID);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = ans;
    }
    conn.release();
    res.send(JSON.stringify(msg));
});

app.post("/api/savePayClass", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        const msg: IMsg = {ErrNo: 0};
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
            msg.ErrNo = 9;
            msg.debug = err;
            res.send(JSON.stringify(msg));
        });
        let ans;
        if (param.data) {
            ans = await setPayRateData(param.GameID, rlt.insertId, param.ModifyID, param.data, conn);
        } else {
            const cond = JSON.parse(param.condition);
            const p: IPayClassParam = {
                GameID: param.GameID,
                PayClassID : rlt.insertId,
                ModifyID: param.ModifyID ,
                RateType: cond.type
            };
            if (cond.type < 3) {
                p.RateDiff = cond.param;
                ans = await setPayRate(p, conn);
            } else {
                p.RateCond = cond.param;
                ans = await setPayRate(p, conn);
            }
        }
        if (!ans) {
            msg.ErrNo = 9;
        }
        msg.debug = ans;
        console.log("savePayClass", msg);
        conn.release();
        res.send(JSON.stringify(msg));

    });
app.get("/api/getBasePayRate", async (req, res) => {
        const conn = await dbPool.getConnection();
        const msg: IMsg = {ErrNo: 0};
        const param = req.query;
        const params = [param.GameID];
        const sql = "select BetType,Title,SubTitle,SubType,NoAdjust,Profit,DfRate,TopRate,Probability,Steps,TopPay,OneHand from BasePayRate where GameID = ?";
        await conn.query(sql, params).then((v) => {
            // console.log("getBasePayRate", v, params);
            conn.release();
            msg.data = v;
            res.send(JSON.stringify(msg));
        }).catch((err) => {
            console.log("getBasePayRate error", err);
            msg.ErrNo = 9;
            msg.debug = err;
            conn.release();
            res.send(JSON.stringify(msg));
        });
    });
app.get("/api/getPayRate", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const params = [param.PayClassID, param.GameID];
        const sql = `select p.BetType,p.SubType,b.DfRate,p.Rate,b.Probability,b.Steps,b.OneHand
            from  BasePayRate b left join PayRate p on b.GameID=p.GameID and b.BetType = p.BetType and b.SubType = p.SubType where p.PayClassID=? and p.GameID = ?`;
        await conn.query(sql, params).then((v) => {
            // console.log("getPayRate", v, params);
            conn.release();
            res.send(JSON.stringify(v));
        }).catch((err) => {
            console.log("getPayRate error", err);
            conn.release();
            res.send(JSON.stringify(err));
        });
    });
app.post("/api/batch/saveBasePayRate", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.body;
        // console.log(param);
        param.data = JSON.parse(param.data);
        const valstr: string[] = [];
        param.data.map((itm: IBasePayRateItm) => {
            if (!itm.SubTitle) { itm.SubTitle = ""; }
            if (!itm.Profit) { itm.Profit = 0; }
            if (!itm.DfRate) { itm.DfRate = 0; }
            if (!itm.TopRate) { itm.TopRate = 0; }
            if (!itm.Probability) { itm.Probability = 0; }
            if (!itm.Steps) { itm.Steps = 0; }
            const tmp = `(${param.GameID},${itm.BetType},'${itm.Title}','${itm.SubTitle}',${itm.SubType},${itm.NoAdjust},${itm.Profit},${itm.DfRate},${itm.TopRate},${itm.Probability},${itm.Steps},${itm.TopPay},${itm.OneHand},${param.ModifyID})`;
            valstr.push(tmp);
        });
        let sql = "insert into BasePayRate(GameID,BetType,Title,SubTitle,SubType,NoAdjust,Profit,DfRate,TopRate,Probability,Steps,TopPay,OneHand,ModifyID) values";
        sql += valstr.join(",");
        sql += " ON DUPLICATE KEY UPDATE NoAdjust=values(NoAdjust),Profit=values(Profit),DfRate=values(DfRate),TopRate=values(TopRate),Probability=values(Probability),Steps=values(Steps),TopPay=values(TopPay),OneHand=values(OneHand),ModifyID=values(ModifyID)";
        await conn.query(sql).then((v) => {
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
        await conn.query(sql).then((v) => {
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
                TermID=values(TermID),PDate=values(PDate),PTime=values(PTime),
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
                if (!param.id) {
                    const codAns = await CreateOddsData(param.GameID, tid, conn);
                    if (codAns.ErrNo !== 0) {
                            await conn.rollback();
                            conn.release();
                            res.send(JSON.stringify(codAns));
                    }
                }
                await conn.commit();
            } else {
                await conn.rollback();
                msg.ErrNo = 9;
                msg.ErrCon = "Error!!";
            }
            conn.release();
            res.send(JSON.stringify(msg));
        }
    });
app.get("/api/getTerms", async (req, res) => {
        const conn = await dbPool.getConnection();
        const param = req.query;
        const sql = "select * from Terms where GameID=? order by id desc limit 0,10";
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
            conn.release();
            res.send(JSON.stringify(msg));
        }
        let sql = "insert into dfOddsItems(GameID,BetType,Num,ModifyID) values";
        sql = sql + val.join(",");
        console.log("sql:", sql);
        await conn.query(sql).then((row) => {
            conn.release();
            res.send(JSON.stringify(row));
        }).catch((err) => {
            conn.release();
            res.send(JSON.stringify(err));
        });

    });
app.get("/api/GameList", async (req, res) => {
        const conn = await dbPool.getConnection();
        const jt: JTable<IGame> = new JTable(conn, "Games");
        const games: IGame[] = await jt.List();
        // console.log("/api/GameList", JSON.stringify(games));
        conn.release();
        res.send(JSON.stringify(games));
    });
app.post("/api/UpdateGame", async (req, res) => {
        const conn = await dbPool.getConnection();
        const jt: JTable<IGame> = new JTable(conn, "Games");
        const param: IGame = req.body;
        const ans = await jt.Update(param);
        console.log("UpdateGame", ans);
        conn.release();
        res.send(JSON.stringify(ans));
    });
app.post("/api/Save/:TableName", async (req, res) => {
    const conn = await dbPool.getConnection();
    const TableName = req.params.TableName;
    // console.log("/api/Save/TableName param", req.body);
    const data: IOParam[] = JSON.parse(req.body.params.data);
    const msg: IMsg = { ErrNo: 0 };
    const jt: JTable<IOParam> = new JTable(conn, TableName);
    const ans = await jt.MultiUpdate(data);
    // console.log("/api/Save/:TableName ans:", ans);
    if (ans) {
        msg.data = ans;
    } else {
        msg.ErrNo = 9;
        msg.error = ans;
    }
    conn.release();
    res.send(JSON.stringify(msg));
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
        // const btrans = await conn.beginTransaction();
        // console.log("Begin:", btrans);
        const snb: Bet = new Bet(UserID, Account, UpId , tid, GameID, PayClassID, conn);
        const ans: IMsg = await snb.AnaNum(param.WagerContent);
        // if (ans.warningStatus === 0) {
        /*
        if (ans.ErrNo === 0) {
            const cmm = await conn.commit();
            console.log("Commit:", cmm);
        } else {
            const rback = await conn.rollback();
            console.log("Rollback:", rback);
        }
        */
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
        // const btrans = await conn.beginTransaction();
        // console.log("Begin:", btrans);
        const snb: Bet = new Bet(UserID, Account, UpId, tid, GameID, PayClassID, conn);
        const ans: IMsg = await snb.Parlay(param.wgtype, param.OddsID, param.JoinNumber, param.StakeMoney);
        // if (ans.warningStatus === 0) {
            /*
        if (ans.ErrNo === 0) {
            const cmm = await conn.commit();
            console.log("Commit:", cmm);
        } else {
            const rback = await conn.rollback();
            console.log("Rollback:", rback);
        }
        */
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
        const param = req.query;
        const ans = await getUsers(conn, param);
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
            const ans = getPayClass(conn, param.GameID);
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
app.get("/api/getOpParams", async (req, res) => {
    const conn = await dbPool.getConnection();
    const param = req.query;
    const msg: IMsg = {ErrNo: 0};
    if (!param.GameID) {
        msg.ErrNo = 9;
        msg.ErrCon = "GameID is missing!!";
    } else {
        const ans = await getOpParams(param.GameID, conn);
        if (ans) {
            msg.data = ans;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Get Open Params Error!!";
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
app.get("/api/CurOddsInfo", async (req, res) => {
    // const conn = await dbPool.getConnection();
    const msg: IMsg = {ErrNo: 0};
    const conn = await getConnection();
    if (!conn) {
        msg.ErrNo = 9;
        msg.ErrCon = "Connection error!!";
        res.send(JSON.stringify(msg));
    } else {
        const param = req.query;
        let tid: number | undefined = 0;
        // console.log("CurOddsInfo", param);
        if (!param.GameID) {
            msg.ErrNo = 9;
            msg.ErrCon = "GameID is missing!!";
            res.send(JSON.stringify(msg));
        }
        if (!param.tid) {
            tid = await getCurTermId(param.GameID, conn);
            if (!tid) {
                msg.ErrNo = 9;
                msg.ErrCon = "Get data error!!";
                res.send(JSON.stringify(msg));
            }
        } else {
            tid = param.tid;
        }
        msg.tid = tid;
        let MaxOddsID: number = 0;
        if (param.MaxOddsID) {
            MaxOddsID = param.MaxOddsID;
        }
        const ans = await getCurOddsInfo(tid as number, param.GameID, MaxOddsID, conn);
        if (ans) {
            msg.data = ans;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Get Odds error!";
        }
        conn.release();
    }
    res.send(JSON.stringify(msg));
});
app.get("/api/setOdds", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const conn: mariadb.PoolConnection|undefined = await getConnection();
    if (!conn) {
        msg.ErrNo = 8;
        msg.ErrCon = "Database busy!!";
    } else {
        const param = req.query;
        console.log("setOdds param", param);
        if (param.Step) {
            const fOdds: IOdds|undefined = await getOddsInfo(param.tid, param.GameID, param.BT, param.Num, conn);
            if (fOdds) {
                // msg.data = ans;
                const step: number = param.Step;
                let odds: number = fOdds.Odds + step * fOdds.Steps;
                console.log("before setOdds", odds, step, fOdds);
                if (odds > fOdds.MaxOdds) {
                    odds = fOdds.MaxOdds;
                }
                if (odds !== fOdds.Odds) {
                    const ans = await setOdds(param.tid, param.GameID, param.BT, param.Num, odds, param.UserID, conn);
                    if (ans) {
                        msg.data = ans;
                    } else {
                        msg.ErrNo = 9;
                        msg.ErrCon = "Set odds error!!";
                    }
                }
            } else {
                msg.ErrNo = 9;
                msg.ErrCon = "Get odds info error!!";
            }
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Odds error!!";
        }
        conn.release();
    }
    res.send(JSON.stringify(msg));
});
app.get("/api/setStop", async (req, res) => {
    const msg: IMsg = {ErrNo: 0};
    const conn: mariadb.PoolConnection|undefined = await getConnection();
    if (!conn) {
        msg.ErrNo = 8;
        msg.ErrCon = "Database busy!!";
    } else {
        const param = req.query;
        console.log("setStop param", param);
        const ans = await setStop(param.tid, param.GameID, param.isStop, param.UserID, conn, param.BetTypes, param.Num);
        if (ans) {
            msg.data = ans;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Set stop error!!";
        }
        conn.release();
    }
    res.send(JSON.stringify(msg));
});
app.post("/api/saveComments", async (req, res) => {
    const param = req.body;
    const msg: IMsg = { ErrNo: 0 };
    if (!param.PageName) {
        msg.ErrNo = 9;
        msg.ErrCon = "PageName is missing!!";
    }
    const conn: mariadb.PoolConnection | undefined = await getConnection();
    if (conn) {
        // console.log("saveComments:", param);
        const ans = await saveComments(param.PageName, param.Comments, conn);
        if (ans) {
            msg.data = ans;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Save comments error!";
        }
        conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get Connection error!";
    }
    res.send(JSON.stringify(msg));
});
app.post("/api/getComments", async (req, res) => {
    const param = req.body;
    const msg: IMsg = { ErrNo: 0 };
    if (!param.PageName) {
        msg.ErrNo = 9;
        msg.ErrCon = "PageName is missing!!";
    }
    const conn: mariadb.PoolConnection | undefined = await getConnection();
    if (conn) {
        // console.log("getComments:", param);
        const ans = await getComments(param.PageName, conn);
        if (ans) {
            msg.data = ans;
        } else {
            msg.ErrNo = 9;
            msg.ErrCon = "Get comments error!";
        }
        conn.release();
    } else {
        msg.ErrNo = 9;
        msg.ErrCon = "Get Connection error!";
    }
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
async function setPayRateData(GameID: number, PayClassID: number, ModifyID: number, data: any, conn: mariadb.PoolConnection): Promise<boolean> {
    const jt: JTable<IPayRateItm> = new JTable(conn, "PayRate");
    data.map((itm: IPayRateItm) => {
        itm.id = 0;
        itm.GameID = GameID;
        itm.PayClassID = PayClassID;
        itm.ModifyID = ModifyID;
    });
    const ans = await jt.MultiInsert(data);
    if (ans) {
        return true;
    }
    return false;
}
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
            SELECT ${tid} tid,1 OID,d.GameID,d.BetType,d.Num,b.DfRate Odds,TopRate MaxOdds,Steps
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
async function chkTermIsSettled(GameID: string|number, conn: mariadb.PoolConnection, tid?: number): Promise<boolean> {
    const param: number[] = [GameID as number];
    let sql: string = "select * from Terms where GameID=?";
    let ans: boolean = true;
    if (tid) {
        sql = sql + " and id=?";
        param.push(tid);
    } else {
        sql = sql + " and isSettled=0";
    }
    await conn.query(sql, param).then((rows) => {
        // console.log("chkTermIsSettled:", rows[0], sql, param);
        if (tid) {
            ans = !!rows[0].isSettled;
        } else {
            ans = rows.affectedRows > 0;
        }
    }).catch((err) => {
        console.log("chkTermIsSettled:", err);
        ans = true;
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
async function updateCurOdds(tid: number, GameID: string|number, Bts: number[], OddsPlus: number, conn: mariadb.PoolConnection) {
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

async function getCurTermId(GameID: number|string, conn: mariadb.PoolConnection): Promise<number|undefined> {
    const sql = `select id from Terms where GameID=? order by id desc limit 0,1`;
    let ans: number = 0;
    const res = await doQuery(sql, conn, [GameID]);
    // console.log("getCurTermId:", res);
    if (res) {
        ans = res[0].id;
    } else {
        return undefined;
    }
    return ans;
}
async function getCurOddsInfo(tid: number, GameID: number|string, MaxOddsID: number, conn: mariadb.PoolConnection): Promise<any> {
    const gameStoped: boolean = await chkTermIsSettled(GameID, conn, tid);
    // console.log("getCurOddsInfo gameStoped:", gameStoped);
    const sql = `select OID,BetType,Num,Odds,MaxOdds,isStop,tolW,tolS,tolP,Steps from CurOddsInfo where tid=? and GameID=? and OID > ?`;
    const ans = {};
    const res = await doQuery(sql, conn, [tid, GameID, MaxOddsID]);
    if (res) {
        res.map((itm) => {
            if (!ans[itm.BetType]) { ans[itm.BetType] = {}; }
            const tmp = {
                OID: itm.OID,
                Odds: itm.Odds,
                MaxOdds: itm.MaxOdds,
                isStop: itm.isStop | (gameStoped ? 1 : 0),
                tolW: itm.tolW,
                tolS: itm.tolS,
                tolP: itm.tolP,
                Steps: itm.Steps
            };
            ans[itm.BetType][itm.Num] = Object.assign({}, tmp);
        });
    } else  {
        return;
    }
    return ans;
}

async function getOddsInfo(tid: number, GameID: number, BT: number, Num: number, conn: mariadb.PoolConnection): Promise<any> {
    const sql = "select Odds,MaxOdds,isStop,Steps from CurOddsInfo where tid=? and GameID=? and BetType=? and Num=?";
    const ans = await doQuery(sql, conn, [tid, GameID, BT, Num]);
    if (ans) {
        return ans[0];
    }
    return undefined;
}

async function setOdds(tid: number, GameID: number, BT: number, Num: number, Odds: number, UserID: number, conn: mariadb.PoolConnection): Promise<any> {
    const maxid = new Date().getTime();
    const sql = `update CurOddsInfo set Odds=?,OID=${maxid} where tid=? and GameID=? and BetType=? and Num=?`;
    const ans = await doQuery(sql, conn, [Odds, tid, GameID, BT, Num]);
    if (ans) {
        const sql1 = `insert into OddsInfoLog(tid,OID,GameID,BetType,Num,Odds,isStop,UserID)
            select tid,OID,GameID,BetType,Num,Odds,isStop,${UserID} UserID from CurOddsInfo
            where tid=? and GameID=? and BetType=? and Num=? `;
        await doQuery(sql1, conn, [tid, GameID, BT, Num]);
        // console.log("Insert Odds log:", sql1, ans1);
        return ans;
    }
    return undefined;
}

async function setStop(tid: number, GameID: number, isStop: number, UserID: number, conn: mariadb.PoolConnection, BetTypes?: string, Num?: string): Promise<any> {
    const maxid = new Date().getTime();
    const BTS: string = !!BetTypes  ? ` and BetType in (${BetTypes})` : "";
    const NN: string = Num !== undefined ? ` and Num=${Num}` : "";
    const sql = `update CurOddsInfo set isStop=?,OID=${maxid} where tid=? and GameID=? ${BTS}${NN}`;
    const ans = await doQuery(sql, conn, [isStop, tid, GameID]);
    if (ans) {
        const Bt = BetTypes ? BetTypes : "all";
        const Nm = Num ? Num : -1;
        const sql1 = `insert into OddsInfoLog(tid,OID,GameID,BetType,Num,isStop,UserID)
            values(${tid},${maxid},${GameID},'${Bt}',${Nm},${isStop},${UserID})`;
        await doQuery(sql1, conn);
        return ans;
    }
    return undefined;
}

async function saveComments(pagename: string, comments: string, conn: mariadb.PoolConnection): Promise<any> {
    const sql = "insert into PageComments(PageName,Comments) values(?,?) on duplicate key update Comments=values(Comments)";
    const ans = await doQuery(sql, conn, [pagename, comments]);
    if (ans) {
        return ans;
    } else {
        return undefined;
    }
}

async function getComments(pagename: string, conn: mariadb.PoolConnection): Promise<any> {
    const sql = "select * from PageComments where PageName = ? ";
    const ans = await doQuery(sql, conn, [pagename]);
    if (ans) {
        return ans;
    } else {
        return undefined;
    }
}
