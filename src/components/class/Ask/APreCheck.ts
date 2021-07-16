import { PoolConnection } from "mariadb";
import { WebParams } from "../../../DataSchema/if";

export default abstract class APreCheck {
	constructor(protected param: WebParams, protected conn: PoolConnection) {}

}
