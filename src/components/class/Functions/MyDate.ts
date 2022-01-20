import { IKeyVal } from "../../../DataSchema/if";
// import LStore from '../../store/LayoutStoreModule';

class MyDate {
	// private User = LStore.UserInfo;
	private dOpt: Intl.DateTimeFormatOptions = {
    hour12: false,
		year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    // timeZone: 'Asia/Taipei',
  };
	public toDbDateString(time?: string | number, lang: string = "zh-TW") {
		const d = this.getDate(time);
		const ds = typeof time === "string" ? time.split(" ") : [];
		const opt = { ...this.dOpt };
		delete opt.hour;
		delete opt.minute;
		delete opt.second;
		const tmpD = d.toLocaleDateString(lang, opt).replace(/\//g, "-");
		// console.log('this.toDbDateString:', tmpD);
		return ds[1] ? `${tmpD} ${ds[1]}` : tmpD;
	}
	public toLocalString(time?: string | number, lang?: string, opt?: Intl.DateTimeFormatOptions) {
		const d = this.getDate(time);
		if (!lang) { lang = "zh-TW"; }
		if (!opt) { opt = this.dOpt; }
		return d.toLocaleString(lang, opt);
	}
	public toLocalStringNoYear(time?: string | number, lang?: string, opt?: Intl.DateTimeFormatOptions) {
		const d = this.getDate(time);
		if (!lang) { lang = "zh-TW"; }
		if (!opt) { opt = this.dOpt; }
		delete opt.year;
		return d.toLocaleString(lang, opt);
	}
	public dayDiff(d: number): string {
		const ts = this.dayDiffTS(d);
		return this.getDate(ts).toLocaleDateString();
	}
	public dayDiffTS(d: number): number {
		const dt = this.getDate();
		const dts = dt.getTime();
		const ts = dts - d * 60 * 60 * 24 * 1000;
		return ts;
	}
	public howMinutesAgo(time: string | number) {
		const curTime = new Date().getTime();
		const chkTime = this.getDate(time).getTime();
		return Math.floor((curTime - chkTime) / 1000 / 60);
	}
	public createDateFilter(v: string, key?: string): IKeyVal {
		const dates = v.split("-");
		const d1 = dates[0];
		const d2 = `${dates[1] ? dates[1] : dates[0]} 23:59:59.999`;
		const keyV: IKeyVal = {
			Key: `${key || "ModifyTime"}`,
			Val: this.getTime(d1),
			Val2: this.getTime(d2),
			Cond: "between",
		};
		return keyV;
	}
	public getTime(time?: string) {
		return this.getDate(time).getTime();
	}
	public getDate(time?: string | number) {
		if (!time) { return new Date(); }
		if (typeof time !== "number") {
			if (time.indexOf("GMT") === -1 || time.indexOf("gmt") === -1 ) {
				time = `${time} GMT+0800`;
			}
			time = Date.parse(time);
		}
		return new Date(time);
	}
	private addZeroUnderTen(v: number) {
		return v < 10 ? `0${v}` : `${v}`;
	}
}
export default new MyDate();
