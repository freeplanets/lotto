import { IKeyVal } from "../../../DataSchema/if";
import AFilter from "./AFilter";
import KeyValFilter from "./KeyValFilter";

export default class StringFilter extends AFilter {
  public setFilter(filter: string) {
    const fIdx = filter.indexOf("\\");
    if (fIdx !== -1) {
      try {
        const flter: IKeyVal = JSON.parse(filter.replace(/\\/g, ""));
        const kv = new KeyValFilter();
        return kv.setFilter(flter);
      } catch (err) {
        console.log("StringFilter setFilter error:", err, filter);
      }
    }
    return filter;
  }
}
