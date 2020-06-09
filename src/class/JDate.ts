class JDate {
    private curDate: Date;
    constructor() {
        this.curDate = new Date();
    }
    get createDate(): Date {
        return this.curDate;
    }
    public LeftSec(dStr: string): number {
        return Math.round((this.getTime(dStr) - new Date().getTime()) / 1000);
    }
    public getDate() {
        return new Date().getDate();
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
    get DateStr() {
        const tmp: Date = new Date();
        const reg1 = /(\d+-\d+-\d+).*/;
        return tmp.toJSON().replace(reg1, "$1");
    }
    get LocalDateStr(){
        let d =  this.curDate.toLocaleDateString("zh-TW", {timeZone: "Asia/Taipei"})
        return this.dateAddZero(d);
    }
    private  dateAddZero(d: string): string {
        const sep: string = d.indexOf("-") > -1 ? "-" : "/";
        const dArr: string[] = d.split(sep);
        const newA = dArr.map((s) => {
            return this.addZeroIfUnderTen(s);
        });
        return newA.join(sep);
    }
    private addZeroIfUnderTen(v: string|number): string {
        const i: number = typeof(v) === "string" ? parseInt(v, 10) : 0;
        if (i < 10) { return "0" + i; }
        return "" + i;
    }
}
export default new JDate();
