import { IncomingMessage } from "http";
import https from "https";

export default class BTC {
	constructor(private sourceUrl =  "blockstream.info/api") {}
	public getHeght() {
		const url = `${this.sourceUrl}/blocks/tip/height`;
		return this.get(url);
	}
	public getBlock(height: any) {
		const url = `${this.sourceUrl}/block-height/${height}`;
		return this.get(url);
	}
	private async get(url: string) {
		return new Promise((resolve, reject) => {
		https.get(`https://${url}`, (res: IncomingMessage) => {
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
