export enum FuncKey {
  SET_CHANNEL = "SetChannel",
}
export enum Channels {
  ASK = "AskChannel",
  PUB = "PublicChannel",
}
export interface WsMsg {
  Func?: FuncKey;
  Asks?: any;
  Ask?: any;
  Balance?: number;
  LedgerTotal?: any;
  Message?: string;
  ChannelName?: string;
  UserID?: number;
  [key: string]: any;
}
