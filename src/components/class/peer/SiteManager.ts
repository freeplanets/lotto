import CManager, {ClientManager, IClient} from "./ClientManager";

interface MGroup {
	[key: string]: ClientManager;
}

export class SiteManager {
	private MG: MGroup = {};
	public Add(client: IClient) {
		const cid = client.getId();
		const site = cid.split("-")[0];
		if (!this.MG[site]) { this.MG[site] = CManager; }
		this.MG[site].Add(client);
	}
	public Remove(cid: string) {
		const site = cid.split("-")[0];
		this.MG[site].Remove(cid);
	}
}
export default new SiteManager();
