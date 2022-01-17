import { IMsg } from "../../../DataSchema/if";

export default abstract class AGameAuto {
	public abstract Cancel(): Promise<IMsg>;
	public abstract Settle(): Promise<IMsg>;
	public abstract Create(): Promise<IMsg>;
}
