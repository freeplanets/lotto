const enum ErrCode {
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
  NOT_ENOUGH_NUM = 11
}
export default ErrCode;
