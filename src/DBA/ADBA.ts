import ASetSql from "./ASetSql";
export default abstract class ADBA<T> {
  public abstract add(t: T): void;
  public abstract update(t: T): void;
  public abstract remove(t: T): void;
  public abstract getSql(t: T, f: ASetSql<T>): string;
}
/**
 * {
 *  "eventType":"24hrTicker",
 *  "eventTime":1618383130403,
 *  "symbol":"ETHUSDT",
 *  "priceChange":"222.51000000",
 *  "priceChangePercent":"10.309",
 *  "weightedAveragePrice":"2273.15854395",
 *  "previousClose":"2158.50000000",
 *  "currentClose":"2381.00000000",
 *  "closeQuantity":"1.29442000",
 *  "bestBid":"2380.99000000",
 *  "bestBidQuantity":"30.50525000",
 *  "bestAskPrice":"2381.00000000",
 *  "bestAskQuantity":"12.61465000",
 *  "open":"2158.49000000",
 *  "high":"2400.00000000",
 *  "low":"2150.01000000",
 *  "baseAssetVolume":"869948.91776000",
 *  "quoteAssetVolume":"1977531815.21010950",
 *  "openTime":1618296730397,
 *  "closeTime":1618383130397,
 *  "firstTradeId":354768879,
 *  "lastTradeId":356244776,
 *  "trades":1475898
 * }
 */
