import { IMsg } from "../../../DataSchema/if";
export default interface Msgkey {
	List(): Promise<IMsg>;
	Add(mkey?: string): Promise<IMsg>;
	isKeyExist(mkey: string): Promise<boolean>;
}
