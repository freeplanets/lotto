export default abstract class ASetSql<T> {
  public abstract getSql(t: T): string;
}
