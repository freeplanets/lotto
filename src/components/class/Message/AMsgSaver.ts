import { IMsg } from "../../../DataSchema/if";

export default abstract class AMsgSaver {
	public abstract UserConnected(uid: string): Promise<IMsg>;
	public abstract UserClosed(uid: string): Promise<IMsg>;
	public abstract UserList(hostname: string): Promise<IMsg>;
	// abstract SaveMessage(sender:string, receiver:string, text:string):Promise<IMsg>;
	// abstract GetMessage(uid:string):Promise<IMsg>;
	// abstract GetService(hostname:string):Promise<IMsg>;
	protected resolveId(id: string) {
		const res = id.split("-");
		return { hostname: res[0], identity: parseInt(res[1], 10), uid: res[2] };
	}
}
