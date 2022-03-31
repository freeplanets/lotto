const MarkSix = {
    1: 1, // [{ Title: '特碼' }],
    2: 1, // [{ Title: '特碼單雙'}],
    3: 1, // [{ Title: '特碼大小'}],
    74: 1, // [{ Title: '特碼尾大小'}],
    4: 1,  // [{ Title: '正碼' }],
    5: 1,  // [{ Title: '總和單雙'}],
    6: 1,  // [{ Title: '總和大小'}],
    7: 3,  // [{ Title: '三全中' }],
    8: 3,  // [{ Title: '三中二 I',SubTitle:'中二'},{ Title: '三中二 I',SubTitle:'全中',Filter:'>100'}],
    72: 3, // [{ Title: '三中二 II',SubTitle:'中二'},{ Title: '三中二 II',SubTitle:'全中',Filter:'>100'}],
    9: 2,  // [{ Title: '二全中' }],
    10: 2, // [{ Title: '二中特 I',SubTitle:'中特'},{ Title: '二中特 I',SubTitle:'中二',Filter:'>100'}],
    73: 2, // [{ Title: '二中特 II',SubTitle:'中特'},{ Title: '二中特 II',SubTitle:'中二',Filter:'>100'}],
    11: 2, // [{ Title: '特串' }],
    71: 4, // [{ Title: '四中一' }],
    12: 1, // [{ Title: '正碼1-6單雙'}],
    13: 1, // [{ Title: '正碼1-6大小'}],
    14: 1, // [{ Title: '正碼1-6色波',SubTitle: '藍綠波'},{ Title: '正碼1-6色波',SubTitle: '紅波'}],
    27: 1, // [{ Title: '正1-6合數單雙'}],
    15: 0, // [{ Title: "正碼過關"}],
    16: 1, // [{ Title: '特碼合數單雙'}],
    17: 1, // [{ Title: '特碼色波',SubTitle: '藍綠波' },{ Title: '特碼色波',SubTitle: '紅波' }],
    18: 1, // [{ Title: '特碼生肖',SubTitle:'一般'},{ Title: '特碼生肖',SubTitle:'1號生肖'}],
    19: 1, // [{ Title: '生肖',SubTitle: '一般'},{ Title: '生肖',SubTitle:'1號生肖'}],
    20: 1, // [{ Title: '尾數',SubTitle: '一般'},{ Title: '尾數',SubTitle:'0尾'}],
    21: 1, // [{ Title: '正1特' }],
    22: 1, // [{ Title: '正2特' }],
    23: 1, // [{ Title: '正3特' }],
    24: 1, // [{ Title: '正4特' }],
    25: 1, // [{ Title: '正5特' }],
    26: 1, // [{ Title: '正6特' }],
    29: 1, /*[{ Title: '半波'}],*/
    75: 2, // [{ Title: '二肖'}],
    76: 3, // [{ Title: '三肖'}],
    77: 4, // [{ Title: '四肖'}],
    78: 5, // [{ Title: '五肖'}],
    30: 6, // [{ Title: '六肖'}],
    31: 5, // [{ Title: '五不中'}],
    48: 6, // [{ Title: '六不中'}],
    49: 7, // [{ Title: '七不中'}],
    50: 8, // [{ Title: '八不中'}],
    51: 9, // [{ Title: '九不中'}],
    52: 10, // [{ Title: '十不中'}],
    32: 2, // [{ Title: '二肖連-中'}],
    33: 3, // [{ Title: '三肖連-中'}],
    34: 4, // [{ Title: '四肖連-中'}],
    44: 5, // [{ Title: '五肖連-中'}],
    35: 2, // [{ Title: '二肖連-不中'}],
    36: 3, // [{ Title: '三肖連-不中'}],
    37: 4, // [{ Title: '四肖連-不中'}],
    45: 5, // [{ Title: '五肖連-不中'}],
    38: 2, // [{ Title: '二尾連-中'}],
    39: 3, // [{ Title: '三尾連-中'}],
    40: 4, // [{ Title: '四尾連-中'}],
    46: 5, // [{ Title: '五尾連-中'}],
    41: 2, // [{ Title: '二尾連-不中'}],
    42: 3, // [{ Title: '三尾連-不中'}],
    43: 4, // [{ Title: '四尾連-不中'}],
    47: 5, // [{ Title: '五尾連-不中'}],
    53: 1, /*[{ Title: '七碼'}],*/
    54: 1, // [{ Title: '五行',SubTitle:'一般'},{ Title: '五行',SubTitle:'土'}],
    55: 1, /*[{ Title: '一肖量'}],*/
    56: 1, /*[{Title: '尾數量'}],*/
    57: 5, // [{ Title: '五中一' }],
    58: 6, // [{ Title: '六中一' }],
    59: 7, // [{ Title: '七中一' }],
    60: 8, // [{ Title: '八中一' }],
    61: 9, // [{ Title: '九中一' }],
    62: 10, // [{ Title: '十中一' }],
    63: 1, // [{ Title: '一粒任中' }],
    64: 2, // [{ Title: '二粒任中' }],
    65: 3, // [{ Title: '三粒任中' }],
    66: 4, // [{ Title: '四粒任中' }],
    67: 5, // [{ Title: '五粒任中' }],
    68: 1, // [{ Title: '龍虎'}],
    69: 1, // [{ Title: '一肖不中',SubTitle: '一般'},{ Title: '一肖不中',SubTitle:'1號生肖'}],
    70: 1, // [{ Title: '尾數不中',SubTitle: '一般'},{ Title: '尾數不中',SubTitle:'0尾'}]
    };
const D3 = {
      1: 1, // [{ Title: '一定位-個' }],
      2: 1, // :[{ Title: '一定位-個單雙'}],
      3: 1, // [{ Title: '一定位-個大小'}],
      4: 1, // [{ Title: '一定位-拾' }],
      5: 1, // [{ Title: '一定位-拾單雙'}],
      6: 1, // [{ Title: '一定位-拾大小'}],
      7: 1, // [{ Title: '一定位-佰' }],
      8: 1, // [{ Title: '一定位-佰單雙'}],
      9: 1, // [{ Title: '一定位-佰大小'}],
      10: 1, // [{ Title: '一字組合' }],
      11: 1, // { Title: '三字和數'},
      12: 1, // [{ Title: '三字和數單雙'}],
      13: 1, // [{ Title: '三字和數大小'}],
      14: 1, // [{ Title: '二定位拾個' }],
      15: 1, // [{ Title: '二定位佰個' }],
      16: 1, // [{ Title: '二定位佰拾' }],
      17: 1, // [{ Title: '二字组合'}],
      18: 1, // [{ Title: '組 3全包'}],
      19: 5, // [{ Title: '組 3轉直-5'}],
      20: 6, // [{ Title: '組 3轉直-6'}],
      21: 7, // [{ Title: '組 3轉直-7'}],
      22: 8, // [{ Title: '組 3轉直-8'}],
      23: 4, // [{ Title: '組 6轉直-4'}],
      24: 5, // [{ Title: '組 6轉直-5'}],
      25: 6, // [{ Title: '組 6轉直-6'}],
      26: 7, // [{ Title: '組 6轉直-7'}],
      27: 8, // [{ Title: '組 6轉直-8'}],
      28: 3, // [{ Title: '3x3x3'}],
      29: 4, // [{ Title: '4x4x4'}],
      30: 5, // [{ Title: '5x5x5'}],
      31: 6, // [{ Title: '6x6x6'}],
      32: 7, // [{ Title: '7x7x7'}],
      33: 1, // [{ Title: '中 3 保 3'}],
      34: 1, // [{ Title: '一定位-個質合'}],
      35: 1, // [{ Title: '一定位-拾質合'}],
      36: 1, // [{ Title: '一定位-佰質合'}],
      37: 1, // [{ Title: '定位單雙過關'}],
      38: 1, // [{ Title: '定位大小過關'}],
      39: 1, // [{ Title: '定位質合過關'}],
      40: 1, // { Title: '跨度'},
      41: 1, // [{ Title: '合值' }],
      42: 1, // { Title: '三定位'},
      43: 1, // { Title: '三字组合'},
      44: 1, // { Title: '拾個和數'},
      45: 1, // { Title: '佰個和數'},
      46: 1, // { Title: '佰拾和數'},
      47: 1, // [{ Title: '拾個和數單雙'}],
      48: 1, // [{ Title: '佰個和數單雙'}],
      49: 1, // [{ Title: '佰拾和數單雙'}],
      50: 1, // [{ Title: '拾個和數尾數' }],
      51: 1, // [{ Title: '佰個和數尾數' }],
      52: 1, // [{ Title: '佰拾和數尾數' }],
      53: 1, // [{ Title: '拾個和數尾數大小'}],
      54: 1, // [{ Title: '佰個和數尾數大小'}],
      55: 1, // [{ Title: '佰拾和數尾數大小'}],
      56: 1, // [{ Title: '拾個和數尾數質合'}],
      57: 1, // [{ Title: '佰個和數尾數質合'}],
      58: 1, // [{ Title: '佰拾和數尾數質合'}],
      59: 1, // [{ Title: '雜六'}],
      60: 1, // [{ Title: '順子'}],
      61: 1, // [{ Title: '豹子'}],
      62: 1, // [{ Title: '不出'}],
      63: 1, // [{ Title: '對子'}],
      64: 1, // [{ Title: '准對'}],
      65: 1, // [{ Title: '半順'}],
      66: 1, // [{ Title: '殺號'}]
};
const Happy = {
     1: 1,     // {"title": "單碼"},
     2: 1,     // {"title": "單雙"},
     3: 1,     // {"title": "大小"},
     4: 1,     // {"title": "合數單雙"},
     5: 1,     // {"title": "尾數大小"},
     7: 1,     // {"title": "方位"},
     9: 1,     // {"title": "中發白"},
     10: 1,    // {"title": "總和大小"},
     11: 1,    // {"title": "總和單雙"},
     12: 1,    // {"title": "總和尾數大小"},
     13: 1,    // {"title": "龍虎"},
     14: 1,    // {"title": "正碼"},
     15: 2,    // {"title": "任選二"},
     16: 2,    // {"title": "選二連組"},
     17: 3,    // {"title": "任選三"},
     18: 3,    // {"title": "選三前組"},
     19: 4,    // {"title": "任選四"},
     20: 5,    // {"title": "任選五"}
};
const Cars = {
     1: 1,     // {"title":"1-10名 車號"},
     2: 1,     // {"title":"1-10名 大小"},
     3: 1,     // {"title":"1-10名 單雙"},
     4: 1,     // {"title":"1-5 龍虎"},
     5: 1,     // {"title":"冠亞和大小"},
     6: 1,     // {"title":"冠亞和單雙"},
     7: 1,     // {"title":"冠亞和值"},
     8: 2,     // {"title":"前2組合"},
     9: 3,     // {"title":"前3組合"},
     10: 4,    // {"title":"前4組合"}
};
const BTCHash = {
      1: 1, // { title: '個位-單雙'},
      2: 1, // { title: '十位-單雙'},
      3: 1, // { title: '百位-單雙'},
      4: 1, // { title: '千位-單雙'},
      5: 1, // { title: '萬位-單雙'},
      6: 1, // { title: '個位-大小'},
      7: 1, // { title: '十位-大小'},
      8: 1, // { title: '百位-大小'},
      9: 1, // { title: '千位-大小'},
      10: 1, // { title: '萬位-大小'},
      11: 1, // { title: '個位-質合'},
      12: 1, // { title: '十位-質合'},
      13: 1, // { title: '百位-質合'},
      14: 1, // { title: '千位-質合'},
      15: 1, // { title: '萬位-質合'},
      16: 1, // {title: '總和-單雙'},
      17: 1, // {title: '總和-大小'},
      18: 1, // {title: '前3和-單雙'},
      19: 1, // {title: '前3和-大小'},
      20: 1, // {title: '中3和-單雙'},
      21: 1, // {title: '中3和-大小'},
      22: 1, // {title: '後3和-單雙'},
      23: 1, // {title: '後3和-大小'},
      24: 1, // {title: '一定位-個'},
      25: 1, // {title: '一定位-十'},
      26: 1, // {title: '一定位-百'},
      27: 1, // {title: '一定位-千'},
      28: 1, // {title: '一定位-萬'},
      29: 1, // {title: '一字現'},
      30: 1, // {title: '一字現-前3'},
      31: 1, // {title: '一字現-中3'},
      32: 1, // {title: '一字現-後3'},
      33: 1, // {title: '二字現'},
      34: 1, // {title: '二字現-前3'},
      35: 1, // {title: '二字現-中3'},
      36: 1, // {title: '二字現-後3'},
      37: 1, // {title: '三字現'},
      38: 1, // {title: '三字現-前3'},
      39: 1, // {title: '三字現-中3'},
      40: 1, // {title: '三字現-後3'},
      41: 1, // {title: '四字現'},
      42: 1, // {title: '五字現'},
      43: 1, // {title: '雜項-前3'},
      44: 1, // {title: '雜項-中3'},
      45: 1, // {title: '雜項-後3'},
      46: 1, // {title: '炸金花'},
      47: 0, // {title: '兩面過關'}
};
const HashSix = {
      21: 1, // [{ Title: '正1特' }],
      22: 1, // [{ Title: '正2特' }],
      23: 1, // [{ Title: '正3特' }],
      24: 1, // [{ Title: '正4特' }],
      25: 1, // [{ Title: '正5特' }],
      26: 1, // [{ Title: '正6特' }],
      4: 1, //  [{ Title: '正碼' }],
      9: 2, //  [{ Title: '二全中' }],
      7: 3, //  [{ Title: '三全中' }],
      8: 3, //  [{ Title: 'KENO3'}],
      79: 4, //  [{ Title: 'KENO4'}],
      80: 5, //  [{ Title: 'KENO5'}],
      81: 6, //  [{ Title: 'KENO6'}],
      5: 1, //  [{ Title: '總和單雙'}],
      6: 1, //  [{ Title: '總和大小'}],
      12: 1, // [{ Title: '正碼1-6單雙'}],
      13: 1, // [{ Title: '正碼1-6大小'}],
      27: 1, // [{ Title: '正碼1-6合數單雙'}],
      20: 1, // [{ Title: '尾數'}],
      38: 2, // [{ Title: '二尾連-中'}],
      39: 3, // [{ Title: '三尾連-中'}],
      40: 4, // [{ Title: '四尾連-中'}],
      46: 5, // [{ Title: '五尾連-中'}],
      41: 2, // [{ Title: '二尾連-不中'}],
      42: 3, // [{ Title: '三尾連-不中'}],
      43: 4, // [{ Title: '四尾連-不中'}],
      47: 5, // [{ Title: '五尾連-不中'}],
      70: 1, // [{ Title: '尾數不中'}],
      31: 5, // [{ Title: '五不中'}],
      48: 6, // [{ Title: '六不中'}],
      49: 7, // [{ Title: '七不中'}],
      50: 8, // [{ Title: '八不中'}],
      51: 9, // [{ Title: '九不中'}],
      52: 10, // [{ Title: '十不中'}],
      71: 4, // [{ Title: '四中一' }],
      57: 5, // [{ Title: '五中一' }],
      58: 6, // [{ Title: '六中一' }],
      59: 7, // [{ Title: '七中一' }],
      60: 8, // [{ Title: '八中一' }],
      61: 9, // [{ Title: '九中一' }],
      62: 10, // [{ Title: '十中一' }],
      63: 1, // [{ Title: '一粒任中' }],
      64: 2, // [{ Title: '二粒任中' }],
      65: 3, // [{ Title: '三粒任中' }],
      66: 4, // [{ Title: '四粒任中' }],
      67: 5, // [{ Title: '五粒任中' }],
      68: 1, // [{ Title: '龍虎'}],
      53: 1, // [{ Title: '六碼'}],
      56: 1, // [{ Title: '尾數量'}],
      14: 1, // [{ Title: '正碼1-6色波'}],
      15: 0, // [{ Title: '正碼過關'}],
      82: 1, // [{ Title: '正碼1-6半波'}],
      19: 1, // [{ Title: '合肖'}],
      83: 1, // [{ Title: '正碼1-6生肖'}],
      84: 2, // [{ Title: '正碼1-6二肖'}],
      85: 3, // [{ Title: '正碼1-6三肖'}],
      86: 4, // [{ Title: '正碼1-6四肖'}],
      87: 5, // [{ Title: '正碼1-6五肖'}],
      88: 6, // [{ Title: '正碼1-6六肖'}],
      32: 2, // [{ Title: '二肖連-中'}],
      33: 3, // [{ Title: '三肖連-中'}],
      34: 4, // [{ Title: '四肖連-中'}],
      44: 5, // [{ Title: '五肖連-中'}],
      35: 2, // [{ Title: '二肖連-不中'}],
      36: 3, // [{ Title: '三肖連-不中'}],
      37: 4, // [{ Title: '四肖連-不中'}],
      45: 5, // [{ Title: '五肖連-不中'}],
      69: 1, // [{ Title: '一肖不中'}],
      55: 1, // [{ Title: '一肖量'}],
      89: 1, // [{ Title: '正碼1-6五行'}],
};
const SGPools = {
      1: 1, // {title: '2D-一獎',shortT:"一獎"},
      2: 1, // {title: '2D-二獎'},
      3: 1, // {title: '2D-三獎'},
      4: 1, // {title: '3D-一獎'},
      5: 1, // {title: '3D-二獎'},
      6: 1, // {title: '3D-三獎'},
      7: 1, // {title: '4D-一獎'},
      8: 1, // {title: '4D-二獎'},
      9: 1, // {title: '4D-三獎'},
      10: 1, // { title: '2D-23組'},
      11: 1, // { title: '3D-23組'},
      12: 1, // { title: '4D-23組'},
      13: 2, // { title: '二星'},
      14: 3, // { title: '三星' },
      15: 4, // { title: '四星' },
      16: 1, // { title: '2D頭-一獎' },
      17: 1, // { title: '2D頭-二獎' },
      18: 1, // { title: '2D頭-三獎' },
      19: 1, // { title: '2D頭-23組' },
      20: 5, // { title: '2D不中-5不中' },
      21: 6, // { title: '2D不中-6不中' },
      22: 7, // { title: '2D不中-7不中' },
      23: 8, // { title: '2D不中-8不中' },
      24: 9, // { title: '2D不中-9不中' },
      25: 10, // { title: '2D不中-10不中' },
      26: 1, // { title: '單雙',sctitle: [ , '1獎', '2獎', '3獎'],subtitle: [ '單', '雙' ] },
      27: 1, // { title: '大小',sctitle: [ , '1獎', '2獎', '3獎'],subtitle: [ '大', '小' ] },
      28: 1, // { title: '合數單雙',sctitle: [ , '1獎', '2獎', '3獎'],shortT: '合',subtitle: [ '單', '雙' ] },
      29: 1, // { title: '合數大小',sctitle: [ , '1獎', '2獎', '3獎'],shortT: '合',subtitle: [ '大', '小' ] },
};
const Happy8 = {
      1: 1, // { title: '正碼' },
      2: 1, // { title: '總和大小'},
      3: 1, // { title: '總和單雙'},
      4: 1, // { title: '總和810'},
      5: 1, // { title: '總和過關'},
      6: 1, // { title: '前後和'},
      7: 1, // { title: '單雙和'},
      8: 1, // { title: '五行'},
      9: 1, // {title: '特碼'},
      10: 2, // {title: '2星'},
      11: 3, // {title: '3星'},
      12: 4, // {title: '4星'},
      13: 1, // {title: '單雙', shortT: '', subtitle:['單','雙']},
      14: 1, // {title: '大小', shortT: '', subtitle:['大','小']},
      15: 1, // {title: '尾數單雙', shortT: '', subtitle:['尾單','尾雙']},
      16: 1, // {title: '尾數大小', shortT: '', subtitle:['尾大','尾小']},
      17: 1, // {title: '特碼尾數'},
      18: 1, // {title: '1-5球尾數'},
      19: 1, // {title: '6-10球尾數'},
      20: 1, // {title: '11-15球尾數'},
      21: 1, // {title: '16-20球尾數'},
};
const VNNorth = {
      1: 1,   // 特別號
      2: 1,   // 27碼
      3: 2,   // 2星
      4: 3,   // 3星
      5: 4,   // 4星
      8: 1,   // 50組
      9: 1,   // 25組
      10: 1,  // 合數尾
      11: 1,  // 生肖
      13: 1,  // 除三餘數
      15: 4,  // 27碼-4不出
      16: 5,  // 27碼-5不出
      17: 6,  // 27碼-6不出
      18: 7,  // 27碼-7不出
      19: 8,  // 27碼-8不出
      20: 1,  // 2D-頭
      21: 1,  // 3D-頭
      22: 1,  // 3D-尾
      23: 1,  // 3D-23組
      24: 1,  // 頭獎尾
      25: 1,  // 頭獎頭
      26: 1,  // 財神尾
      27: 1,  // 財神頭
      28: 1,  // 特碼頭
      29: 1,  // 27碼頭
};

interface IBetParam {
      [key: string]: object;
}
const BetParam: IBetParam = {};
BetParam.MarkSix = MarkSix;
BetParam["3D"] = D3;
BetParam.Happy = Happy;
BetParam.Cars = Cars;
BetParam.BTCHash = BTCHash;
BetParam.HashSix = HashSix;
BetParam.SGPools = SGPools;
BetParam.VNNorth = VNNorth;
BetParam.Happy8 = Happy8;
export default BetParam;
