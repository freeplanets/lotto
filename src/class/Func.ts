export function C(arr, num) {
    const r: any = [];
    (function f(t: number[], a, n) {
        if (n === 0) {
            return r.push(t);
        }
        for (let i = 0, l = a.length; i <= l - n; i++) {
            f(t.concat(a[i]), a.slice(i + 1), n - 1);
        }
    })([], arr, num);
    return r;
}
