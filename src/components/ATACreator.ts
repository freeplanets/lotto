import NewOrder from './class/NewOrder';
import Deal from './class/Deal';
import AskTableAccess from './class/AskTableAccess';
import { PoolConnection } from 'mariadb';
import { AskTable, IMsg } from '../DataSchema/if';

export default class ATACreator {
  private ATA:AskTableAccess<AskTable>;
  constructor(ask:AskTable, conn:PoolConnection, tableName:string){
    switch(ask.ProcStatus){
      case 2:
        this.ATA = new Deal(ask,conn,tableName);
        break;
      default:
        this.ATA = new NewOrder(ask,conn,tableName);
    } 
  }
  async doit():Promise<IMsg>{
    return await this.ATA.doit();
  }
}
