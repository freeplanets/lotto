import http, { IncomingMessage } from "http";
import StrFunc from "../../../components/class/Functions/MyStr";
// import https from "https";

export default class BTC {
	// constructor(private sourceUrl =  "blockstream.info/api") {}
	constructor(private sourceUrl =  "192.168.4.112:8332") {}
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
				// console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
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
					reject({code: res.statusCode, error: res.statusMessage});
				}

			}).on("error", (e) => {
				reject({code: 9, error: e});
				// console.error(`problem with request: ${e.message}`);
			});
		});
	}
}
