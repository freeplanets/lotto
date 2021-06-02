import { IKeyVal } from "../../DataSchema/if";
import AFilter from "./AFilter";

/**
 * Cond 不同於 '=' 的條件， 如果是 'between' 必需有 Val2 值
 */
export default class KeyValFilter extends AFilter {
  public setFilter(filter: IKeyVal): string {
    if (filter.Key) {
      return this.hasKeyElement(filter);
    } else {
      return this.noKeyElement(filter);
    }
  }
  private hasKeyElement(f: IKeyVal): string {
    let str = this.addQuotationMarks(f.Val);
    if (f.Cond) {
      if (f.Cond.toLowerCase() === "between") {
        str = `${str} and ${this.addQuotationMarks(f.Val2)}`;
      }
    } else {
      f.Cond = "=";
    }
    return ` ${f.Key} ${f.Cond} ${str} `;
  }
  private addQuotationMarks(v: any): string {
    return typeof(v) === "string" ? `'${v}'` : `${v}`;
  }
  private noKeyElement(filter: IKeyVal): string {
    const tmp = Object.keys(filter).map((key) => {
      let ftr = "";
      switch (typeof filter[key]) {
          case "number":
              ftr = `${key} = ${filter[key]}`;
              break;
          case "boolean":
              ftr = `${key}`;
              break;
          default:
              ftr = `${key} = ''`;
      }
      return ftr;
    });
    return tmp.join(" and ");
  }
}
