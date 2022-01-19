import { IncomingMessage } from "http";
import https from "https";
import StrFunc from "../../../components/class/Functions/MyStr";

export default class BTC {
	constructor(private sourceUrl =  "localhost:8332") {}
	public async getHeght(): Promise<number> {
		const url = `${this.sourceUrl}/`;
		const ans = await this.get(url);
		const json = StrFunc.toJSON(String(ans));
		if (json.chain.height) {
			return Number(json.chain.height);
		}
		return 0;
	}
	public async getBlock(height: any) {
		const url = `${this.sourceUrl}/block/${height}`;
		const ans = await this.get(url);
		const json = StrFunc.toJSON(String(ans));
		if (json.hash) {
			return String(json.hash);
		}
		return "";
	}
	private async get(url: string) {
		return new Promise((resolve, reject) => {
		https.get(`http://${url}`, (res: IncomingMessage) => {
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
