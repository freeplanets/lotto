import {ISetl} from "../DataSchema/if";
import MarkSixST from "./SettleType/MarkSixST";
export interface IGType {
    [key: number]: string;
}
const gtype: IGType = [];
gtype[1] = "MarkSix";
export const GType: IGType = gtype;
interface ISettleNum {
    [key: string]: ISetl[];
}

const ST: ISettleNum = {};
ST.MarkSix = MarkSixST;
export default ST;
