export default class HashNum {
  private radix = 10;
  private aHash: string[] = [];
  private re = /[a-zA-Z]/g;
  private zero = /^0{8,19}/;
  private dgt = 0;
  constructor(private hash: string, private Max: number, private Min: number,
              private pos: number, private allowSameNum: boolean = false,
              private OnlyDigital: boolean = true, private NoZero: boolean = false, private RepetOne: boolean = false) {
    let str;
    if (this.NoZero) {
      str = this.hash.replace(this.zero, "");
    } else {
      str = this.hash;
    }
    if (this.OnlyDigital) {
      str = str.replace(this.re, "");
    } else {
      this.radix = 16;
      // str = this.hash;
    }
    this.dgt = `${this.Max}`.length;
    this.aHash = str.split("");
  }
  get NumLine() {
    let n = this.pos;
    const tmp: number[] = [];
    while (n > 0) {
      if (this.aHash.length < this.dgt) { break; }
      const tnum = this.Pop();
      if (tnum >= this.Min) {
        if (this.allowSameNum) {
          tmp.push(tnum);
          n -= 1;
        } else if (tmp.indexOf(tnum) === -1) {
            tmp.push(tnum);
            n -= 1;
        }
        /*
         else {
            continue;
        }
        n -= 1;
        */
      }
    }
    return tmp.reverse();
  }
  public Pop() {
    // let n=this.dgt;
    const tmp: string[] = [];
    while (this.aHash.length > 0 && tmp.length <= this.dgt) {
      const p = this.aHash.pop();
      if (p) { tmp.push(p); }
      if (this.RepetOne) { tmp.push(this.aHash[this.aHash.length - 1]); }
      // n--;
    }
    const num = parseInt(tmp.reverse().join(""), this.radix);
    return num > this.Max ? num % (this.Max + 1) : num;
  }
  /*
  RepetLastOne(){
    const tmp:string[]=[];
    while(this.aHash.length>this.dgt-1 && tmp.length < this.dgt){
      if(this.lastOne){
        tmp.push(this.lastOne);
      } else {
        const p=this.aHash.pop();
        if(p){
          tmp.push(p)
          this.lastOne=p
        }
      }
    }
  }
  */
}
/*
const hash = "0000000000000000000486cef4e3b01a4c4276dfba314164d4a6038207c9b2bc";
const ha = new HashNum(hash, 9, 0, 5, true, true, true, true);
console.log(ha.NumLine);
*/
