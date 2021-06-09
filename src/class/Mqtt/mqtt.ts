import AWS from "aws-sdk";
// import WebSocket from 'ws';
import config from "./config";
import { Channels } from "./msgif";
// import AWSMqttClient from 'aws-mqtt/lib/NodeClient';

import AWSMqttClient from "aws-mqtt/lib/NodeClient";

AWS.config.region = config.aws.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: config.aws.cognito.identityPoolId,
});
class Mqtt {
  private client;
  // private clients=[];
  private clientId: string;
  private chPub = config.topics.announcement;
  private chMe: string;
  constructor(client?: string) {
    if (client) { this.clientId = client; } else { this.clientId = "lotto@kingbet"; }
    this.chMe = `${config.topics.room}${this.clientId}`;
    this.client = new AWSMqttClient({
      region: AWS.config.region,
      credentials: AWS.config.credentials,
      endpoint: config.aws.iot.endpoint,
      clientId: this.clientId,
      will: {
        topic: config.topics.room + this.clientId,			// 離線時 發佈 leave 至私人頻道
        payload: "leave",
        qos: 0,
        retain: false
      }
    });
    this.client.on("connect", () => {
      this.addLogEntry("Successfully connected to AWS MQTT Broker!:-)");
      this.subscribe(this.chPub);				// 訂閱 公告頻道
      // this.subscribe(config.topics.tick)					// 訂閱 報價頻道
      this.subscribe(this.chMe);			// 訂閱 私人頻道 可發佈訊息
      this.client.publish(this.chMe, "enter");	// 連線成功時 發佈 enter 訊息至私人頻道
    });
    this.client.on("message", async (topic: string, message: string) => {
      this.addLogEntry(`on message: ${topic} => ${message}`);
      // const sendMsg = JSON.stringify(senddata);
      // this.send(sendMsg);
    });

    this.client.on("close", () => {
      this.addLogEntry("Closed:-(");
    });

    this.client.on("offline", () => {
      this.addLogEntry("Went offline:-(");
    });
  }
  public JsonParse(str: string, key?: number) {
    try {
      return JSON.parse(str);
    } catch (err) {
      const tmp: any = str;
      const newstr = String.fromCharCode.apply(null, tmp);
      if (newstr === "leave") { return; }
      console.log("JSON Parse Error:", str, err);
      /*
      if(!key){
        const tmp:any = str;
        const newstr = String.fromCharCode.apply(null, tmp);
        return this.JsonParse(newstr,1);
      }
      */
      return;
    }
  }
  public sendAsk(msg: string) {
    this.client.publish(this.chPub, msg);
  }
  public async send(data): Promise<void> {
    // this.SP.getPrice(data);
    /*
    this.clients.forEach(async (elm:AskSettlement)=>{
      await elm.Accept(data);
    });
    */
  }
  /*
  AddClinet(clt){
    this.clients.push(clt);
  }
  RemoveClient(clt){
    const idx = this.clients.indexOf(clt);
    if(idx !== -1) this.clients.splice(idx, 1);
  }
  set Clients(clt){
    this.clients = clt;
  }
  */
  public subscribe(topic: string) {
    this.client.subscribe(topic);
    this.addLogEntry(`subscribe to ${topic}`);
  }

  public addLogEntry(info: string) {
    console.log(info);
  }
}
export default Mqtt;
