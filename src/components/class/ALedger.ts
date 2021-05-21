import { PoolConnection } from 'mariadb';
import { AskTable, IMsg } from '../../DataSchema/if';

export default abstract class ALedger {
  abstract add(ask:AskTable, conn:PoolConnection):Promise<IMsg>;
}