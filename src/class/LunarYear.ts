import LunarInfo from "./LunarInfo";
const baseY: number = 1900;
const lastDataYear: number = 2500;
// 傳回農曆 y年的總天數
function lunarYearDays(y: number) {
    let sum: number = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) {
        sum += ((LunarInfo[y - baseY] & i) ? 1 : 0);
    }
    return sum + leapDays(y);
}

// 傳回農曆 y年閏月的天數
function leapDays(y: number) {
    if (leapMonth(y)) {
        return ((LunarInfo[y - baseY] & 0x10000) ? 30 : 29);
    } else {
        return 0;
    }
}

// 傳回農曆 y年閏哪個月 1-12 , 沒閏傳回 0
function leapMonth(y: number) {
    return (LunarInfo[y - baseY] & 0xf);
}

// 傳回農曆 y年m月的總天數
function monthDays(y: number, m: number) {
    return ((LunarInfo[y - baseY] & (0x10000 >> m)) ? 30 : 29);
}

// 算出農曆, 傳入日期物件, 傳回農曆日期物件
// 該物件屬性有 .year .month .day .isLeap .yearCyl .dayCyl .monCyl
export interface ILunar {
    year?: number;
    month?: number;
    day?: number;
    isLeap?: boolean;
    yearCyl?: number;
    monCyl?: number;
    dayCyl?: number;
}
export function Lunar(d: Date): ILunar {
    const ans: ILunar = {};
    let leap: number = 0;
    let temp: number = 0;
    let i: number;
    const baseD = new Date(1900, 0, 31);
    let offset = (d.getTime() - baseD.getTime()) / 86400000;
    // console.log("Lunar:", offset);
    ans.dayCyl = offset + 40;
    ans.monCyl = 14;
    for (i = baseY; i < lastDataYear && offset > 0; i++) {
        temp = lunarYearDays(i);
        offset -= temp;
        ans.monCyl += 12;
    }
    if (offset < 0) {
        offset += temp;
        i--;
        ans.monCyl -= 12;
    }

    ans.year = i;
    ans.yearCyl = i - 1864;

    leap = leapMonth(i);   // 閏哪個月
    ans.isLeap = false;

    for (i = 1; i < 13 && offset > 0; i++) {
        // 閏月
        if (leap > 0 && i === (leap + 1) && ans.isLeap === false) {
            --i;
            ans.isLeap = true;
            temp = leapDays(ans.year);
        } else {
            temp = monthDays(ans.year, i);
        }
        // 解除閏月
        if (ans.isLeap && i === (leap + 1)) {
            ans.isLeap = false;
        }
        offset -= temp;
        if (!ans.isLeap) {
            ans.monCyl++;
        }
    }
    if (offset === 0 && leap > 0 && i === leap + 1) {
        if (ans.isLeap) {
            ans.isLeap = false;
        } else {
            ans.isLeap = true;
            --i;
            --ans.monCyl;
        }
    }

    if (offset < 0) {
        offset += temp;
        --i;
        --ans.monCyl;
    }
    ans.month = i;
    ans.day = offset + 1;
    return ans;
}
const lunar: ILunar = Lunar(new Date());
// console.log('LunarYear:',lunar);
