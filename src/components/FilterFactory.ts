import {IKeyVal} from "../DataSchema/if";
import AFilter from "./class/AFilter";
import KeyValArrayFilter from "./class/KeyValArrayFilter";
import KeyValFilter from "./class/KeyValFilter";
import StringFilter from "./class/StringFilter";

export default class FilterFactory {
  private filter: string;
  constructor(filter: string|IKeyVal|IKeyVal[]) {
    let af: AFilter;
    if (typeof(filter) === "string") {
      af = new StringFilter();
    } else if (Array.isArray(filter)) {
      af = new KeyValArrayFilter();
    } else {
      af = new KeyValFilter();
    }
    this.filter = af.setFilter(filter);
  }
  public getFilter() {
    return this.filter;
  }
}
