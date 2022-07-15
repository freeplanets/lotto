import axios from "axios";
import busboy from "busboy";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { PoolConnection } from "mariadb";
// import os from "os";
// import path from "path";
import JTable from "../class/JTable";
import ChatToDB from "../components/class/Message/ChatToDB";
import { SerChat } from "../components/class/Message/MsgDbIf";
import { ErrCode } from "../DataSchema/ENum";
import { IDbAns, IMsg } from "../DataSchema/if";
import { getConnection } from "../func/db";
import { JWT_KEY } from "../func/db";

const app: Router = Router();
app.get("/SorList", async (req: Request, res: Response) => {
	let msg: IMsg = { ErrNo: ErrCode.MISS_PARAMETER };
	const param = req.query;
	// console.log(param);
	if (param.hostname) {
		const mtd = new ChatToDB();
		msg = await mtd.UserList(param.hostname as string);
	}
	res.send(JSON.stringify(msg));
});
app.get("/ChatList", async (req: Request, res: Response) => {
	let msg: IMsg = { ErrNo: ErrCode.MISS_PARAMETER };
	const param = req.query;
	console.log("ChatList", param);
	if (param.uid) {
		const mtd = new ChatToDB();
		msg = await mtd.GetMessage(param.uid as string);
		/*
		if (msg.ErrNo === ErrCode.PASS) {
			await getImg(msg.data as SerChat[], mtd);
		}
		*/
	}
	res.send(JSON.stringify(msg));
});
interface MsgParam {
	site: string;
	passykey: string;
	startDate: string;
	endDate: string;
}
app.get("/getMessage", async (req: Request, res: Response) => {
	let msg: IMsg = { ErrNo: ErrCode.MISS_PARAMETER, ErrCon: "Miss parameters!!"};
	const param: MsgParam = req.query as any;
	if (param.site && param.passykey) {
		const mtd = new ChatToDB();
		const site = param.site.replace(/\W/g, "");
		msg = await mtd.GetSiteMessage(site, param.startDate, param.endDate);
	} else {
		msg.param = param;
	}
	res.send(JSON.stringify(msg));
});
app.get("/Image", async (req: Request, res: Response) => {
	let img;
	const param = req.query;
	console.log("Chat Image", param);
	if (param.imgId) {
		const mtd = new ChatToDB();
		img = await mtd.GetImages(parseInt(String(param.imgId), 10));
		try {
			// const b = new Blob([img]);
			console.log("Image", img);
			/*
			b.arrayBuffer().then((buf) => {
				console.log("buffer:", buf);
				res.send(b);
			});
			*/
			const b64 = Buffer.from(img.cont).toString("base64");
			const data = `data:${img.ctype};base64,${b64}`;
			res.send(data);
		} catch (err) {
			console.log("Image", err);
			res.send(img);
		}
	} else {
		const  msg: IMsg = { ErrNo: ErrCode.MISS_PARAMETER };
		res.send(JSON.stringify(msg));
	}
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
			res.send(JSON.stringify(msg));
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
app.get("/Verify", (req: Request, res: Response) => {
	let msg: any = { status: 1, errcode: ErrCode.MISS_PARAMETER };
	const param = req.query;
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
			res.send(JSON.stringify(msg));
		}).catch((err) => {
			msg.error = err;
			msg.errcode = ErrCode.APISERVER_GONE_AWAY;
			console.log("Verify err", msg);
			res.send(JSON.stringify(msg));
		});
	} else {
		res.send(JSON.stringify(msg));
	}
});
app.get("/CheckIn", (req: Request, res: Response) => {
	checkin(req.query as any, res);
});
app.post("/CheckIn", (req: Request, res: Response) => {
	checkin(req.body, res);
});
interface HasToken {
	token: string;
}
interface ChkAns {
	status: number;
	errcode?: string | number;
	error?: any;
	extra?: any;
}
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
	res.send(JSON.stringify(msg));
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
