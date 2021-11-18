import { AnyObject } from "../DataSchema/if";
import XFunc from "./XFunc";
/**
 * 半波
 * 紅單 0
 * 紅雙 1
 * 紅大 2
 * 紅小 3
 * 藍單 4
 * 藍雙 5
 * 藍大 6
 * 藍小 7
 * 綠單 8
 * 綠雙 9
 * 綠大 10
 * 綠小 11
 */
const HalfWaveOE: AnyObject = {};
const HalfWaveBS: AnyObject = {};
HalfWaveOE["00"] = 0;
HalfWaveOE["01"] = 1;
HalfWaveBS["00"] = 2;
HalfWaveBS["01"] = 3;
HalfWaveOE["10"] = 4;
HalfWaveOE["11"] = 5;
HalfWaveBS["10"] = 6;
HalfWaveBS["11"] = 7;
HalfWaveOE["20"] = 8;
HalfWaveOE["21"] = 9;
HalfWaveBS["20"] = 10;
HalfWaveBS["21"] = 11;
export interface IMarkSixNums {
    Num: number;
    OddEven?: number;
    BigSmall?: number;
    ColorWave?: number;
    TailNum?: number;
    TailOE?: number;
    TailBS?: number;
    Total?: number;
    TotOE?: number;
    TotBS?: number;
    Zadic?: number;
    HalfWave?: number[];
    FiveElements?: number;
}
export default class MSNum extends XFunc {
    private num: IMarkSixNums = {Num: 0};
    private midNum = 25;
    private tieNum = 49;
    constructor(num: number, spno: boolean= false, hasZero?: boolean) {
        super(hasZero);
        this.num.Total = this.getDgtTotal(num);
        this.num.OddEven = this.getOddEven(num);
        this.num.BigSmall = this.getBigSmall(num, this.midNum, this.tieNum);
        this.num.ColorWave = this.getColorWave(num);
        this.num.TailNum = this.getTail(num);
        this.num.TailOE = this.getTailBS(num);
        this.num.TailBS = this.getTailBS(num);
        this.Num.TotOE = this.getTotalOE(num);
        this.num.TotBS = this.getTotalBS(num);
        this.num.Zadic = this.getZodic(num);
        if (spno || hasZero) {
            this.num.HalfWave = [];
            const spnum = num as number;
            if ( spnum < 49 ) {
                const OE: string = this.num.ColorWave + "" + this.num.OddEven;
                const BS: string = this.num.ColorWave + "" + this.num.BigSmall;
                this.num.HalfWave.push(HalfWaveOE[OE]);
                this.num.HalfWave.push(HalfWaveBS[BS]);
                this.num.FiveElements = this.getFiveElements(num);
            }
            // console.log("FiveElements", this.num.FiveElements);
        }
        if (typeof num === "string") {
            num = parseInt(num, 10);
        }
        this.num.Num = num;
    }
    get Num(): IMarkSixNums {
        return this.num;
    }
}
