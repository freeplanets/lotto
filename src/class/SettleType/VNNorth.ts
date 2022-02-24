import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,              // 特碼
    NumTarget: "SpNo",
    OpenAll: 1,
  },
  {
    BetTypes: 2,              // 27碼
    NumTarget: "Set27",
		Position: -1,
    OpenAll: 1,
		MultiPay: true,
  },
  {
    BetTypes: 3,              // 2星
    NumTarget: "Set27",
    Position: -1,
    PType: "Multi",
    OpenAll: 2
  },
  {
    BetTypes: 3,              // 3星
    NumTarget: "Set27",
    Position: -1,
    PType: "Multi",
    OpenAll: 3
  },
  {
    BetTypes: 4,              // 4星
    NumTarget: "Set27",
    Position: -1,
    PType: "Multi",
    OpenAll: 4
  },
  {
    BetTypes: 8,              // 50組
    NumTarget: "De50con",
    OpenAll: 1
  },
  {
    BetTypes: 9,              // 25組
    NumTarget: "De25con",
    OpenAll: 1
  },
	{
    BetTypes: 10, // { title: '合數尾', subtitle: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] },
		NumTarget: "SumTail",
		OpenAll: 1
	},
	{
    BetTypes: 11,	// { title: '生肖', subtitle: ['鼠', '牛', '虎', '貓', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'] },
		NumTarget: "Zadiac",
		OpenAll: 1
	},
	{
    BetTypes: 13, // { title: '除三餘數', subitle: ['0', '1', '2'] },
		NumTarget: "De33con",
		OpenAll: 1
	},
	{
    BetTypes: 15, // { title: '27碼-4不出' },
		NumTarget: "Set27",
		Position: -1,
		PType: "Multi",
		OpenAll: 0
	},
	{
    BetTypes: 16, // { title: '27碼-5不出' },
		NumTarget: "Set27",
		Position: -1,
		PType: "Multi",
		OpenAll: 0
	},
	{
    BetTypes: 17, // { title: '27碼-6不出' },
		NumTarget: "Set27",
		PType: "Multi",
		Position: -1,
		OpenAll: 0
	},
	{
    BetTypes: 18, // { title: '27碼-7不出' },
		NumTarget: "Set27",
		PType: "Multi",
		Position: -1,
		OpenAll: 0
	},
	{
    BetTypes: 19, // { title: '27碼-8不出' },
		NumTarget: "Set27",
		PType: "Multi",
		Position: -1,
		OpenAll: 0
	},
	{
    BetTypes: 20, // { title: '2D-頭' },
		NumTarget: "D2Head",
		Position: -1,
		OpenAll: 1
	},
	{
    BetTypes: 21, // { title: '3D-頭' },
		NumTarget: "D3Head",
		Position: -1,
		OpenAll: 1,
	},
	{
    BetTypes: 22, // { title: '3D-尾' },
		NumTarget: "D3Tail",
		OpenAll: 1
	},
	{
    BetTypes: 23, // { title: '3D-23組' },
		NumTarget: "Set23",
		OpenAll: 1,
		Position: -1,
		MultiPay: true
	},
	{
    BetTypes: 24, // { title: '頭獎尾' },
		NumTarget: "P1st",
		OpenAll: 1
	},
	{
    BetTypes: 25, // { title: '頭獎頭' },
		NumTarget: "P1stHead",
		OpenAll: 1
	},
	{
    BetTypes: 26, // { title: '財神尾' },
		NumTarget: "Spirit",
		OpenAll: 1
	},
	{
    BetTypes: 27, // { title: '財神頭' },
		NumTarget: "SpiritHead",
		OpenAll: 1
	},
	{
    BetTypes: 28, // { title: '特碼頭' },
		NumTarget: "SpNoHead",
		OpenAll: 1
	},
	{
    BetTypes: 29, // { title: '27碼頭' },
		NumTarget: "Set27Head",
		Position: -1,
    OpenAll: 1,
		MultiPay: true,
	},
];
export default SettleNums;
