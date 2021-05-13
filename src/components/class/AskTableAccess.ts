import { PoolConnection } from 'mariadb';
import JTable from '../../class/JTable';
import { IMsg, AskTable } from '../../DataSchema/if';
export default abstract class AskTableAccess<T> {
  protected tb:JTable<T>
  constructor(protected ask:AskTable, protected conn:PoolConnection, tableName:string){
    this.tb = new JTable(conn,tableName);
  }
  abstract doit():Promise<IMsg>;
}