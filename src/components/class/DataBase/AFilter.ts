import {IKeyVal} from "../../../DataSchema/if";

export default abstract class AFilter {
  public abstract setFilter(filter: string|IKeyVal|IKeyVal[]): string;
}
