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
interface IBetParam {
      [key: string]: object;
}
const BetParam: IBetParam = {};
BetParam.MarkSix = MarkSix;
BetParam["3D"] = D3;
BetParam.Happy = Happy;
BetParam.Cars = Cars;
export default BetParam;
