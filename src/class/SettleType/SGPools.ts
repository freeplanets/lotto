import {ISetl} from "../../DataSchema/if";
const SettleNums: ISetl[] = [
  {
    BetTypes: 1,         // '1': {title: '2D-一獎',shortT:"一獎"},
    NumTarget: "Place",
    SubName: "D2",
    Position: 0,
    OpenAll: 1
  },
  {
    BetTypes: 2,         // '2': {title: '2D-二獎'},
    NumTarget: "Place",
    SubName: "D2",
    Position: 1,
    OpenAll: 1
  },
  {
    BetTypes: 3,         // '3': {title: '2D-三獎'},
    NumTarget: "Place",
    SubName: "D2",
    Position: 2,
    OpenAll: 1
  },
  {
    BetTypes: 4,         // '4': {title: '3D-一獎'},
    NumTarget: "Place",
    SubName: "D3",
    Position: 0,
    OpenAll: 1
  },
  {
    BetTypes: 5,         // '5': {title: '3D-二獎'},
    NumTarget: "Place",
    SubName: "D3",
    Position: 1,
    OpenAll: 1
  },
  {
    BetTypes: 6,         // '6': {title: '3D-三獎'},
    NumTarget: "Place",
    SubName: "D3",
    Position: 2,
    OpenAll: 1
  },
  {
    BetTypes: 7,         // '7': {title: '4D-一獎'},
    NumTarget: "Place",
    SubName: "D4",
    Position: 0,
    OpenAll: 1
  },
  {
    BetTypes: 8,         // '8': {title: '4D-二獎'},
    NumTarget: "Place",
    SubName: "D4",
    Position: 1,
    OpenAll: 1
  },
  {
    BetTypes: 9,         // '9': {title: '4D-三獎'},
    NumTarget: "Place",
    SubName: "D4",
    Position: 2,
    OpenAll: 1
  },
  {
    BetTypes: 10,         // '10': { title: '2D-23組'},
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    OpenAll: 1
  },
  {
    BetTypes: 11,         // '11': { title: '3D-23組'},
    NumTarget: "NumSet23",
    SubName: "D3",
    Position: -1,
    OpenAll: 1
  },
  {
    BetTypes: 12,         // '12': { title: '4D-23組'},
    NumTarget: "NumSet23",
    SubName: "D4",
    Position: -1,
    OpenAll: 1
  },
  {
    BetTypes: 13,         // '13': { title: '二星'},
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 2
  },
  {
    BetTypes: 14,         // '14': { title: '三星' },
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 3
  },
  {
    BetTypes: 15,         // '15': { title: '四星' },
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 4
  },
  {
    BetTypes: 16,         // '16': { title: '2D頭-一獎' },
    NumTarget: "Place",
    SubName: "D2Head",
    Position: 0,
    OpenAll: 1
  },
  {
    BetTypes: 17,         // '17': { title: '2D頭-二獎' },
    NumTarget: "Place",
    SubName: "D2Head",
    Position: 1,
    OpenAll: 1
  },
  {
    BetTypes: 18,         // '18': { title: '2D頭-三獎' },
    NumTarget: "Place",
    SubName: "D2Head",
    Position: 2,
    OpenAll: 1
  },
  {
    BetTypes: 19,         // '19': { title: '2D頭-23組' },
    NumTarget: "NumSet23",
    SubName: "D2Head",
    Position: -1,
    OpenAll: 1
  },
  {
    BetTypes: 20,         // '20': { title: '2D不中-5不中' },
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 0
  },
  {
    BetTypes: 21,         // '21': { title: '2D不中-6不中' },
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 0
  },
  {
    BetTypes: 22,         // '22': { title: '2D不中-7不中' },
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 0
  },
  {
    BetTypes: 23,         // '23': { title: '2D不中-8不中' },
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 0
  },
  {
    BetTypes: 24,         // '24': { title: '2D不中-9不中' },
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 0
  },
  {
    BetTypes: 25,         // '25': { title: '2D不中-10不中' },
    NumTarget: "NumSet23",
    SubName: "D2",
    Position: -1,
    PType: "Multi",
    OpenAll: 0
  },
  {
    BetTypes: 26,         // '26': { title: '單雙',sctitle: [ '', '1獎', '2獎', '3獎'],subtitle: [ '單', '雙' ] },
    NumTarget: "OddEven",
    Position: -1,
    OpenAll: 1
  },
  {
    BetTypes: 27,         // '27': { title: '大小',sctitle: [ '', '1獎', '2獎', '3獎'],subtitle: [ '大', '小' ] },
    NumTarget: "BigSmall",
    Position: -1,
    OpenAll: 1
  },
  {
    BetTypes: 28,         // '28': { title: '合數單雙',sctitle: [ '', '1獎', '2獎', '3獎'],shortT: '合',subtitle: [ '單', '雙' ] },
    NumTarget: "SumOddEven",
    Position: -1,
    OpenAll: 1
  },
  {
    BetTypes: 29,         // '29': { title: '合數大小',sctitle: [ '', '1獎', '2獎', '3獎'],shortT: '合',subtitle: [ '大', '小' ] },
    NumTarget: "SumBigSmall",
    Position: -1,
    OpenAll: 1
  }
];

export default SettleNums;
