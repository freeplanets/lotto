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
export function BaNum(n: number): number {
    const s: string = n.toString();
    const p: number = s.length - (s.indexOf(".") + 1);
    return Math.pow(10, p);
}

export function getOtherSide(a: number): number {
    const aa: string[] = a.toString().split("");
    const k: number = parseInt(aa[aa.length - 1], 10) ^ 1;
    aa[aa.length - 1] = k.toString();
    return parseInt(aa.join(""), 10);
}
