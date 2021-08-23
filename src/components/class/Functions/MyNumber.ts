class MyNumber {
	public defaultZero(v?: number) {
		if (!v) { v = 0; }
		return v;
	}
}
export default new MyNumber();
