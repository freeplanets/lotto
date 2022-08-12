import { IHasID } from "../../../DataSchema/if";
export interface SerLobby {
	cid: string;
	hostname?: string;
	identity?: number;
	uid?: string;
	isActive?: number;
	ModifyTime?: string;
}

export interface SerChat {
	sender: string;
	receiver: string;
	cont: string;
	isReaded?: number;
	ModifyTime?: string;
}
