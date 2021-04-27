export enum ETable {
  ADD = 1,
  UPDATE,
  QUERY
}
export interface IKeyVal {
  key: string;
  value: string | number | boolean;
}
export interface ITableData {
  TableName: string;
  keys?: string[];
  fields?: IKeyVal[];
}
