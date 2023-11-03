import dotenv from "dotenv";
import http, { IncomingMessage } from "http";
import StrFunc from "../../../components/class/Functions/MyStr";
// import https from "https";
dotenv.config();

export default class BTC {
	// constructor(private sourceUrl =  "blockstream.info/api") {}
	private sourceUrl =  `${process.env.HASHHOST}:8332`;
	constructor(url?: string) {
		if (url) {
			this.sourceUrl = url;
		}
		console.log("BTC source:", this.sourceUrl);
	}
	public async getHeght() {
		// const url = `${this.sourceUrl}/blocks/tip/height`;
		// return this.get(url);
		const url = `${this.sourceUrl}/`;
		const ans: any = await this.get(url);
		if (ans) {
			const json = StrFunc.toJSON(ans);
			if (json.chain.height) { return json.chain.height as number; }
		}
		return 0;
	}
	public async getBlock(height: any) {
		// const url = `${this.sourceUrl}/block-height/${height}`;
		// return this.get(url);
		const url = `${this.sourceUrl}/block/${height}`;
		const ans: any = await this.get(url);
		if (ans) {
			const json = StrFunc.toJSON(ans);
			if (json.hash) { return json.hash as string; }
		}
		return "";
	}
	private async get(url: string) {
		return new Promise((resolve, reject) => {
			http.get(`http://${url}`, (res: IncomingMessage) => {
				// console.log(`STATUS: ${res.statusCode}`);
				res.on("error", () => {
					console.log("BTC on error", res);
					reject({code: res.statusCode, error: res.statusMessage});
				});
				if (res.statusCode === 200) {
					let result = "";
					res.setEncoding("utf8");
					res.on("data", (chunk: any) => {
						result += chunk;
					});
					res.on("end", () => {
						// console.log(`BODY: ${result}`);
						resolve(result);
					});
				} else {
					console.log("BTC res error", res);
					reject({code: res.statusCode, error: res.statusMessage});
				}
			}).on("abort", () => {
				reject({code: 8, error: "connect abort"});
			}).on("error", (e) => {
				reject({code: 9, error: e});
				// console.error(`problem with request: ${e.message}`);
			});
		});
	}
}
