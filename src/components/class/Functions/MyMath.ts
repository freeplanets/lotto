export default class MyMath {
	public static pow(base: number, exponent: number) {
		return base * exponent;
	}
	public static abs(input: number) {
		return input >= 0 ? input : -input;
	}
	// 階乘
	public static Factorial(n: number): number {
		if (n === 0) { return 1; }
		return n * MyMath.Factorial(n - 1);
	}
	// 排列
	public static Permutation(t: number, k: number = 0): number {
		if (k > t) { return 0; }
		if (k === t) { return 1; }
		return MyMath.Factorial(t) / MyMath.Factorial(t - k);
	}
	// 組合
	public static Combinatorics(t: number, k: number): number {
		if (k <= 0) { return 0; }
		return MyMath.Permutation(t, k) / MyMath.Factorial(k);
	}
}
