import { IKeyVal } from "../../../DataSchema/if";
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
      /*
      if (f.Cond.toLowerCase() === "between") {
        str = `${str} and ${this.addQuotationMarks(f.Val2)}`;
      }
      */
      switch (f.Cond.toLowerCase()) {
        case "between":
          str = `${str} and ${this.addQuotationMarks(f.Val2)}`;
          break;
        case "or":
          return this.KeyEqualOR(f);
          break;
      }
    } else {
      f.Cond = "=";
    }
    return ` ${f.Key} ${f.Cond} ${str} `;
  }
  private KeyEqualOR(f: IKeyVal) {
    let fields: string[] = [];
    let filter = "";
    if (f.Key) {
      if (f.Val2 !== undefined) {
        filter = `(${f.Key} = ${this.addQuotationMarks(f.Val)} or ${f.Key} = ${this.addQuotationMarks(f.Val2)})`;
      } else {
        fields = f.Key.split(",");
        const filters = fields.map((field) => {
          return `${field} = ${this.addQuotationMarks(f.Val)}`;
        });
        filter = `(${filters.join(" or ")})`;
      }
    } else {
      filter = `${f.Key} = ${this.addQuotationMarks(f.Val)}`;
    }
    return filter;
  }
  private addQuotationMarks(v: any): string {
    let tmp = v;
    if (typeof(v) === "string") {
      if (v.indexOf("(") === -1) { tmp = `'${v}'`; }
    }
    return tmp;
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
              ftr = `${key} = '${filter[key]}'`;
      }
      return ftr;
    });
    return tmp.join(" and ");
  }
}
