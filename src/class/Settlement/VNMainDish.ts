import { getNumTailOrHead, getNumTailOrHeadInt } from "./SFunc";

// 單 1,雙 0,大 9,小 2,合大 8,合小 3
const _ODD = "1";
const _EVEN = "0";
const _BIG = "9";
const _SMALL = "2";
const _SUM_BIG = "8";
const _SUM_SMALL = "3";

export default class VNMainDish {
	// private Head = 0;	//頭
	// private Tail = 0;	//尾
	private bsHead = "";	// 頭大小
	private bsTail = "";	// 尾大小
	private oeHead = "";	// 頭單雙
	private oeTail = "";	// 尾單雙
	private bsSum = "";	// 合大小
	private oeSum = "";	// 合單雙
	private sumTail = 0;		// 合數尾;
	private num = 0;		// 數字轉數值

	constructor(private spno: string) {
		const sp2d = getNumTailOrHead(spno);
		const head = getNumTailOrHeadInt(sp2d, 1, true);
		const tail = getNumTailOrHeadInt(sp2d, 1);
		this.sumTail = (head + tail) % 10;
		this.num = parseInt(sp2d, 10);
		// this.Head = head;
		// this.Tail = tail;
		if ((head % 2) === 0) {
			this.oeHead = _EVEN;
		} else {
			this.oeHead = _ODD;
		}
		if ((tail % 2) === 0) {
			this.oeTail = _EVEN;
		} else {
			this.oeTail = _ODD;
		}
		if (head > 4) {
			this.bsHead = _BIG;
		} else {
			this.bsHead = _SMALL;
		}
		if (tail > 4) {
			this.bsTail = _BIG;
		} else {
			this.bsTail = _SMALL;
		}
		if ((this.sumTail % 2) === 0) {
			this.oeSum = _EVEN;
		} else {
			this.oeSum = _ODD;
		}
		if (this.sumTail > 4) {
			this.bsSum = _SUM_BIG;
		} else {
			this.bsSum = _SUM_SMALL;
		}
	}

	public De50con(): number[] {
		const h = {};
		h["0"] = 0;	// $text[11][0]="頭雙";
		h["1"] = 1;	// $text[11][1]="頭單";

		h["2"] = 2;	// $text[11][2]="頭小";
		h["9"] = 3;	// $text[11][3]="頭大";

		const t = {};
		t["0"] = 4;	// $text[11][4]="尾雙";
		t["1"] = 5;	// $text[11][5]="尾單";

		t["2"] = 6;	// $text[11][6]="尾小";
		t["9"] = 7;	// $text[11][7]="尾大";

		const s = {};
		s["0"] = 8;	// $text[11][8]="合雙";
		s["1"] = 9;	// $text[11][9]="合單";

		s["3"] = 10;	// $text[11][10]="合小";
		s["8"] = 11;	// $text[11][11]="合大";

		const score: number[] = [];
		score.push(h[this.oeHead]);
		score.push(h[this.bsHead]);
		score.push(t[this.oeTail]);
		score.push(t[this.bsTail]);
		score.push(s[this.oeSum]);
		score.push(s[this.bsSum]);
		return score;
	}
	public De25con(): number[] {
		const t = {};
		t["00"] = 0;	// $text[12][0]="雙雙";
		t["01"] = 1;	// $text[12][1]="雙單";
		t["10"] = 2;	// $text[12][2]="單雙";
		t["11"] = 3;	// $text[12][3]="單單";

		t["20"] = 4;	// $text[12][4]="頭小尾雙";
		t["21"] = 5;	// $text[12][5]="頭小尾單";
		t["90"] = 6;	// $text[12][6]="頭大尾雙";
		t["91"] = 7;	// $text[12][7]="頭大尾單";

		t["08"] = 8;	// $text[12][8]="頭雙合大";
		t["03"] = 9;	// $text[12][9]="頭雙合小";
		t["18"] = 10;	// $text[12][10]="頭單合大";
		t["13"] = 11;	// $text[12][11]="頭單合小";

		t["19"] = 12;	// $text[12][12]="頭單尾大";
		t["12"] = 13;	// $text[12][13]="頭單尾小";
		t["09"] = 14;	// $text[12][14]="頭雙尾大";
		t["02"] = 15;	// $text[12][15]="頭雙尾小";

		t["99"] = 16;	// $text[12][16]="頭大尾大";
		t["92"] = 17;	// $text[12][17]="頭大尾小";
		t["29"] = 18;	// $text[12][18]="頭小尾大";
		t["22"] = 19;	// $text[12][19]="頭小尾小";

		t["98"] = 20;	// $text[12][20]="頭大合大";
		t["93"] = 21;	// $text[12][21]="頭大合小";
		t["28"] = 22;	// $text[12][22]="頭小合大";
		t["23"] = 23;	// $text[12][23]="頭小合小";
		const score: number[] = [];
		score.push(t[`${this.oeHead}${this.oeTail}`]);
		score.push(t[`${this.bsHead}${this.oeTail}`]);
		score.push(t[`${this.oeHead}${this.bsSum}`]);
		score.push(t[`${this.oeHead}${this.bsTail}`]);
		score.push(t[`${this.bsHead}${this.bsTail}`]);
		score.push(t[`${this.bsHead}${this.bsSum}`]);
		return score;
	}

	public SumTail(): number {
		// 合尾
		return this.sumTail;
	}

	public Zodiac(): number {
		// 生肖 除12餘數
		return this.num % 12;
	}

	public De33con(): number {
		// 除位3 餘數機上De 33 con
		return this.num % 3;
	}
	public D2(): number {
		return this.num;
	}
	public D2Head(): number {
		return getNumTailOrHeadInt(this.spno, 2, true);
	}
	public D3(): number {
		return getNumTailOrHeadInt(this.spno, 3);
	}
}
