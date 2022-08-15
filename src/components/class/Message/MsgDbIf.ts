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
export interface ChatPic {
	id: number;
	cont: any;
}
export interface SerSiteData extends IHasID {
	SiteName?: string;
	NotifyUrl: string;
	tkey?: string;
	IP: string;
}
export interface SerClosedData {
  title: string;
  MemberCid: string;
  ServeCid: string;
  cont: any;
}
