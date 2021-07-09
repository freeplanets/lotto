import { IKeyVal } from "../../../DataSchema/if";
import KeyValFilter from "./KeyValFilter";

import AFilter from "./AFilter";

export default class KeyValArrayFilter extends AFilter {
  public setFilter(filter: IKeyVal[]): string {
    const kvf: KeyValFilter = new KeyValFilter();
    const tmp = filter.map((itm) => {
      // return `${itm.Key} ${itm.Cond ? itm.Cond : "=" } ${typeof(itm.Val) === "number" ? itm.Val : "'" + itm.Val + "'" }`;
      return kvf.setFilter(itm);
    });
    return tmp.join(" and ");
  }
}
