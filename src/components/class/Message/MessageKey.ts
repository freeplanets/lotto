import sha256 from "sha256";

interface MsgKey {
	sha256: string;
}

export class MessageKey implements MsgKey {
	private SenderID: number;
	private ReceiverID: number;
	constructor(SenderID: number, ReceiverID: number) {
		this.SenderID = SenderID;
		this.ReceiverID = ReceiverID;
	}
	get sha256() {
		return sha256(`Sender:${this.SenderID}, Receiver:${this.ReceiverID}`);
	}
}
