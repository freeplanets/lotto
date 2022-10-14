import axios from "axios";
import busboy from "busboy";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { PoolConnection } from "mariadb";
// import os from "os";
// import path from "path";
import JTable from "../class/JTable";
import AttachConn from "../components/class/Functions/AttachConn";
import StrFunc from "../components/class/Functions/MyStr";
import ChatFunc from "../components/class/Message/ChatFunc";
import { SerChat, SerSiteData } from "../components/class/Message/MsgDbIf";
import { ErrCode } from "../DataSchema/ENum";
import { IDbAns, IMsg } from "../DataSchema/if";
import { getConnection } from "../func/db";
import { JWT_KEY } from "../func/db";

interface HasToken {
	token: string;
}
interface ChkAns {
	status: number;
	errcode?: string | number;
	error?: any;
	extra?: any;
	data?: any;
}
interface MsgParam {
	site: string;
	passykey: string;
	startDate: string;
	endDate: string;
}

const app: Router = Router();
const CFunc = new ChatFunc();

app.get("/", async (req: Request, res: Response) => {
	let msg: IMsg = { ErrNo: ErrCode.MISS_PARAMETER };
	msg = await AttachConn(req.query, CFunc.CheckIn);
	console.log("checkin", msg);
	res.send(StrFunc.stringify(msg));
});
app.post("/Notify", async (req: Request, res: Response) => {
	const msg: IMsg = { ErrNo: ErrCode.MISS_PARAMETER, ErrCon: "MISS_PARAMETER" };
	const param = req.body;
	// console.log("Notify:", param);
	const { site } = param;
	if (site) {
		const chk = await AttachConn(param, CFunc.CheckIn);
		if (chk.ErrNo === ErrCode.PASS) {
			const { NotifyUrl } = chk.data as SerSiteData;
			const ans: ChkAns = await NotifySiteUser(NotifyUrl);
			console.log("Notify ans", ans);
			if (ans.status === 0) {
				msg.ErrNo = ErrCode.PASS;
				msg.ErrCon = "Pass";
			} else {
				msg.ErrNo = ErrCode.NOT_DEFINED_ERR;
				msg.ErrCon = "";
				msg.error = ans;
			}
			res.send(StrFunc.stringify(msg));
		}
	} else {
		res.send(StrFunc.stringify(msg));
	}
});
app.get("/notifysite", async (req: Request, res: Response) => {
	res.send({status: 0});
});
app.get("/SorList", async (req: Request, res: Response) => {
	const msg = await AttachConn(req.query, CFunc.UserList);
	// console.log("SorList:", req.query, msg);
	res.send(StrFunc.stringify(msg));
});
app.get("/ChatList", async (req: Request, res: Response) => {
	const msg = await AttachConn(req.query, CFunc.GetMessage);
	res.send(StrFunc.stringify(msg));
});
app.get("/getMessage", async (req: Request, res: Response) => {
	const msg = await AttachConn(req.query, CFunc.GetSiteMessage);
	const ans: ChkAns = {
		status: msg.ErrNo ? 1 : 0,
		data: msg.data,
	};
	res.send(StrFunc.stringify(ans));
});
app.get("/getClosedMsg", async (req: Request, res: Response) => {
	console.log("getClosedMsg query:", req.query);
	const msg = await AttachConn(req.query, CFunc.GetClosedMsg);
	let ans: any;
	if (req.query.act) {
		ans = msg;
	} else {
		ans = {
			status: msg.ErrNo ? 1 : 0,
			data: msg.data,
		};
	}
	res.send(StrFunc.stringify(ans));
});
app.get("/Image", async (req: Request, res: Response) => {
	const msg = await AttachConn(req.query, CFunc.GetImages);
	res.send(StrFunc.stringify(msg));
});
app.post("/SorGet", async (req: Request, res: Response) => {
	// console.log("SorGet invoked!!", os.tmpdir());
	// console.log("files", req);
	const bb = busboy({headers: req.headers, defParamCharset: "utf8"});
	let msg: IMsg = { ErrNo: ErrCode.DB_QUERY_ERROR};
	const chatdata: SerChat = {
		sender: "",
		receiver: "",
		cont: "",
	};
	let conn: PoolConnection | undefined;
	bb.on("file", async (name, file, info) => {
		console.log("file info", info);
		const { filename, encoding, mimeType } = info;
		console.log(
			`File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
			filename,
			encoding,
			mimeType
		);
		// const tmpfile = path.join(os.tmpdir(), filename);
		// console.log("dir:", tmpfile);
		// file.pipe(fs.createWriteStream(tmpfile));
		let imgdata: any = null;
		file.on("data", (data) => {
			if (!imgdata) {
				imgdata = data;
			} else {
				imgdata = Buffer.concat([imgdata, data]);
			}
		});
		file.on("end", async () => {
			console.log("file end");
			conn = await getConnection("SerCat");
			if (conn) {
				const ans = await savefile( mimeType, imgdata, conn);
				console.log("savefile", ans);
				if (ans && ans.insertId) {
					chatdata.cont = `imgId:${ans.insertId}`;
					if (conn) {
						console.log("chatdata", chatdata);
						msg = await saveChat(chatdata as SerChat, conn);
					}
				}
			}
			console.log(`File [${name}] done`);
			console.log("saveChat:", msg);
			res.send(StrFunc.stringify(msg));
		});
		file.on("close", () => {
			console.log("file close");
		});
		/*
		const buffers: any = [];
		file.on("data", (data) => {
			console.log(`File [${name}] got ${data.length} bytes`);
			buffers.push(data);
		}).on("close", () => {
			console.log(`File [${name}] done`);
		});
		*/
	});
	bb.on("field", (name, val, info) => {
		chatdata[name] = val;
		console.log(`Field [${name}]: value: %j`, val, info);
	});
	bb.on("close", async () => {
		console.log("Done parsing form!", chatdata);
		// res.writeHead(303, { Connection: "close", Location: "/" });
	});
	req.pipe(bb);
});
app.get("/Verify", async (req: Request, res: Response) => {
	let msg: IMsg = { ErrNo: ErrCode.MISS_PARAMETER , ErrCon: "MISS_PARAMETER" };
	const param = req.query;
	// console.log("Verify", param);
	if (param.token) {
		let token = param.token as string;
		if (token.indexOf("#/") !== -1) { token = token.substring(0, token.length - 2); }
		console.log("Verify start");
		const user = jwt.decode(token);
		msg = await AttachConn(user, CFunc.CheckIn);
		console.log("Verify checkin", msg);
		if (msg.ErrNo === ErrCode.PASS) {
			const { tkey } = msg.data as SerSiteData;
			delete msg.data;
			if (tkey) {
				try {
					const verify = jwt.verify(token, tkey);
					// console.log("Verify verify:", verify);
					if (verify) {
						console.log("before send:", msg);
						res.send(StrFunc.stringify(msg));
						return;
					}
				} catch (err) {
					console.log("catch:", err);
					msg.ErrNo = ErrCode.NO_LOGIN;
					msg.ErrCon = "Lougout or token expired!!";
				}
			} else {
				msg.ErrNo = ErrCode.NO_LOGIN;
				msg.ErrCon = "Token expired!!";
			}
		}
	}
	console.log("Verify end");
	res.send(StrFunc.stringify(msg));
});
app.get("/VerifyOld", (req: Request, res: Response) => {
	let msg: any = { status: 1, errcode: ErrCode.MISS_PARAMETER };
	const param = req.query;
	console.log("Verify", param);
	if (param.url && param.token) {
		let token = param.token as string;
		if (token.indexOf("#/") !== -1) { token = token.substring(0, token.length - 2); }
		console.log("Verify start");
		axios.get(`${param.url}?token=${token}`).then((ans) => {
			if (ans.data) {
				msg = ans.data;
			} else {
				msg.errcode = ErrCode.NO_DATA_FOUND;
			}
			console.log("Verify after", msg);
			res.send(StrFunc.stringify(msg));
		}).catch((err) => {
			msg.error = err;
			msg.errcode = ErrCode.APISERVER_GONE_AWAY;
			console.log("Verify err", msg);
			res.send(StrFunc.stringify(msg));
		});
	} else {
		res.send(StrFunc.stringify(msg));
	}
});
app.post("/register", async (req: Request, res: Response) => {
	const msg = await AttachConn(req.body, CFunc.Register);
	msg.status = 0;
	if (msg.ErrNo !== ErrCode.PASS) {
		msg.status = 1;
		msg.errcode = msg.ErrNo;
		msg.error = msg.ErrCon;
	}
	res.send(StrFunc.stringify(msg));
});
app.get("/CheckIn", (req: Request, res: Response) => {
	checkin(req.query as any, res);
});
app.post("/CheckIn", (req: Request, res: Response) => {
	checkin(req.body, res);
});
app.post("/SwitchMessageTo", async (req: Request, res: Response) => {
	const msg = await AttachConn(req.body, CFunc.SwitchMessageTo);
	res.send(StrFunc.stringify(msg));
});
app.post("/DelMessages", async (req: Request, res: Response) => {
	const msg = await AttachConn(req.body, CFunc.DelMessages);
	res.send(StrFunc.stringify(msg));
});
app.post("/UpdateSerChat", async (req: Request, res: Response) => {
	const param = req.body;
	param.tableName = "SerChat";
	const msg = await AttachConn(param, CFunc.Update);
	res.send(StrFunc.stringify(msg));
});
app.post("/CloseMsg", async (req: Request, res: Response) => {
	const param = req.body;
	const msg = await AttachConn(param, CFunc.CloseMsg);
	res.send(StrFunc.stringify(msg));
});
app.get("/ChatHistory", async (req: Request, res: Response) => {
	const param = req.query;
	const msg = await AttachConn(param, CFunc.ChatHistory);
	res.send(StrFunc.stringify(msg));
});
function checkin(param: HasToken, res: Response) {
	const msg: ChkAns = { status: 1, errcode: ErrCode.MISS_PARAMETER };
	let token = param.token;
	// console.log("checkin", param);
	let ans: string | jwt.JwtPayload = "";
	if (token) {
		if (token.indexOf("#/") !== -1) { token = token.substring(0, token.length - 2); }
		try {
			ans = jwt.verify(token, JWT_KEY);
			// msg.extra = ans;
			msg.status = 0;
			msg.errcode = "";
		} catch (err) {
			msg.error = err;
		}
	}
	res.send(StrFunc.stringify(msg));
}
async function savefile(ctype: string, src: any, conn: PoolConnection): Promise<IDbAns|undefined> {
	return new Promise(async (resolve) => {
		let ans: IDbAns | undefined;
		console.log("savefile", src);
		const sql = "insert into SerChatPic(ctype, cont) values(?,?)";
		conn.query(sql, [ctype, src]).then((res) => {
			ans = res;
			resolve(ans);
		}).catch((err) => {
			console.log("savefile", err);
			resolve(ans);
		});
	});
}
async function saveChat(data: SerChat, conn: PoolConnection) {
	const jt = new JTable<SerChat>(conn, "SerChat");
	return jt.Insert(data);
}
async function NotifySiteUser(url: string, uid = "") {
	return new Promise<ChkAns>((resolve) => {
		const apiurl = `${url}?info=1&uid=${uid}`;
		// console.log("NotifySiteUser:", apiurl);
		axios.get(apiurl).then((res) => {
			// console.log("apians", res.data);
			resolve(res.data as ChkAns);
		}).catch((err) => {
			// console.log("apierror", err);
			const ans: ChkAns = {
				status: 1,
				error: err,
			};
			resolve(ans);
		});
	});
}
/*
async function getImg(data: SerChat[], mb: ChatToDB) {
	const imgids: number[] = [];
	data.forEach((itm) => {
		const idx = itm.cont.indexOf("imgId:");
		if (idx > -1) {
			const imgid = parseInt(itm.cont.replace("imgId:", ""), 0);
			if (imgid > 0) { imgids.push(imgid); }
		}
	});
	if (imgids.length > 0) {
		const msg = await mb.GetImages(imgids);
		if (msg.ErrNo === ErrCode.PASS) {
			const imgs = msg.data as ChatPic[];
			imgs.forEach((img) => {
				const f = data.find((itm) => itm.cont === `imgId:${img.id}`);
				if (f) {
					f.cont = img.cont;
				}
			});
		}
	}
}
*/
export default app;
