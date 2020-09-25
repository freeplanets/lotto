import XFunc from "../XFunc";
export interface ISame3 {
  Num: number;
  ALL: number;
}

export interface ISpeed3Result {
  Nums: string[];
  BigSmall: number;
  Sum: number;
  Same3: ISame3;
  Long: number[];
  Short: number;
}
export class Speed3Result {
  private XF = new XFunc();
  private midNum = 11;
  private LongNum = ["12", "13", "14", "15", "16", "23", "24", "25", "26", "34", "35", "36", "45", "46", "56"];
  private ShortNum = ["", "11", "22", "33", "44", "55", "66"];
  get Nums() {
    return this.NumSet;
  }
  private NumSet: ISpeed3Result = {
    Nums: [],
    BigSmall: 0,
    Sum: 0,
    Same3: {
      Num: 0,
      ALL: 0
    },
    Long: [],
    Short: 0
  };
  constructor(nums: string) {
    const anums = nums.split(",");
    anums.map((snum, idx) => {
      this.NumSet.Nums.push(snum);
      this.NumSet.Sum += this.parseToInt(snum);
    });
    this.NumSet.Same3 = this.getSame3(anums);
    // 大小(和) 11-17 大 0, 4-10 小 1, 豹子 通殺 2
    this.NumSet.BigSmall = this.NumSet.Same3.ALL === 0 ? 2 : this.XF.getBigSmall(this.NumSet.Sum, this.midNum);
    this.NumSet.Long = this.getNumsIndex(anums, this.LongNum, true) as number[];
    this.NumSet.Short = this.getNumsIndex(anums, this.ShortNum) as number;
  }
  private parseToInt(v: number|string): number {
    if (typeof(v) === "string") { v = parseInt(v, 10); }
    return v;
  }
  private getSame3(n: string[]) {
    const tmp: ISame3 = {
      Num: 0,
      ALL: 1
    };
    const ta: string[] = [];
    n.map((nm) => {
      const f = ta.find((itm) => itm === nm);
      if (!f) { ta.push(nm); }
    });
    if (ta.length === 1) {
      tmp.ALL = 0;
      tmp.Num = this.parseToInt(ta[0]);
    }
    return tmp;
  }
  // 金（210～695）、木（696～763）、水（764～855）、火（856～923）和土（924～1410）
  private getBigSmall(t: number) {
    const steps: number[][] = [
      [210, 695], [696, 763], [764, 855], [856, 923], [924, 1410]
    ];
    return steps.findIndex( (itm) => itm[0] <= t && itm[1] >= t);
  }
  private getNumsIndex(nums: string[], sets: string[], isMulti?: boolean) {
    nums.sort();
    let idx = sets.indexOf(nums[0] + "" + nums[1]);
    if (!isMulti) {
      if (idx === -1) {
        idx = sets.indexOf(nums[1] + "" + nums[2]);
      }
      return idx === -1 ? sets.length : idx;
    } else {
      const ans: number[] = [];
      ans.push(idx);
      idx = sets.indexOf(nums[1] + "" + nums[2]);
      ans.push(idx);
      idx = sets.indexOf(nums[0] + "" + nums[2]);
      ans.push(idx);
      return ans;
    }
  }
}

// const snum: string = "6,1,3";
// console.log(new C3DNum(snum).Nums);
