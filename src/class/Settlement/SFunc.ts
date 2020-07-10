import {IC36S} from "./if";
export function OddEven(num: number) {
  return num % 2 === 0 ? 1 : 0;
}
export function BigSmall(num: number, MidNum?: number) {
  if (!MidNum) { MidNum = 5; }
  return num < MidNum ? 1 : 0;
}
export function PrimeOrNot(num) {
  const Primes: number[] = [1, 2, 3, 5, 7];
  return Primes.indexOf(num) > -1 ? 0 : 1;
}
export function fSum3(num: number): number {
// 6 => x >= 21
  let ans: number = num;
  if (ans <= 6) { ans = 6; }
  if (ans >= 21) { ans = 21; }
  return ans;
}
export function D3TwoNums(num: string|string[]): number[] {
  if (typeof(num) === "string") { num = num.split(","); }
  num.sort();
  const tmp: number[] = [];
  tmp.push(parseInt(num[0] + "" + num[1], 10));
  tmp.push(parseInt(num[0] + "" + num[2], 10));
  tmp.push(parseInt(num[1] + "" + num[2], 10));
  return tmp;
}
export function Combs(num: string[]) {
  const tmp: string[] = [];
  num.map((n) => {
    if (tmp.indexOf(n) < 0) { tmp.push(n); }
  });
  return tmp;
}
export function PairAndNum(num: string[]): IC36S {
  const tmp: string[] = [];
  const ans: IC36S = {isSame3: false, isSet3: false, isSet6: false, Num: ""};
  num.map((n) => {
    if (tmp.indexOf(n) < 0) { tmp.push(n); }
  });
  if (tmp.length === 3) {
    ans.isSet6 = true;
  } else if (tmp.length === 2) {
    ans.isSet3 = true;
  } else {
    ans.isSame3 = true;
  }
  ans.Num = tmp.join(",");
  return ans;
}

export function D3Set3All(num: string|string[], type?: number): number|string[] {
  if (typeof(num) === "string") { num = num.split(","); }
  const tmp: string[] = Combs(num);
  if (type === 3) {
    return num.length === tmp.length ? 0 : tmp;
  } else if (type === 6) {
    return num.length === tmp.length ? num : 0;
  }
  return num.length === tmp.length ? 1 : 0;
}
const APass: string[] = [
  "000", "001",
  "011", "010",
  "111", "110",
  "100", "101"
];

export function OddEvenPass(num: number[]) {
  const arrNum: number[] = [];
  num.map((n) => {
    arrNum.push(OddEven(n));
  });
  const str = arrNum.join("");
  return APass.indexOf(str);
}
export function BigSmallPass(num: number[]) {
  const arrNum: number[] = [];
  num.map((n) => {
    arrNum.push(BigSmall(n));
  });
  const str = arrNum.join("");
  return APass.indexOf(str);
}
export function PrimePass(num: number[]) {
  const arrNum: number[] = [];
  num.map((n) => {
    arrNum.push(PrimeOrNot(n));
  });
  const str = arrNum.join("");
  return APass.indexOf(str);
}
export function Tail(num: number) {
  return parseInt((num + "").substr(-1), 10);
}

const KillNum: string[][] = [];
KillNum[0] = ["345789", "256789", "234678", "234569", "145678", "135689", "134679", "124689", "124579", "123789", "123567", "123458"];
KillNum[1] = ["345789", "256789", "234678", "234569", "045689", "036789", "034567", "024679", "024578", "023579", "023568", "023489"];
KillNum[2] = ["345789", "145678", "135689", "134679", "045689", "036789", "034567", "015679", "013578", "013459", "014789", "013468"];
KillNum[3] = ["256789", "145678", "124689", "124579", "045689", "024679", "024578", "015679", "014789", "012589", "012678", "012456"];
KillNum[4] = ["256789", "135689", "123789", "123567", "036789", "023579", "023568", "015679", "013578", "012589", "012678", "012369"];
KillNum[5] = ["234678", "134679", "124689", "123789", "036789", "024679", "023489", "014789", "013468", "012678", "012347", "012369"];
KillNum[6] = ["345789", "124579", "123789", "123458", "024578", "023579", "023489", "013578", "013459", "014789", "012589", "012347"];
KillNum[7] = ["234569", "135689", "124689", "123458", "045689", "023568", "013459", "013468", "012589", "012456", "012369", "023489"];
KillNum[8] = ["234569", "124579", "123567", "034567", "024679", "023579", "015679", "013459", "012456", "012347", "012369", "134679"];
KillNum[9] = ["234678", "145678", "123567", "123458", "034567", "024578", "023568", "013578", "013468", "012678", "012456", "012347"];

export function ChkKillNum(no: number[]) {
  const tmp: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  if (hasSameNum(no)) { return tmp; }
  for (let i = 0, n = KillNum.length; i < n; i++) {
    const c = no.find((f) => f === i);
    if (c) { continue; } else {
      KillNum[i].map((str) => {
        if (inNum(str, no)) { tmp[i]++; }
      });
    }
  }
  return tmp;
}
function hasSameNum(no: number[]): boolean {
  const chkArr: number[] = [];
  no.map((itm) => {
    if (chkArr.length === 0) { chkArr.push(itm); } else {
      const f = chkArr.find((n) => n === itm);
      if (!f) { chkArr.push(itm); }
    }
  });
  return no.length > chkArr.length;
}
function inNum(num: string, no: number[]): boolean {
  let cnt: number = 0;
  no.map((itm) => {
    if (num.indexOf(itm + "") > -1) { cnt++; }
  });
  return no.length === cnt;
}
