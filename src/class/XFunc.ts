import {ZMap} from "./Animals";
import ColorWave from "./ColorWave";
/**
 *  單 0,雙 1
 *  大 0,小 1
 *  紅 0, 藍 1, 綠2
 */
interface IFunc {
    getOddEven(num: string|number, tieNum?: number): number;
    getBigSmall(num: string|number, midNum: number, tieNum?: number): number;
    getTailBS(num: string|number): number;
    getTailOE(num: string|number): number;
    getTotalBS(num: string|number): number;
    getTotalOE(num: string|number): number;
    getZodic(num: string|number): number;
    getDgtTotal(num: string|number): number;
    getColorWave(num: string|number): number;
    getHalfWave(num: string|number): number;
    getFiveElements(num: string|number): number;
    getTail(num: string|number): number;
    toInt(num: string|number): number;
 }

export default class XFunc implements IFunc {
    public getZodic(num: number): number {
        return ZMap[num];
    }
    public getOddEven(num: string|number, tieNum?: number) {
        if (tieNum) {
            return 2;
        }
        num = this.toInt(num);
        return (num + 1) % 2;     // 單為0 ,雙為1
    }
    /**
     * 回傳大0,小1,平手2
     * @param num
     * @param midNum    中位數(未傳則視為 5)
     * @param tieNum    如果有平手之值
     */
    public getBigSmall(num: string|number, midNum?: number, tieNum?: number): number {
        num = this.toInt(num);
        if (tieNum) {
            if (num === tieNum) {
                return 2;
            }
        }
        if (!midNum) {
            midNum = 5;
        }
        if (num < midNum) {
            return 1;
        }
        return 0;
    }
    public getTailBS(num: string|number): number {
        const n = this.getTail(num);
        return this.getBigSmall(n);
    }
    public getTailOE(num: string|number): number {
        const n = this.getTail(num);
        return this.getOddEven(n);
    }
    public getTotalBS(num: string|number): number {
        const tot = this.getDgtTotal(num);
        return this.getBigSmall(tot);
    }
    public getTotalOE(num: string|number): number {
        const tot = this.getDgtTotal(num);
        return this.getOddEven(tot);
    }
    public getDgtTotal(num: string|number): number {
        const n: string[] = (num + "").split("");
        let tot: number = 0;
        n.map((itm) => {
            tot = tot + parseInt(itm, 10);
        });
        return tot;
    }
    public getColorWave(num: string|number): number {
        num = this.toInt(num);
        return ColorWave[num];
    }
    public getHalfWave(num: string|number): number {

        return 0;
    }
    public getTail(num: string|number): number {
        const n = (num + "").split("");
        return parseInt(n[n.length - 1], 10);
    }
    public getFiveElements(num: string|number): number {
        const fe: number[] = [4, 0, 1, 2, 3];
        num = this.toInt(num);
        return fe[num % 5];
    }
    public toInt(num: string|number): number {
        if (typeof(num) === "string") {
            num = parseInt(num, 10);
        }
        return num;
    }
}
