export enum ErrCode {
  PASS = 0,
  LESS_MIN_HAND = 1,
  OVER_MAX_HAND = 2,
  OVER_SINGLE_NUM = 3,
  OVER_UNION_NUM = 4,
  NUM_STOPED = 5,
  NO_CREDIT = 6,
  NO_LOGIN = 7,
  DELETE_TERM_ERR = 8,
  NOT_DEFINED_ERR = 9,
  MISS_PARAMETER = 10,
  NOT_ENOUGH_NUM = 11,
  GET_CONNECTION_ERR = 12,
  DB_QUERY_ERROR = 13,
  TRY_CATCH_ERROR = 14,
  NO_DATA_FOUND = 15,
  OVER_ONE_HAND = 16,
  OVER_FULL_STORAGE = 17,
  IN_SHORT_TERM = 18,
  HAS_ASK_IN_PROCESS = 19,
}
export enum FuncKey {
	SET_CHANNEL = "SetChannel",
	CLIENT_INFO = "ClientInfo",
  MESSAGE = "sendMessage",
  SAVE_MESSAGE = "saveMessage",
  GET_CRYPTOITEM_LEVER = "getCryptoItemLever",
  GET_CRYPTOITEM_ALL = "getCryptoItemAll",
  GET_CRYPTOITEM_CODE_DISTINCT = "getCryptoItemCodeDistinct",
  GET_UNFINISHED_ASKS = "getUnFinishedAsks",
}
export enum PriceCheckType {
  CurPrice = 0,
  LimitPrice = 1,
}
export enum Channels {
  ASK = "AskChannel",
  API_SERVER = "AskCreator",
  ADMIN = "AdminChannel",
  PUB = "PublicChannel",
}

export enum CreditType {
	DEPOSIT = 0,
	WITHDRAW,
	CRYPTOCUR,
}

export enum MemoType {
	NEW = 0,
	SETTLE,
	DELETE,
}
export enum StopType {
  OPEN = 0,
  LONG_STOP = 1,
  SHORT_STOP = 2,
  STOPED = 3
}
