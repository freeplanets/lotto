import AWebSocket from "./AWebSocket";
// import StrFunc from '../Functions/MyStr';

export default class ChatWS extends AWebSocket {
	public OnMessage(data: string) {
		// const msg = StrFunc.toJSON(data);
		console.log("received msg:", data);
	}
	public OnOpen() {
		console.log("ChatServer connected:", this.url);
	}
}
