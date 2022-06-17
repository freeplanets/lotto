import { Request, Response, Router } from "express";
import MsgToDB from "../components/class/Message/MsgToDB";
import { ErrCode } from "../DataSchema/ENum";
import { IMsg } from "../DataSchema/if";

const app: Router = Router();
app.get("/SorList", async (req: Request, res: Response) => {
	let msg: IMsg = { ErrNo: ErrCode.MISS_PARAMETER };
	const param = req.query;
	if (param.hostname) {
		const mtd = new MsgToDB();
		msg = await mtd.UserList(param.hostname as string);
	}
	res.send(JSON.stringify(msg));
});
