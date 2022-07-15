import BTC from "./BTC";

interface HasKeyField {
	TermID: string;
	Result: string;
}

export default class HasHash {
	private btc = new BTC();
	public async check(data: any, GType: string) {
		return new Promise<any>((resolve) => {
			if (GType === "BTCHash" || GType === "HashSix") {
				if (Array.isArray(data)) {
					(data as HasKeyField[]).forEach(async (itm) => {
						if (!itm.Result.trim()) {
							itm.Result = await this.btc.getBlock(itm.TermID);
						}
					});
					// console.log("end check:", data);
					resolve(true);
				} else {
					resolve(true);
				}
			}	else {
				resolve(true);
			}
		});
	}
}
