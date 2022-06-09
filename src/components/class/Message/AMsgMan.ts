import { IMsg } from "../../../DataSchema/if";

export default abstract class AMsgMan {
	public abstract UserConnected(id: string): Promise<IMsg>;
	public abstract UserClosed(id: string): Promise<IMsg>;
	public abstract SaveMessage(Sender: string, Receiver: string, data: any): Promise<IMsg>;
}
