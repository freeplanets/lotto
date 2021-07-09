import {IKeyVal} from "../DataSchema/if";
import AFilter from "./class/DataBase/AFilter";
import KeyValArrayFilter from "./class/DataBase/KeyValArrayFilter";
import KeyValFilter from "./class/DataBase/KeyValFilter";
import StringFilter from "./class/DataBase/StringFilter";

export default class FilterFactory {
  private filter: string;
  constructor(filter: number | string | IKeyVal | IKeyVal[]) {
    let af: AFilter;
    switch (typeof filter) {
      case "number":
        filter = `id = ${filter}`;
      case "string":
        af = new StringFilter();
        break;
      default:
        if (Array.isArray(filter)) {
          af = new KeyValArrayFilter();
        } else {
          af = new KeyValFilter();
        }
    }
    this.filter = af.setFilter(filter);
  }
  public getFilter() {
    return this.filter;
  }
}
