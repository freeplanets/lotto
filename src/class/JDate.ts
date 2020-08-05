class JDate {
    get createDate(): Date {
        return this.curDate;
    }
    get DateStr() {
        const tmp: Date = new Date();
        const reg1 = /(\d+-\d+-\d+).*/;
        return tmp.toJSON().replace(reg1, "$1");
    }
    get LocalDateStr() {
        const d =  this.curDate.toLocaleDateString("zh-TW", {timeZone: "Asia/Taipei"});
        return this.dateAddZero(d);
    }
    private curDate: Date;
    constructor() {
        this.curDate = new Date();
    }
    public LeftSec(dStr: string): number {
        return Math.round((this.getTime(dStr) - new Date().getTime()) / 1000);
    }
    public getDate() {
        return new Date().getDate();
    }
    public dateAddZero(d: string): string {
        const sep: string = d.indexOf("-") > -1 ? "-" : "/";
        const dArr: string[] = d.split(sep);
        const newA = dArr.map((s) => {
            return this.addZeroIfUnderTen(s);
        });
        return newA.join(sep);
    }
    public addZeroIfUnderTen(v: string|number): string {
        const i: number = typeof(v) === "string" ? parseInt(v, 10) : 0;
        if (i < 10) { return "0" + i; }
        return "" + i;
    }
    public timeMoveSec(time: string, df: number): string {
        const hms: number[] = time.split(":").map((s) => parseInt(s, 10));
        const total: number = hms[0] * 3600 + hms[1] * 60 + hms[2] + df;
        const sec: number = total % 60;
        const totalmin = (total - sec) / 60;
        const min: number = totalmin % 60;
        const hour: number = (totalmin - min) / 60;
        return `${this.addZeroIfUnderTen(hour)}:${this.addZeroIfUnderTen(min)}:${this.addZeroIfUnderTen(sec)}`;
      }
    private getTime(dStr: string): number {
        if (!this.DateStrChk(dStr)) {
            dStr = this.DateStr + " " + dStr;
        }
        const d = new Date(dStr);
        return d.getTime();
    }
    private DateStrChk(s: string): boolean {
        const reg = /^\d+-\d+-\d+.*$/;
        const regExp = new RegExp(reg);
        return regExp.test(s);
    }
}
export default new JDate();
