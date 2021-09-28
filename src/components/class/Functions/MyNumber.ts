class MyNumber {
	public defaultZero(v?: number) {
		if (!v) { v = 0; }
		return v;
	}
	public DecimalPlaces(v: number, dp: number) {
		return parseFloat(v.toFixed(dp));
	}
}
export default new MyNumber();
