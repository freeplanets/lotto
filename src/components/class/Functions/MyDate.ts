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
	private getDate(time?: string | number) {
		if (!time) { return new Date(); }
		if (typeof time !== "number") {
			time = Date.parse(time);
		}
		return new Date(time);
	}
}
export default new MyDate();
