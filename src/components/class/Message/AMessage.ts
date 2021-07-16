import { IMsg } from "../../../DataSchema/if";
export default abstract class AMessage {
	public abstract Add(): Promise<IMsg>;
	public abstract Get(): Promise<IMsg>;
}
