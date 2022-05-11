// sp : 1  , normal : 0
const MarkSix = {
    1: 1, // [{ Title: '特碼' }],
    2: 1, // [{ Title: '特碼單雙'}],
    3: 1, // [{ Title: '特碼大小'}],
    74: 1, // [{ Title: '特碼尾大小'}],
    4: 0,  // [{ Title: '正碼' }],
    5: 0,  // [{ Title: '總和單雙'}],
    6: 0,  // [{ Title: '總和大小'}],
    7: 0,  // [{ Title: '三全中' }],
    8: 0,  // [{ Title: '三中二 I',SubTitle:'中二'},{ Title: '三中二 I',SubTitle:'全中',Filter:'>100'}],
    72: 0, // [{ Title: '三中二 II',SubTitle:'中二'},{ Title: '三中二 II',SubTitle:'全中',Filter:'>100'}],
    9: 0,  // [{ Title: '二全中' }],
    10: 0, // [{ Title: '二中特 I',SubTitle:'中特'},{ Title: '二中特 I',SubTitle:'中二',Filter:'>100'}],
    73: 0, // [{ Title: '二中特 II',SubTitle:'中特'},{ Title: '二中特 II',SubTitle:'中二',Filter:'>100'}],
    11: 0, // [{ Title: '特串' }],
    71: 0, // [{ Title: '四中一' }],
    12: 0, // [{ Title: '正碼1-6單雙'}],
    13: 0, // [{ Title: '正碼1-6大小'}],
    14: 0, // [{ Title: '正碼1-6色波',SubTitle: '藍綠波'},{ Title: '正碼1-6色波',SubTitle: '紅波'}],
    27: 0, // [{ Title: '正1-6合數單雙'}],
    15: 0, // [{ Title: "正碼過關"}],
    16: 1, // [{ Title: '特碼合數單雙'}],
    17: 1, // [{ Title: '特碼色波',SubTitle: '藍綠波' },{ Title: '特碼色波',SubTitle: '紅波' }],
    18: 1, // [{ Title: '特碼生肖',SubTitle:'一般'},{ Title: '特碼生肖',SubTitle:'1號生肖'}],
    19: 0, // [{ Title: '生肖',SubTitle: '一般'},{ Title: '生肖',SubTitle:'1號生肖'}],
    20: 0, // [{ Title: '尾數',SubTitle: '一般'},{ Title: '尾數',SubTitle:'0尾'}],
    21: 0, // [{ Title: '正1特' }],
    22: 0, // [{ Title: '正2特' }],
    23: 0, // [{ Title: '正3特' }],
    24: 0, // [{ Title: '正4特' }],
    25: 0, // [{ Title: '正5特' }],
    26: 0, // [{ Title: '正6特' }],
    29: 0, /*[{ Title: '半波'}],*/
    75: 0, // [{ Title: '二肖'}],
    76: 0, // [{ Title: '三肖'}],
    77: 0, // [{ Title: '四肖'}],
    78: 0, // [{ Title: '五肖'}],
    30: 0, // [{ Title: '六肖'}],
    31: 0, // [{ Title: '五不中'}],
    48: 0, // [{ Title: '六不中'}],
    49: 0, // [{ Title: '七不中'}],
    50: 0, // [{ Title: '八不中'}],
    51: 0, // [{ Title: '九不中'}],
    52: 0, // [{ Title: '十不中'}],
    32: 0, // [{ Title: '二肖連-中'}],
    33: 0, // [{ Title: '三肖連-中'}],
    34: 0, // [{ Title: '四肖連-中'}],
    44: 0, // [{ Title: '五肖連-中'}],
    35: 0, // [{ Title: '二肖連-不中'}],
    36: 0, // [{ Title: '三肖連-不中'}],
    37: 0, // [{ Title: '四肖連-不中'}],
    45: 0, // [{ Title: '五肖連-不中'}],
    38: 0, // [{ Title: '二尾連-中'}],
    39: 0, // [{ Title: '三尾連-中'}],
    40: 0, // [{ Title: '四尾連-中'}],
    46: 0, // [{ Title: '五尾連-中'}],
    41: 0, // [{ Title: '二尾連-不中'}],
    42: 0, // [{ Title: '三尾連-不中'}],
    43: 0, // [{ Title: '四尾連-不中'}],
    47: 0, // [{ Title: '五尾連-不中'}],
    53: 0, /*[{ Title: '七碼'}],*/
    54: 0, // [{ Title: '五行',SubTitle:'一般'},{ Title: '五行',SubTitle:'土'}],
    55: 0, /*[{ Title: '一肖量'}],*/
    56: 0, /*[{Title: '尾數量'}],*/
    57: 0, // [{ Title: '五中一' }],
    58: 0, // [{ Title: '六中一' }],
    59: 0, // [{ Title: '七中一' }],
    60: 0, // [{ Title: '八中一' }],
    61: 0, // [{ Title: '九中一' }],
    62: 0, // [{ Title: '十中一' }],
    63: 0, // [{ Title: '一粒任中' }],
    64: 0, // [{ Title: '二粒任中' }],
    65: 0, // [{ Title: '三粒任中' }],
    66: 0, // [{ Title: '四粒任中' }],
    67: 0, // [{ Title: '五粒任中' }],
    68: 0, // [{ Title: '龍虎'}],
    69: 0, // [{ Title: '一肖不中',SubTitle: '一般'},{ Title: '一肖不中',SubTitle:'1號生肖'}],
    70: 0, // [{ Title: '尾數不中',SubTitle: '一般'},{ Title: '尾數不中',SubTitle:'0尾'}]
};
const D3 = {
      1: 0, // [{ Title: '一定位-個' }],
      2: 0, // :[{ Title: '一定位-個單雙'}],
      3: 0, // [{ Title: '一定位-個大小'}],
      4: 0, // [{ Title: '一定位-拾' }],
      5: 0, // [{ Title: '一定位-拾單雙'}],
      6: 0, // [{ Title: '一定位-拾大小'}],
      7: 0, // [{ Title: '一定位-佰' }],
      8: 0, // [{ Title: '一定位-佰單雙'}],
      9: 0, // [{ Title: '一定位-佰大小'}],
      10: 0, // [{ Title: '一字組合' }],
      11: 0, // { Title: '三字和數'},
      12: 0, // [{ Title: '三字和數單雙'}],
      13: 0, // [{ Title: '三字和數大小'}],
      14: 0, // [{ Title: '二定位拾個' }],
      15: 0, // [{ Title: '二定位佰個' }],
      16: 0, // [{ Title: '二定位佰拾' }],
      17: 0, // [{ Title: '二字组合'}],
      18: 0, // [{ Title: '組 3全包'}],
      19: 0, // [{ Title: '組 3轉直-5'}],
      20: 0, // [{ Title: '組 3轉直-6'}],
      21: 0, // [{ Title: '組 3轉直-7'}],
      22: 0, // [{ Title: '組 3轉直-8'}],
      23: 0, // [{ Title: '組 6轉直-4'}],
      24: 0, // [{ Title: '組 6轉直-5'}],
      25: 0, // [{ Title: '組 6轉直-6'}],
      26: 0, // [{ Title: '組 6轉直-7'}],
      27: 0, // [{ Title: '組 6轉直-8'}],
      28: 0, // [{ Title: '3x3x3'}],
      29: 0, // [{ Title: '4x4x4'}],
      30: 0, // [{ Title: '5x5x5'}],
      31: 0, // [{ Title: '6x6x6'}],
      32: 0, // [{ Title: '7x7x7'}],
      33: 0, // [{ Title: '中 3 保 3'}],
      34: 0, // [{ Title: '一定位-個質合'}],
      35: 0, // [{ Title: '一定位-拾質合'}],
      36: 0, // [{ Title: '一定位-佰質合'}],
      37: 0, // [{ Title: '定位單雙過關'}],
      38: 0, // [{ Title: '定位大小過關'}],
      39: 0, // [{ Title: '定位質合過關'}],
      40: 0, // { Title: '跨度'},
      41: 0, // [{ Title: '合值' }],
      42: 0, // { Title: '三定位'},
      43: 0, // { Title: '三字组合'},
      44: 0, // { Title: '拾個和數'},
      45: 0, // { Title: '佰個和數'},
      46: 0, // { Title: '佰拾和數'},
      47: 0, // [{ Title: '拾個和數單雙'}],
      48: 0, // [{ Title: '佰個和數單雙'}],
      49: 0, // [{ Title: '佰拾和數單雙'}],
      50: 0, // [{ Title: '拾個和數尾數' }],
      51: 0, // [{ Title: '佰個和數尾數' }],
      52: 0, // [{ Title: '佰拾和數尾數' }],
      53: 0, // [{ Title: '拾個和數尾數大小'}],
      54: 0, // [{ Title: '佰個和數尾數大小'}],
      55: 0, // [{ Title: '佰拾和數尾數大小'}],
      56: 0, // [{ Title: '拾個和數尾數質合'}],
      57: 0, // [{ Title: '佰個和數尾數質合'}],
      58: 0, // [{ Title: '佰拾和數尾數質合'}],
      59: 0, // [{ Title: '雜六'}],
      60: 0, // [{ Title: '順子'}],
      61: 0, // [{ Title: '豹子'}],
      62: 0, // [{ Title: '不出'}],
      63: 0, // [{ Title: '對子'}],
      64: 0, // [{ Title: '准對'}],
      65: 0, // [{ Title: '半順'}],
      66: 0, // [{ Title: '殺號'}]
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
const VNNorth = {
      1: 1,   // 特別號
      2: 0,   // 27碼
      3: 0,   // 2星
      4: 0,   // 3星
      5: 0,   // 4星
      8: 1,   // 50組
      9: 1,   // 25組
      10: 0,  // 合數尾
      11: 0,  // 生肖
      13: 0,  // 除三餘數
      15: 0,  // 27碼-4不出
      16: 0,  // 27碼-5不出
      17: 0,  // 27碼-6不出
      18: 0,  // 27碼-7不出
      19: 0,  // 27碼-8不出
      20: 0,  // 2D-頭
      21: 0,  // 3D-頭
      22: 1,  // 3D-尾
      23: 0,  // 3D-23組
      24: 0,  // 頭獎尾
      25: 0,  // 頭獎頭
      26: 0,  // 財神尾
      27: 0,  // 財神頭
      28: 1,  // 特碼頭
      29: 0,  // 27碼頭
};
interface ISpOrNormal {
      [key: string]: object;
}
const SpOrNormal: ISpOrNormal = {};
SpOrNormal.MarkSix = MarkSix;
SpOrNormal["3D"] = D3;
SpOrNormal.SGPools = SGPools;
SpOrNormal.VNNorth = VNNorth;

export default SpOrNormal;