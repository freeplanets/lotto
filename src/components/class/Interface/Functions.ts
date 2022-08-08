import { PoolConnection } from "mariadb";
import { IMsg } from "../../../DataSchema/if";

export type GetPostFunction = (param: any, conn: PoolConnection) => Promise<IMsg>;
export type ConnProvider = (param: any, f: GetPostFunction) => Promise<IMsg>;
