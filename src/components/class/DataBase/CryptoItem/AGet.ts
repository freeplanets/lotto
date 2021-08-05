import { AnyObject  } from "../../../../DataSchema/if";
export default abstract class AGet {
	public abstract getItem(): Promise<any>;
}
