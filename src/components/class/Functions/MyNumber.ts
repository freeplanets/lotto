class MyNumber {
	public defaultZero(v?: number) {
		if (!v) { v = 0; }
		return v;
	}
	public DecimalPlaces(v: number, dp: number) {
		return parseFloat(v.toFixed(dp));
	}
	public addZeroUnderTen(v: number) {
		return v < 10 ? `0${v}` : `${v}`;
	}
}
export default new MyNumber();
