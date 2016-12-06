/* jstz.min.js Version: 1.0.6 Build date: 2015-11-04 */
!function(e){var a=function(){"use strict";var e="s",s={DAY:864e5,HOUR:36e5,MINUTE:6e4,SECOND:1e3,BASELINE_YEAR:2014,MAX_SCORE:864e6,AMBIGUITIES:{"America/Denver":["America/Mazatlan"],"Europe/London":["Africa/Casablanca"],"America/Chicago":["America/Mexico_City"],"America/Asuncion":["America/Campo_Grande","America/Santiago"],"America/Montevideo":["America/Sao_Paulo","America/Santiago"],"Asia/Beirut":["Asia/Amman","Asia/Jerusalem","Europe/Helsinki","Asia/Damascus","Africa/Cairo","Asia/Gaza","Europe/Minsk"],"Pacific/Auckland":["Pacific/Fiji"],"America/Los_Angeles":["America/Santa_Isabel"],"America/New_York":["America/Havana"],"America/Halifax":["America/Goose_Bay"],"America/Godthab":["America/Miquelon"],"Asia/Dubai":["Asia/Yerevan"],"Asia/Jakarta":["Asia/Krasnoyarsk"],"Asia/Shanghai":["Asia/Irkutsk","Australia/Perth"],"Australia/Sydney":["Australia/Lord_Howe"],"Asia/Tokyo":["Asia/Yakutsk"],"Asia/Dhaka":["Asia/Omsk"],"Asia/Baku":["Asia/Yerevan"],"Australia/Brisbane":["Asia/Vladivostok"],"Pacific/Noumea":["Asia/Vladivostok"],"Pacific/Majuro":["Asia/Kamchatka","Pacific/Fiji"],"Pacific/Tongatapu":["Pacific/Apia"],"Asia/Baghdad":["Europe/Minsk","Europe/Moscow"],"Asia/Karachi":["Asia/Yekaterinburg"],"Africa/Johannesburg":["Asia/Gaza","Africa/Cairo"]}},i=function(e){var a=-e.getTimezoneOffset();return null!==a?a:0},r=function(){var a=i(new Date(s.BASELINE_YEAR,0,2)),r=i(new Date(s.BASELINE_YEAR,5,2)),n=a-r;return 0>n?a+",1":n>0?r+",1,"+e:a+",0"},n=function(){var e,a;if("undefined"!=typeof Intl&&"undefined"!=typeof Intl.DateTimeFormat&&(e=Intl.DateTimeFormat(),"undefined"!=typeof e&&"undefined"!=typeof e.resolvedOptions))return a=e.resolvedOptions().timeZone,a&&(a.indexOf("/")>-1||"UTC"===a)?a:void 0},o=function(e){for(var a=new Date(e,0,1,0,0,1,0).getTime(),s=new Date(e,12,31,23,59,59).getTime(),i=a,r=new Date(i).getTimezoneOffset(),n=null,o=null;s-864e5>i;){var t=new Date(i),A=t.getTimezoneOffset();A!==r&&(r>A&&(n=t),A>r&&(o=t),r=A),i+=864e5}return n&&o?{s:u(n).getTime(),e:u(o).getTime()}:!1},u=function l(e,a,i){"undefined"==typeof a&&(a=s.DAY,i=s.HOUR);for(var r=new Date(e.getTime()-a).getTime(),n=e.getTime()+a,o=new Date(r).getTimezoneOffset(),u=r,t=null;n-i>u;){var A=new Date(u),c=A.getTimezoneOffset();if(c!==o){t=A;break}u+=i}return a===s.DAY?l(t,s.HOUR,s.MINUTE):a===s.HOUR?l(t,s.MINUTE,s.SECOND):t},t=function(e,a,s,i){if("N/A"!==s)return s;if("Asia/Beirut"===a){if("Africa/Cairo"===i.name&&13983768e5===e[6].s&&14116788e5===e[6].e)return 0;if("Asia/Jerusalem"===i.name&&13959648e5===e[6].s&&14118588e5===e[6].e)return 0}else if("America/Santiago"===a){if("America/Asuncion"===i.name&&14124816e5===e[6].s&&1397358e6===e[6].e)return 0;if("America/Campo_Grande"===i.name&&14136912e5===e[6].s&&13925196e5===e[6].e)return 0}else if("America/Montevideo"===a){if("America/Sao_Paulo"===i.name&&14136876e5===e[6].s&&1392516e6===e[6].e)return 0}else if("Pacific/Auckland"===a&&"Pacific/Fiji"===i.name&&14142456e5===e[6].s&&13961016e5===e[6].e)return 0;return s},A=function(e,i){for(var r=function(a){for(var r=0,n=0;n<e.length;n++)if(a.rules[n]&&e[n]){if(!(e[n].s>=a.rules[n].s&&e[n].e<=a.rules[n].e)){r="N/A";break}if(r=0,r+=Math.abs(e[n].s-a.rules[n].s),r+=Math.abs(a.rules[n].e-e[n].e),r>s.MAX_SCORE){r="N/A";break}}return r=t(e,i,r,a)},n={},o=a.olson.dst_rules.zones,u=o.length,A=s.AMBIGUITIES[i],c=0;u>c;c++){var m=o[c],l=r(o[c]);"N/A"!==l&&(n[m.name]=l)}for(var f in n)if(n.hasOwnProperty(f))for(var d=0;d<A.length;d++)if(A[d]===f)return f;return i},c=function(e){var s=function(){for(var e=[],s=0;s<a.olson.dst_rules.years.length;s++){var i=o(a.olson.dst_rules.years[s]);e.push(i)}return e},i=function(e){for(var a=0;a<e.length;a++)if(e[a]!==!1)return!0;return!1},r=s(),n=i(r);return n?A(r,e):e},m=function(){var e=n();return e||(e=a.olson.timezones[r()],"undefined"!=typeof s.AMBIGUITIES[e]&&(e=c(e))),{name:function(){return e}}};return{determine:m}}();a.olson=a.olson||{},a.olson.timezones={"-720,0":"Etc/GMT+12","-660,0":"Pacific/Pago_Pago","-660,1,s":"Pacific/Apia","-600,1":"America/Adak","-600,0":"Pacific/Honolulu","-570,0":"Pacific/Marquesas","-540,0":"Pacific/Gambier","-540,1":"America/Anchorage","-480,1":"America/Los_Angeles","-480,0":"Pacific/Pitcairn","-420,0":"America/Phoenix","-420,1":"America/Denver","-360,0":"America/Guatemala","-360,1":"America/Chicago","-360,1,s":"Pacific/Easter","-300,0":"America/Bogota","-300,1":"America/New_York","-270,0":"America/Caracas","-240,1":"America/Halifax","-240,0":"America/Santo_Domingo","-240,1,s":"America/Asuncion","-210,1":"America/St_Johns","-180,1":"America/Godthab","-180,0":"America/Argentina/Buenos_Aires","-180,1,s":"America/Montevideo","-120,0":"America/Noronha","-120,1":"America/Noronha","-60,1":"Atlantic/Azores","-60,0":"Atlantic/Cape_Verde","0,0":"UTC","0,1":"Europe/London","60,1":"Europe/Berlin","60,0":"Africa/Lagos","60,1,s":"Africa/Windhoek","120,1":"Asia/Beirut","120,0":"Africa/Johannesburg","180,0":"Asia/Baghdad","180,1":"Europe/Moscow","210,1":"Asia/Tehran","240,0":"Asia/Dubai","240,1":"Asia/Baku","270,0":"Asia/Kabul","300,1":"Asia/Yekaterinburg","300,0":"Asia/Karachi","330,0":"Asia/Kolkata","345,0":"Asia/Kathmandu","360,0":"Asia/Dhaka","360,1":"Asia/Omsk","390,0":"Asia/Rangoon","420,1":"Asia/Krasnoyarsk","420,0":"Asia/Jakarta","480,0":"Asia/Shanghai","480,1":"Asia/Irkutsk","525,0":"Australia/Eucla","525,1,s":"Australia/Eucla","540,1":"Asia/Yakutsk","540,0":"Asia/Tokyo","570,0":"Australia/Darwin","570,1,s":"Australia/Adelaide","600,0":"Australia/Brisbane","600,1":"Asia/Vladivostok","600,1,s":"Australia/Sydney","630,1,s":"Australia/Lord_Howe","660,1":"Asia/Kamchatka","660,0":"Pacific/Noumea","690,0":"Pacific/Norfolk","720,1,s":"Pacific/Auckland","720,0":"Pacific/Majuro","765,1,s":"Pacific/Chatham","780,0":"Pacific/Tongatapu","780,1,s":"Pacific/Apia","840,0":"Pacific/Kiritimati"},a.olson.dst_rules={years:[2008,2009,2010,2011,2012,2013,2014],zones:[{name:"Africa/Cairo",rules:[{e:12199572e5,s:12090744e5},{e:1250802e6,s:1240524e6},{e:12858804e5,s:12840696e5},!1,!1,!1,{e:14116788e5,s:1406844e6}]},{name:"Africa/Casablanca",rules:[{e:12202236e5,s:12122784e5},{e:12508092e5,s:12438144e5},{e:1281222e6,s:12727584e5},{e:13120668e5,s:13017888e5},{e:13489704e5,s:1345428e6},{e:13828392e5,s:13761e8},{e:14142888e5,s:14069448e5}]},{name:"America/Asuncion",rules:[{e:12050316e5,s:12243888e5},{e:12364812e5,s:12558384e5},{e:12709548e5,s:12860784e5},{e:13024044e5,s:1317528e6},{e:1333854e6,s:13495824e5},{e:1364094e6,s:1381032e6},{e:13955436e5,s:14124816e5}]},{name:"America/Campo_Grande",rules:[{e:12032172e5,s:12243888e5},{e:12346668e5,s:12558384e5},{e:12667212e5,s:1287288e6},{e:12981708e5,s:13187376e5},{e:13302252e5,s:1350792e6},{e:136107e7,s:13822416e5},{e:13925196e5,s:14136912e5}]},{name:"America/Goose_Bay",rules:[{e:122559486e4,s:120503526e4},{e:125704446e4,s:123648486e4},{e:128909886e4,s:126853926e4},{e:13205556e5,s:129998886e4},{e:13520052e5,s:13314456e5},{e:13834548e5,s:13628952e5},{e:14149044e5,s:13943448e5}]},{name:"America/Havana",rules:[{e:12249972e5,s:12056436e5},{e:12564468e5,s:12364884e5},{e:12885012e5,s:12685428e5},{e:13211604e5,s:13005972e5},{e:13520052e5,s:13332564e5},{e:13834548e5,s:13628916e5},{e:14149044e5,s:13943412e5}]},{name:"America/Mazatlan",rules:[{e:1225008e6,s:12074724e5},{e:12564576e5,s:1238922e6},{e:1288512e6,s:12703716e5},{e:13199616e5,s:13018212e5},{e:13514112e5,s:13332708e5},{e:13828608e5,s:13653252e5},{e:14143104e5,s:13967748e5}]},{name:"America/Mexico_City",rules:[{e:12250044e5,s:12074688e5},{e:1256454e6,s:12389184e5},{e:12885084e5,s:1270368e6},{e:1319958e6,s:13018176e5},{e:13514076e5,s:13332672e5},{e:13828572e5,s:13653216e5},{e:14143068e5,s:13967712e5}]},{name:"America/Miquelon",rules:[{e:12255984e5,s:12050388e5},{e:1257048e6,s:12364884e5},{e:12891024e5,s:12685428e5},{e:1320552e6,s:12999924e5},{e:13520016e5,s:1331442e6},{e:13834512e5,s:13628916e5},{e:14149008e5,s:13943412e5}]},{name:"America/Santa_Isabel",rules:[{e:12250116e5,s:1207476e6},{e:12564612e5,s:12389256e5},{e:12885156e5,s:12703752e5},{e:13199652e5,s:13018248e5},{e:13514148e5,s:13332744e5},{e:13828644e5,s:13653288e5},{e:1414314e6,s:13967784e5}]},{name:"America/Santiago",rules:[{e:1206846e6,s:1223784e6},{e:1237086e6,s:12552336e5},{e:127035e7,s:12866832e5},{e:13048236e5,s:13138992e5},{e:13356684e5,s:13465584e5},{e:1367118e6,s:13786128e5},{e:13985676e5,s:14100624e5}]},{name:"America/Sao_Paulo",rules:[{e:12032136e5,s:12243852e5},{e:12346632e5,s:12558348e5},{e:12667176e5,s:12872844e5},{e:12981672e5,s:1318734e6},{e:13302216e5,s:13507884e5},{e:13610664e5,s:1382238e6},{e:1392516e6,s:14136876e5}]},{name:"Asia/Amman",rules:[{e:1225404e6,s:12066552e5},{e:12568536e5,s:12381048e5},{e:12883032e5,s:12695544e5},{e:13197528e5,s:13016088e5},!1,!1,{e:14147064e5,s:13959576e5}]},{name:"Asia/Damascus",rules:[{e:12254868e5,s:120726e7},{e:125685e7,s:12381048e5},{e:12882996e5,s:12701592e5},{e:13197492e5,s:13016088e5},{e:13511988e5,s:13330584e5},{e:13826484e5,s:1364508e6},{e:14147028e5,s:13959576e5}]},{name:"Asia/Dubai",rules:[!1,!1,!1,!1,!1,!1,!1]},{name:"Asia/Gaza",rules:[{e:12199572e5,s:12066552e5},{e:12520152e5,s:12381048e5},{e:1281474e6,s:126964086e4},{e:1312146e6,s:130160886e4},{e:13481784e5,s:13330584e5},{e:13802292e5,s:1364508e6},{e:1414098e6,s:13959576e5}]},{name:"Asia/Irkutsk",rules:[{e:12249576e5,s:12068136e5},{e:12564072e5,s:12382632e5},{e:12884616e5,s:12697128e5},!1,!1,!1,!1]},{name:"Asia/Jerusalem",rules:[{e:12231612e5,s:12066624e5},{e:1254006e6,s:1238112e6},{e:1284246e6,s:12695616e5},{e:131751e7,s:1301616e6},{e:13483548e5,s:13330656e5},{e:13828284e5,s:13645152e5},{e:1414278e6,s:13959648e5}]},{name:"Asia/Kamchatka",rules:[{e:12249432e5,s:12067992e5},{e:12563928e5,s:12382488e5},{e:12884508e5,s:12696984e5},!1,!1,!1,!1]},{name:"Asia/Krasnoyarsk",rules:[{e:12249612e5,s:12068172e5},{e:12564108e5,s:12382668e5},{e:12884652e5,s:12697164e5},!1,!1,!1,!1]},{name:"Asia/Omsk",rules:[{e:12249648e5,s:12068208e5},{e:12564144e5,s:12382704e5},{e:12884688e5,s:126972e7},!1,!1,!1,!1]},{name:"Asia/Vladivostok",rules:[{e:12249504e5,s:12068064e5},{e:12564e8,s:1238256e6},{e:12884544e5,s:12697056e5},!1,!1,!1,!1]},{name:"Asia/Yakutsk",rules:[{e:1224954e6,s:120681e7},{e:12564036e5,s:12382596e5},{e:1288458e6,s:12697092e5},!1,!1,!1,!1]},{name:"Asia/Yekaterinburg",rules:[{e:12249684e5,s:12068244e5},{e:1256418e6,s:1238274e6},{e:12884724e5,s:12697236e5},!1,!1,!1,!1]},{name:"Asia/Yerevan",rules:[{e:1224972e6,s:1206828e6},{e:12564216e5,s:12382776e5},{e:1288476e6,s:12697272e5},{e:13199256e5,s:13011768e5},!1,!1,!1]},{name:"Australia/Lord_Howe",rules:[{e:12074076e5,s:12231342e5},{e:12388572e5,s:12545838e5},{e:12703068e5,s:12860334e5},{e:13017564e5,s:1317483e6},{e:1333206e6,s:13495374e5},{e:13652604e5,s:1380987e6},{e:139671e7,s:14124366e5}]},{name:"Australia/Perth",rules:[{e:12068136e5,s:12249576e5},!1,!1,!1,!1,!1,!1]},{name:"Europe/Helsinki",rules:[{e:12249828e5,s:12068388e5},{e:12564324e5,s:12382884e5},{e:12884868e5,s:1269738e6},{e:13199364e5,s:13011876e5},{e:1351386e6,s:13326372e5},{e:13828356e5,s:13646916e5},{e:14142852e5,s:13961412e5}]},{name:"Europe/Minsk",rules:[{e:12249792e5,s:12068352e5},{e:12564288e5,s:12382848e5},{e:12884832e5,s:12697344e5},!1,!1,!1,!1]},{name:"Europe/Moscow",rules:[{e:12249756e5,s:12068316e5},{e:12564252e5,s:12382812e5},{e:12884796e5,s:12697308e5},!1,!1,!1,!1]},{name:"Pacific/Apia",rules:[!1,!1,!1,{e:13017528e5,s:13168728e5},{e:13332024e5,s:13489272e5},{e:13652568e5,s:13803768e5},{e:13967064e5,s:14118264e5}]},{name:"Pacific/Fiji",rules:[!1,!1,{e:12696984e5,s:12878424e5},{e:13271544e5,s:1319292e6},{e:1358604e6,s:13507416e5},{e:139005e7,s:1382796e6},{e:14215032e5,s:14148504e5}]},{name:"Europe/London",rules:[{e:12249828e5,s:12068388e5},{e:12564324e5,s:12382884e5},{e:12884868e5,s:1269738e6},{e:13199364e5,s:13011876e5},{e:1351386e6,s:13326372e5},{e:13828356e5,s:13646916e5},{e:14142852e5,s:13961412e5}]}]},"undefined"!=typeof module&&"undefined"!=typeof module.exports?module.exports=a:"undefined"!=typeof define&&null!==define&&null!=define.amd?define([],function(){return a}):"undefined"==typeof e?window.jstz=a:e.jstz=a}();

var daysArr = ["time.mo","time.tu","time.we","time.th","time.fr","time.jun","time.sa","time.su"];
var monthsArr = ["time.jan","time.feb","time.mar","time.apr","time.may","time.jun","time.jul","time.aug","time.sep","time.oct","time.nov","time.dec"];
var weeksArr = ["time.first","time.second","time.third","time.fourth","time.last"];
var dateFormat = ["DD.MM.YY","DD/MM/YY","DD-MM-YY","YY/MM/DD","YY-MM-DD"];
var timeFormat = ["HH:MI:SS P","HH.MI:SS P","HH24:MI:SS","HH24.MI:SS","HH:MI P","HH.MI P","HH24:MI","HH24.MI"];

var timertime = null;
var timersken = null;
var timersled = null;
var selLed = 1;
var DELAY = 400, clicks = 0, timer = null;
var currAp="";
var modulesCount = 0;
var chv = [];
var mpIsDo=0;

var manual = false;
var selModule = 0;
var unixtime = 0;
var unixtimestamp = 0;
var config = null;

var clrs = [
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#000000",
"#4D004D",
"#500051",
"#530055",
"#55005A",
"#58005E",
"#5B0063",
"#5D0067",
"#5F006C",
"#610070",
"#630075",
"#650079",
"#67007E",
"#680082",
"#690087",
"#6B008B",
"#6C008F",
"#6C0094",
"#6D0098",
"#6E009D",
"#6E00A1",
"#6F00A6",
"#6F00AA",
"#6F00AF",
"#6E00B3",
"#6E00B8",
"#6E00BC",
"#6D00C1",
"#6C00C5",
"#6B00C9",
"#6A00CE",
"#6900D2",
"#6800D7",
"#6600DB",
"#6500E0",
"#6300E4",
"#6100E9",
"#5F00ED",
"#5D00F2",
"#5A00F6",
"#5800FB",
"#5500FF",
"#5100FF",
"#4D00FF",
"#4800FF",
"#4400FF",
"#4000FF",
"#3C00FF",
"#3700FF",
"#3300FF",
"#2F00FF",
"#2B00FF",
"#2600FF",
"#2200FF",
"#1E00FF",
"#1A00FF",
"#1500FF",
"#1100FF",
"#0D00FF",
"#0900FF",
"#0400FF",
"#0000FF",
"#0005FF",
"#000AFF",
"#000FFF",
"#0014FF",
"#001AFF",
"#001FFF",
"#0024FF",
"#0029FF",
"#002EFF",
"#0033FF",
"#0038FF",
"#003DFF",
"#0042FF",
"#0047FF",
"#004DFF",
"#0052FF",
"#0057FF",
"#005CFF",
"#0061FF",
"#0066FF",
"#006BFF",
"#0070FF",
"#0075FF",
"#007AFF",
"#0080FF",
"#0085FF",
"#008AFF",
"#008FFF",
"#0094FF",
"#0099FF",
"#009EFF",
"#00A3FF",
"#00A8FF",
"#00ADFF",
"#00B3FF",
"#00B8FF",
"#00BDFF",
"#00C2FF",
"#00C7FF",
"#00CCFF",
"#00D1FF",
"#00D6FF",
"#00DBFF",
"#00E0FF",
"#00E6FF",
"#00EBFF",
"#00F0FF",
"#00F5FF",
"#00FAFF",
"#00FFFF",
"#00FFF2",
"#00FFE6",
"#00FFD9",
"#00FFCC",
"#00FFBF",
"#00FFB3",
"#00FFA6",
"#00FF99",
"#00FF8C",
"#00FF80",
"#00FF73",
"#00FF66",
"#00FF59",
"#00FF4D",
"#00FF40",
"#00FF33",
"#00FF26",
"#00FF1A",
"#00FF0D",
"#00FF00",
"#04FF00",
"#07FF00",
"#0BFF00",
"#0FFF00",
"#12FF00",
"#16FF00",
"#1AFF00",
"#1DFF00",
"#21FF00",
"#24FF00",
"#28FF00",
"#2CFF00",
"#2FFF00",
"#33FF00",
"#37FF00",
"#3AFF00",
"#3EFF00",
"#42FF00",
"#45FF00",
"#49FF00",
"#4DFF00",
"#50FF00",
"#54FF00",
"#57FF00",
"#5BFF00",
"#5FFF00",
"#62FF00",
"#66FF00",
"#6AFF00",
"#6DFF00",
"#71FF00",
"#75FF00",
"#78FF00",
"#7CFF00",
"#80FF00",
"#83FF00",
"#87FF00",
"#8AFF00",
"#8EFF00",
"#92FF00",
"#95FF00",
"#99FF00",
"#9DFF00",
"#A0FF00",
"#A4FF00",
"#A8FF00",
"#ABFF00",
"#AFFF00",
"#B3FF00",
"#B6FF00",
"#BAFF00",
"#BDFF00",
"#C1FF00",
"#C5FF00",
"#C8FF00",
"#CCFF00",
"#D0FF00",
"#D3FF00",
"#D7FF00",
"#DBFF00",
"#DEFF00",
"#E2FF00",
"#E6FF00",
"#E9FF00",
"#EDFF00",
"#F0FF00",
"#F4FF00",
"#F8FF00",
"#FBFF00",
"#FFFF00",
"#FFFB00",
"#FFF700",
"#FFF300",
"#FFEF00",
"#FFEB00",
"#FFE700",
"#FFE400",
"#FFE000",
"#FFDC00",
"#FFD800",
"#FFD400",
"#FFD000",
"#FFCC00",
"#FFC800",
"#FFC400",
"#FFC000",
"#FFBC00",
"#FFB800",
"#FFB400",
"#FFB100",
"#FFAD00",
"#FFA900",
"#FFA500",
"#FFA100",
"#FF9D00",
"#FF9900",
"#FF9500",
"#FF9100",
"#FF8D00",
"#FF8900",
"#FF8500",
"#FF8100",
"#FF7E00",
"#FF7A00",
"#FF7600",
"#FF7200",
"#FF6E00",
"#FF6A00",
"#FF6600",
"#FF6200",
"#FF5E00",
"#FF5A00",
"#FF5600",
"#FF5200",
"#FF4E00",
"#FF4B00",
"#FF4700",
"#FF4300",
"#FF3F00",
"#FF3B00",
"#FF3700",
"#FF3300",
"#FF2F00",
"#FF2B00",
"#FF2700",
"#FF2300",
"#FF1F00",
"#FF1B00",
"#FF1800",
"#FF1400",
"#FF1000",
"#FF0C00",
"#FF0800",
"#FF0400",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FF0000",
"#FD0000",
"#FB0000",
"#F80000",
"#F60000",
"#F40000",
"#F20000",
"#EF0000",
"#ED0000",
"#EB0000",
"#E90000",
"#E60000",
"#E40000",
"#E20000",
"#E00000",
"#DE0000",
"#DB0000",
"#D90000",
"#D70000",
"#D50000",
"#D20000",
"#D00000",
"#CE0000",
"#CC0000",
"#C90000",
"#C70000",
"#C50000",
"#C30000",
"#C10000",
"#BE0000",
"#BC0000",
"#BA0000",
"#B80000",
"#B50000",
"#B30000",
"#B10000",
"#AF0000",
"#AC0000",
"#AA0000",
"#A80000",
"#A60000",
"#A40000",
"#A10000",
"#9F0000",
"#9D0000",
"#9B0000",
"#980000",
"#960000",
"#940000",
"#920000"];

var data =  [[0,0,0,0,0,0,0,0],
			[96,0,0,0,0,0,0,0]];
			
var dtmo = [
	[[0,0,0,0,0,0,0,0],
	[96,0,0,0,0,0,0,0]]
];

var channels = [
[360,0,0,0,0,0,0,0],
[361,0,0,0,0,0,0,0],
[362,0,0,0,0,0,0,0],
[363,0,0,0,0,0,0,0],
[364,0,0,0,0,0,0,0],
[365,0,0,0,0,0,0,0],
[366,0,3.07,0,0,0,0,0],
[367,0,3.41,0,0,0,0,0],
[368,0,3.75,0,0,0,0,0],
[369,0,4.09,0,0,0,0,0],
[370,0,4.43,0,0,0,0,0],
[371,0,4.77,0,0,0,0,0],
[372,0,5.11,0,0,0,0,0],
[373,0,5.45,0,0,0,0,0],
[374,0,5.46,0,0,0,0,0],
[375,0,5.46,0,0,0,0,0],
[376,0,11.6,0,0,0,0,0],
[377,0,12.28,0,0,0,0,0],
[378,0,12.96,0,0,0,0,0],
[379,0,14.73,0,0,0,0,0],
[380,0,16.51,0,0,0,0,0],
[381,0,18.28,0,0,0,0,0],
[382,0,20.05,0,0,0,0,0],
[383,0,23.28,0,0,0,0,0],
[384,0,25.86,0,0,0,0,0],
[385,0,28.38,0,0,0,0,0],
[386,0,36.36,0,0,0,0,0],
[387,0,41.61,0,0,0,0,0],
[388,0,51.78,0,0,0,0,0],
[389,0,65.22,0,0,0,0,0],
[390,0,79.75,0,0,0,0,0],
[391,0,93.19,0,0,0,0,0],
[392,0,106.62,0,0,0,0,0],
[393,0,122.99,0,0,0,0,0],
[394,0,159.79,0,0,0,0,0],
[395,0,197.57,0,0,0,0,0],
[396,0,240.13,0,0,0,0,0],
[397,0,304.54,0,0,0,0,0],
[398,0,367.85,0,0,0,0,0],
[399,0,445.34,0,0,0,0,0],
[400,0,525.03,0,0,0,0,0],
[401,0,613.44,0,0,0,0,0],
[402,0,740.06,0,0,0,0,0],
[403,0,822.3,0,0,0,0,0],
[404,0,944.93,0,0,0,0,0],
[405,0,1029.31,3.64,0,0,0,0],
[406,0,1087.71,3.65,0,0,0,0],
[407,0,1161.39,3.66,0,0,0,0],
[408,0,1213.78,7.27,0,0,0,0],
[409,0,1194.13,7.28,0,0,0,0],
[410,0,1249.8,10.87,0,0,0,0],
[411,0,1337.12,10.88,0,0,0,0],
[412,0,1509.58,10.89,0,0,0,0],
[413,0,1603.46,18.07,0,0,0,0],
[414,0,1704.97,18.08,0,0,0,0],
[415,0,1740.99,21.67,0,0,0,0],
[416,0,1731.16,25.27,0,0,0,0],
[417,2.46,1672.22,32.44,0,0,0,0],
[418,1.64,1615.46,32.45,0,0,0,0],
[419,2.7,1369.87,43.22,0,0,0,0],
[420,6.1,1282.55,50.39,0,0,0,0],
[421,7.68,1217.05,61.15,0,0,0,0],
[422,8.04,1218.15,71.91,0,0,0,0],
[423,10.71,1200.68,82.67,0,0,0,0],
[424,13.55,1159.2,93.44,0,0,0,0],
[425,17.11,1111.72,107.78,0,0,0,0],
[426,20.88,1057.69,132.87,0,0,0,0],
[427,25.79,949.12,147.21,0,0,0,0],
[428,33.45,879.97,161.55,0,0,0,0],
[429,44.73,696.4,193.81,0,0,0,0],
[430,46.01,606.55,208.15,0,0,0,0],
[431,53.42,505.74,240.41,0,0,0,0],
[432,69.26,435.52,272.66,0,0,0,0],
[433,87.79,381,304.92,0,0,0,0],
[434,102.38,313.41,355.09,3.68,0,0,0],
[435,118.27,271.79,390.92,3.99,0,0,0],
[436,134.3,242.32,459.01,4.28,0,0,0],
[437,152.16,203.1,523.51,4.58,0,0,0],
[438,173.62,185.96,584.42,4.88,0,0,0],
[439,196.75,159.36,677.58,6.06,0,0,0],
[440,220.37,143.04,760,7.24,0,0,0],
[441,248.64,115.7,888.99,8.42,0,0,0],
[442,275.95,94.96,1032.3,9.6,1.83,0,0],
[443,306.96,80.89,1175.62,11.36,2.03,0,0],
[444,337.73,65.77,1315.36,13.13,2.22,0,0],
[445,366.62,56.21,1483.75,14.89,2.42,0,0],
[446,387.7,49.12,1612.74,16.65,2.61,0,0],
[447,426.67,44.25,1662.91,18.42,2.81,0,0],
[448,452.06,39.49,1702.33,20.18,3,0,0],
[449,465.41,34.93,1720.26,24.88,3.29,0,0],
[450,468.96,31.67,1709.52,27.62,3.59,0,0],
[451,471.74,28.38,1688.04,35.44,4.17,0,0],
[452,465.07,16.37,1641.47,39.88,4.75,0,0],
[453,465.07,14.25,1569.83,46.01,5.33,0,0],
[454,442.94,12.15,1491.03,56.56,5.92,0,0],
[455,412.18,9.82,1394.31,68.3,6.5,0,0],
[456,377.57,8.73,1326.25,73.95,7.37,0,0],
[457,339.36,7.64,1186.54,78.85,8.24,0,0],
[458,304.37,6.55,1028.91,90.58,9.02,0,0],
[459,263.81,5.46,921.44,102.31,9.8,0,0],
[460,229.01,5.09,803.23,114.03,10.57,0,0],
[461,200.21,4.73,735.17,124.59,12.02,0,0],
[462,165.31,0,663.53,148.04,13.47,0,0],
[463,147.55,0,613.39,171.49,15.21,0,0],
[464,141.02,0,559.66,183.21,16.96,0,0],
[465,126.67,0,523.84,206.66,18.7,0,0],
[466,114.24,0,488.03,230.11,20.44,0,0],
[467,101.04,0,441.47,264.11,22.47,0,0],
[468,92.21,0,409.23,287.56,24.51,0,0],
[469,83.23,0,380.59,322.73,29.15,0,0],
[470,77.9,0,359.1,346.18,31.47,0,0],
[471,71.04,0,326.87,369.62,33.8,0,0],
[472,64.7,0,294.64,404.8,38.44,0,0],
[473,60.1,0,273.15,428.24,43.66,0,0],
[474,55.63,0,251.67,451.69,46.28,0,0],
[475,51.17,0,230.19,462.25,48.89,0,0],
[476,46.74,0,205.12,485.7,54.11,0,0],
[477,44.14,0,190.8,497.43,59.33,0,0],
[478,43.91,0,176.48,499.52,70.36,0,0],
[479,39.66,0,162.16,500.64,75.58,0,0],
[480,38.15,0,151.42,502.13,81.39,0,0],
[481,38.6,0,126.37,491.59,92.41,0,0],
[482,36.06,0,115.63,479.88,98.22,0,0],
[483,34.75,0,104.89,468.16,109.24,0,0],
[484,35.46,0,94.16,456.45,120.85,0,0],
[485,35.46,0,87,433.01,132.45,0,0],
[486,35.02,0,79.84,410.75,143.48,0,0],
[487,33.72,0,69.11,399.03,160.88,0,0],
[488,34.25,0,61.95,375.6,172.49,0,0],
[489,35.75,0,54.8,352.17,189.32,0,0],
[490,36.53,0,44.07,340.45,200.92,0,0],
[491,37.12,0,40.5,317.01,218.33,0,0],
[492,38.77,0,36.92,293.58,229.93,0,0],
[493,38.12,0,29.78,283.04,243.28,0,0],
[494,40.56,0,26.21,259.6,248.5,0,0],
[495,42.37,0,19.05,247.88,260.11,0,0],
[496,45.03,0,19.06,224.45,265.33,0,0],
[497,48.72,0,19.07,212.74,271.13,0,0],
[498,56.5,0,0,201.02,276.36,0,0],
[499,59.9,0,0,178.76,277.81,0,0],
[500,62.35,0,0,167.05,279.26,0,0],
[501,69.22,0,0,155.33,277.23,0,0],
[502,69.12,0,0,144.79,275.2,0,0],
[503,74.21,0,0,129.56,270.57,0,0],
[504,81.12,0,0,117.85,264.77,0,0],
[505,85.82,0,0,112.58,253.74,0,0],
[506,95.86,0,0,107.31,247.94,0,0],
[507,99.7,0,0,95.6,236.92,0,0],
[508,101.33,0,0,85.06,225.32,0,0],
[509,108.96,0,0,78.91,211.98,0,0],
[510,117.89,0,0,74.52,200.38,0,0],
[511,120.24,0,0,70.13,187.62,0,0],
[512,126.05,0,0,63.99,182.4,0,0.2],
[513,129.02,0,0,57.84,176.6,0,0.52],
[514,140.06,0,0,53.45,165.58,0,0.54],
[515,145.63,0,0,49.07,159.78,0,0.83],
[516,150.91,0,0,44.68,148.76,0,0.87],
[517,151.3,0,0,42.92,142.96,0,0.93],
[518,161.62,0,0,39.41,131.94,0,1.26],
[519,166.13,0,0,33.56,126.72,0,1.58],
[520,171.26,0,0,31.81,120.92,0,1.9],
[521,174.96,0,0,30.05,115.7,0,2.17],
[522,179.38,0,0,28.3,104.68,0,2.27],
[523,182.88,0,0,26.55,98.88,0,2.91],
[524,183.07,0,0,24.19,93.66,0,3.51],
[525,187.73,0,0,21.95,88.44,0,3.83],
[526,192.14,0,0,19.54,83.22,0,4.22],
[527,194.45,0,0,18.08,78,0,5.13],
[528,198.82,0,0,16.62,72.2,0,5.47],
[529,204.19,0,0,15.17,67.56,0,6.14],
[530,206.78,0,0,13.71,64.95,0,7.09],
[531,208.7,0,0,12.25,62.34,0,7.74],
[532,212.26,0,0,10.79,57.12,0,8.7],
[533,211.73,0,0,9.33,51.9,0,9.67],
[534,213.36,0,0,9.04,49.58,0,10.96],
[535,216,0,0,8.76,47.26,0,12.25],
[536,219.5,0,0,8.47,42.62,0,13.53],
[537,221.28,0,0,8.19,40.02,0,15.13],
[538,222.19,0,0,7.9,37.41,0,16.74],
[539,223.92,0,0,6.73,32.77,0,18.95],
[540,224.59,0,0,6.15,30.74,0,20.9],
[541,223.97,0,0,5.42,28.71,0,22.83],
[542,224.83,0,0,4.69,26.68,0,24.76],
[543,225.55,0,0,4.41,24.65,0,26.9],
[544,226.13,0,0,4.13,22.91,0,29.74],
[545,228.14,0,0,3.86,21.17,0,32.42],
[546,228.14,0,0,3.58,19.73,0,35.6],
[547,228.14,0,0,3.27,18.28,0,38.58],
[548,228.14,0,0,3,16.83,0,42.13],
[549,228.48,0,0,2.72,15.38,0,45.74],
[550,229.06,0,0,2.43,14.22,0,49.92],
[551,229.06,0,0,2.15,13.07,0,54.03],
[552,229.06,0,0,1.86,12.29,0,57.67],
[553,229.06,0,0,1.58,11.51,0,62.1],
[554,229.06,0,0,1.3,10.75,0,65.75],
[555,229.06,0,0,1.01,9.59,0,70.85],
[556,229.06,0,0,0.73,8.43,0,75.39],
[557,229.92,0,0,0.44,8.05,0,80.85],
[558,229.82,0,0,0.16,7.66,0,86.02],
[559,228.86,0,0,0,7.28,0,91.16],
[560,227.28,0,0,0,6.7,0,95.97],
[561,227.28,0,0,0,6.12,0,101.77],
[562,227.42,0,0,0,5.54,0,106.62],
[563,228.14,0,0,0,4.97,0,111.74],
[564,227.95,0,0,0,4.39,0,117.64],
[565,226.85,0,0,0,4.1,0,123.29],
[566,225.79,0,0,0,3.81,0,129.65],
[567,225.65,0,0,0,3.52,0,133.92],
[568,223.54,0,0,0,3.24,0,138.5],
[569,222.96,0,0,0,2.96,0,143.6],
[570,222.29,0,0,0,2.81,0,149.33],
[571,220.9,0,0,0,2.66,0,153.74],
[572,220.61,0,0,0,2.5,0,159.1],
[573,221.18,0,0,0,2.34,0,163.74],
[574,220.37,0,0,0,2.09,0,167.41],
[575,219.5,0,0,0,0,0,171.95],
[576,218.54,0,0,0,0,0,176.48],
[577,215.18,0,0,0,0,0,178.79],
[578,215.95,0,0,0,0,0,181.84],
[579,214.99,0,0,0,0,0,186.17],
[580,212.98,0,0,0,0,0,188.48],
[581,210.05,0,0,0,0,0,191.69],
[582,210.48,0,0,0,0,0,194.57],
[583,208.7,0,0,0,0,0,197.13],
[584,206.74,0,0,0,0,0,199.71],
[585,204.05,0,0,0,0,0,201.31],
[586,202.37,0,0,0,0,0,202.59],
[587,201.7,0,0,0,0,0,206.09],
[588,198.1,0,0,0,0,0,207.04],
[589,196.32,0,0,0,0,0,207.96],
[590,194.83,0,0,0,0,0,209.22],
[591,194.3,0,0,0,0,2.3,209.54],
[592,193.82,0,0,0,0,2.49,209.79],
[593,192.62,0,0,0,0,2.67,209.94],
[594,190.9,0,0,0,0,2.86,210.42],
[595,189.07,0,0,0,0,3.05,209.98],
[596,187.25,0,0,0,0,3.79,209.45],
[597,183.84,0,0,0,0,4.52,209.41],
[598,182.74,0,0,0,0,5.26,209.03],
[599,179.57,0,0,0,0,6,208.38],
[600,178.99,0,0,0,0,7.1,207.8],
[601,175.34,0,0,0,0,8.2,207.23],
[602,175.78,0,0,0,0,9.31,205.19],
[603,173.28,0,0,0,0,10.41,204.73],
[604,169.34,0,0,0,0,11.51,203.13],
[605,169.58,0,0,0,0,12.61,201.45],
[606,166.8,0,0,0,0,15.55,198.87],
[607,162.24,0,0,0,0,17.26,196.37],
[608,160.46,0,0,0,0,22.15,195.43],
[609,158.93,0,0,0,0,24.92,195.07],
[610,155.47,0,0,0,0,28.75,192.82],
[611,154.75,0,0,0,0,35.35,189.92],
[612,152.98,0,0,0,0,42.68,187.24],
[613,150.05,0,0,0,0,46.22,185.07],
[614,150.05,0,0,0,0,49.28,182.87],
[615,147.41,0,0,0,0,56.61,180.33],
[616,145.63,0,0,0,0,63.94,178.63],
[617,142.99,0,0,0,0,71.27,176.3],
[618,141.12,0,0,0,0,77.87,173.15],
[619,138.48,0,0,0,0,92.52,170.77],
[620,135.94,0,0,0,0,107.18,167.33],
[621,134.02,0,0,0,0,114.51,165.33],
[622,130.99,0,0,0,0,129.17,162.9],
[623,126.91,0,0,0,0,143.82,159.75],
[624,125.09,0,0,0,0,165.07,156.95],
[625,124.37,0,0,0,0,179.72,154.56],
[626,120.05,0,0,0,0,201.71,151.47],
[627,119.04,0,0,0,0,216.36,149.1],
[628,117.89,0,0,0,0,231.02,146.01],
[629,113.81,0,0,0,0,253,143.83],
[630,111.7,0,0,0,0,267.65,139.5],
[631,110.45,0,0,0,0,282.31,136.98],
[632,109.82,0,0,0,0,288.9,135.3],
[633,106.75,0,0,0,0,303.56,132.38],
[634,103.2,0,0,0,0,310.89,128.88],
[635,104.02,0,0,0,0,312.2,126.34],
[636,102.1,0,0,0,0,312.9,124.7],
[637,97.15,0,0,0,0,313.83,121.49],
[638,97.63,0,0,0,0,307.24,118.15],
[639,94.27,0,0,0,0,299.92,115.69],
[640,92.4,0,0,0,0,292.6,113.09],
[641,89.71,0,0,0,0,285.28,110.88],
[642,87.22,0,0,0,0,270.63,108.07],
[643,85.44,0,0,0,0,256.72,105.5],
[644,84.29,0,0,0,0,249.4,102.69],
[645,84,0,0,0,0,234.75,99.58],
[646,81.46,0,0,0,0,220.1,97.63],
[647,80.11,0,0,0,0,212.78,94.54],
[648,77.42,0,0,0,0,198.13,92.15],
[649,77.38,0,0,0,0,183.49,90.43],
[650,75.55,0,0,0,0,176.9,88.14],
[651,73.78,0,0,0,0,162.25,85.55],
[652,70.85,0,0,0,0,154.93,83.12],
[653,68.02,0,0,0,0,140.28,81.35],
[654,67.3,0,0,0,0,132.96,78.52],
[655,66.67,0,0,0,0,125.64,76.34],
[656,65.76,0,0,0,0,111.73,74.74],
[657,63.89,0,0,0,0,104.41,73.33],
[658,60.72,0,0,0,0,97.08,70.18],
[659,61.2,0,0,0,0,90.49,68.29],
[660,58.9,0,0,0,0,80.98,66.97],
[661,58.32,0,0,0,0,73.66,65.16],
[662,55.1,0,0,0,0,70.36,63.34],
[663,53.86,0,0,0,0,67.07,61.4],
[664,54.14,0,0,0,0,59.75,59.7],
[665,52.61,0,0,0,0,53.16,57.52],
[666,50.93,0,0,0,0,49.32,56.13],
[667,48.77,0,0,0,0,46.58,54.54],
[668,48.14,0,0,0,0,43.83,52.92],
[669,45.55,0,0,0,0,39.99,51.3],
[670,45.35,0,0,0,0,36.15,49.71],
[671,45.51,0,0,0,0,33.41,48.24],
[672,44.23,0,0,0,0,30.67,47.15],
[673,42.86,0,0,0,0,27.93,45.59],
[674,41.25,0,0,0,0,26.82,44.31],
[675,38.91,0,0,0,0,24.63,43.03],
[676,38.1,0,0,0,0,20.97,41.69],
[677,38.74,0,0,0,0,19.88,40.11],
[678,36.41,0,0,0,0,18.78,38.87],
[679,36.87,0,0,0,0,17.69,37.91],
[680,34.72,0,0,0,0,16.59,36.94],
[681,35.01,0,0,0,0,15.12,35.91],
[682,33.03,0,0,0,0,13.72,34.36],
[683,33.14,0,0,0,0,12.21,33.37],
[684,31.33,0,0,0,0,11.3,32.24],
[685,31.27,0,0,0,0,10.39,31.46],
[686,29.64,0,0,0,0,9.48,30.49],
[687,29.4,0,0,0,0,8.57,29.53],
[688,27.95,0,0,0,0,7.65,28.69],
[689,27.53,0,0,0,0,6.74,27.83],
[690,26.26,0,0,0,0,5.83,26.73],
[691,26.41,0,0,0,0,5.65,26.1],
[692,25.12,0,0,0,0,5.47,25.37],
[693,24.59,0,0,0,0,5.3,24.49],
[694,23.74,0,0,0,0,5.12,23.92],
[695,22.74,0,0,0,0,4.94,23.44],
[696,23.17,0,0,0,0,4.21,22.47],
[697,20.84,0,0,0,0,3.84,21.5],
[698,22.35,0,0,0,0,3.39,20.68],
[699,21.24,0,0,0,0,2.93,20.3],
[700,19.1,0,0,0,0,2.76,19.65],
[701,19.83,0,0,0,0,2.58,19.01],
[702,19.48,0,0,0,0,2.41,18.32],
[703,17.7,0,0,0,0,2.24,17.4],
[704,16.8,0,0,0,0,2.04,16.75],
[705,17.61,0,0,0,0,1.87,16.15],
[706,16.63,0,0,0,0,1.7,15.79],
[707,16.94,0,0,0,0,1.52,15.16],
[708,16.05,0,0,0,0,1.34,14.75],
[709,14.83,0,0,0,0,1.16,14.3],
[710,13.76,0,0,0,0,0.99,13.65],
[711,14.13,0,0,0,0,0.81,13.25],
[712,14.23,0,0,0,0,0.63,13.02],
[713,12.92,0,0,0,0,0.45,12.38],
[714,12.9,0,0,0,0,0.28,11.73],
[715,13.45,0,0,0,0,0.1,11.19],
[716,12.79,0,0,0,0,0,10.87],
[717,11.08,0,0,0,0,0,10.64],
[718,10.38,0,0,0,0,0,10.55],
[719,11.16,0,0,0,0,0,10.23],
[720,11.16,0,0,0,0,0,9.91],
[721,10.83,0,0,0,0,0,9.51],
[722,9.24,0,0,0,0,0,8.94],
[723,8.55,0,0,0,0,0,8.62],
[724,8.77,0,0,0,0,0,8.23],
[725,9.42,0,0,0,0,0,7.71],
[726,9.15,0,0,0,0,0,7.71],
[727,8.26,0,0,0,0,0,7.71],
[728,7.68,0,0,0,0,0,7.61],
[729,7.34,0,0,0,0,0,7.06],
[730,7.17,0,0,0,0,0,7.06],
[731,7.68,0,0,0,0,0,7.01],
[732,7.28,0,0,0,0,0,6.59],
[733,6.81,0,0,0,0,0,6.13],
[734,5.92,0,0,0,0,0,5.75],
[735,5.08,0,0,0,0,0,5.75],
[736,5.08,0,0,0,0,0,5.63],
[737,5.15,0,0,0,0,0,5.31],
[738,5.94,0,0,0,0,0,5.1],
[739,5.83,0,0,0,0,0,5.1],
[740,5.08,0,0,0,0,0,5.1],
[741,4.75,0,0,0,0,0,5.1],
[742,3.34,0,0,0,0,0,5],
[743,3.34,0,0,0,0,0,4.68],
[744,3.34,0,0,0,0,0,4.36],
[745,3.59,0,0,0,0,0,4.12],
[746,4.21,0,0,0,0,0,4.12],
[747,4.21,0,0,0,0,0,4.05],
[748,4.21,0,0,0,0,0,3.73],
[749,3.87,0,0,0,0,0,3.47]
];			
			
function pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}



function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

var J42R = {
	defaultLang: 'en',
	cookievalid: 86400000, //1 day (1000*60*60*24)
	text: {},
	extractLang: function(kvl){
		var lang;
		for (var i in kvl) {
			var kv=kvl[i].split('=');
			if (kv[0]==='lang')
				lang=kv[1].length>2
					?kv[1].charAt(0)+kv[1].charAt(1)
					:kv[1];
		}
		return lang;
	},
	getUrlLang: function() {
		if (window.location.search.length<2)
			return undefined;
		return this.extractLang(window.location.search.substring(1).split('&'));
	},
	getCookieLang: function() {
		return this.extractLang(document.cookie.split('; '));
	},
	getLang: function() {
		if (typeof this.lang!=='string') {
			if (typeof (this.lang=this.getUrlLang())==='string');
			else if (typeof (this.lang=this.getCookieLang())==='string');
			else if (typeof (this.lang=navigator.language)==='string');
			else if (typeof (this.lang=navigator.userLanguage)==='string');
			else this.lang=this.defaultLang;
			if (this.lang.length>2)
				this.lang=this.lang.charAt(0)+this.lang.charAt(1);
		}
		return this.lang;
	},
	setLang: function(lang,cook) {
		this.lang = lang;
		if (cook) {
			var wl = window.location,
				now = new Date(),
				time = now.getTime();
			time += this.cookievalid;
			now.setTime(time);
			document.cookie = 'lang='+lang+';path='+wl.pathname+';domain='+wl.host+';expires='+now.toGMTString();
		}
		return this;
	},
	load: function() {
		var self=this,lang=this.getLang();

		$.ajax({ url:'I18N_'+lang+'.json',
		type:"GET",
	    dataType:"json",
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
			self.put(lang,data).t();
		},
		error:function(xhr,type){
	        self.put(lang,{}).t();
	    }
	});	

		return this;
	},
	put: function(lang,data) {
		if (typeof lang==='string'&&typeof data==='object') {
			var obj={};
			obj[lang]=data;
		} else
			obj=lang;			
		this.text=$.extend(true,this.text,obj);
		return this;
	},
	get: function(key) {
		var keys=key.split('.'),
			lang=this.getLang(),
			obj=this.text[lang];
		while (typeof obj!=='undefined' && keys.length>0)
			obj=obj[keys.shift()];
		return typeof obj==='undefined' ? key : obj;
	},
		
	t1: function(item) {
		if (typeof item==='object' && item instanceof Element) {
			var it = $(item),
				key = it.attr('i18n');
			it.removeClass('I18N');
			if (typeof key==='undefined' || key == null)
				key = it.text();
			it.attr('i18n',key).text(this.get(key));

		}
		return this;
	},
	
	
	t: function(item) {
		if (typeof this.text[this.getLang()]==='undefined') {
			this.load();
			return this;
		}
		
		if (typeof item === 'undefined') {			
			item = $("[I18N]");			
			var x = $('.I18N');

			$('.I18N').each(function(x){				
			  //if (!$.contains(item,this))			  			  
			   if (!contains(item,this))
					item = item.add(this);				
			});					
		}

		if ($.zepto.isZ(item))
			for (var i in item)
				this.t1(item[i]);
		else
			this.t1(item);
		return this;
	}
};


function isRealValue(obj){
   return obj && obj !== "null" && obj!== "undefined";
}

$('a#menuLink').click(function(e) {
 $('#layout').toggleClass('active');
 $('#menu').toggleClass('active');
 $('a#menuLink').toggleClass('active');
 e.preventDefault();
});

var lastmenu = 'home';

$('div#menu a.pure-menu-link').click(function(event) {
    var curmenu = this.id;
    //hide menu  
    if ($('a#menuLink').hasClass('active')) {
	     $('#layout').toggleClass('active');
	     $('#menu').toggleClass('active');
         $('a#menuLink').toggleClass('active');
	}    
     
	$(".pure-menu-item").removeClass("pure-menu-selected");
	$('a#'+curmenu).parent(".pure-menu-item").addClass("pure-menu-selected");
	if (lastmenu !== 'null')  {
		$('div#'+lastmenu).toggle();
	} 
	$('div#'+curmenu).toggle();
	lastmenu = curmenu;	
	
	//special menu
	if (lastmenu == 'wifi') {if (isRealValue(timersken)) window.clearTimeout(timersken);};
	if (lastmenu == 'home') if (isRealValue(timertime)) window.clearTimeout(timertime);
	
	if (curmenu == 'wifi') {
		getWifiInfo();
		showCurrentTime();
		
	};
	
	if (curmenu == 'home') {
		display_ct();	
  	    g0.resize();
	}
	
	if (curmenu == 'ledsetup') {
	   g1.resize();
	   setProfileList();
	}
});

function minToTime( min) {
	tmStr = pad('00',Math.floor(min/4),true)+":"+ pad('00',(min%4)*15,true);
	return tmStr;
}


$("#g1").mousemove(function( event ) {
	var x = event.pageX - $('#g1').offset().left;
	var y = event.pageY - $('#g1').offset().top;
    px = Math.round(g1.toDataXCoord(x)); if (px < 0) px = 0;
    py = Math.round(g1.toDataYCoord(y)); if (py < 0) py = 0; if (py > 100) py = 100; 
    $("#cursor").text("Time: " + minToTime(px) + "  Value: " + py);
    $("#cursor").css('left', event.pageX + 10).css('top', event.pageY + 10).css('display', 'block');

});

	
$("#g1").click(function( event ) {   
	  clicks++;
	  if (clicks == 1) {
      setTimeout(function(){
      	if(clicks == 1) {
        	g1ClickHandler(event, true);
	    }
    	clicks = 0;
        }, 250);
     }
});


function g1ClickHandler(event, a) {
	var x = event.pageX - $('#g1').offset().left;
	var y = event.pageY - $('#g1').offset().top;
	px = Math.round(g1.toDataXCoord(x)); if (px < 0) px = 0;
	py = Math.round(g1.toDataYCoord(y)); if (py < 0) py = 0; if (py > 100) py = 100;
	
	var m = Number($("#ledsetup-filter-module").val());
	var ch = Number($("#ledsetup-filter-ledchan").val());
	
    clicktimer = null;
	addPoint(m, ch, px, py, a);  

	valTable();
  	reG1();   
 };

$("#g1").dblclick(function(){ 
	g1ClickHandler(event, false);
});

var tapped=false
$("#g1").on("touchstart",function(e){
    if(!tapped){ //if tap is not set, set up single tap
      tapped=setTimeout(function(){
          tapped=null
          g1ClickHandler(event, true);
      },300);   //wait 300ms then run single click code
    } else {    //tapped within 300ms of last tap. double tap
      clearTimeout(tapped); //stop single tap callback
      tapped=null
      g1ClickHandler(event, false);
    }
    e.preventDefault()
});


function getCh() {
	$.ajax({ url:'ch/ch.cgi',
		type:"GET",
	    dataType:"json",
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
				ch(data);
		},
		error:function(xhr,type){
	    }
	});	
}

function ch(data) {
	chv = [];
	for (var i in data.ch) { 
		chv.push(data.ch[i]);
	}
	//hmf();
	g0.updateOptions( { 'file': reChannels() } );
}

function reChannels() {
	var ich = [];
	var ch = [];
	
	for (x = 1; x < 8; x++) {
		ch.push(($("div.slider input[type=range]#vch"+x).val())/100);
	}
	
	for (i = 0; i< channels.length; i++) {
		x = 0;
		for (j = 1; j < 8; j++) {
			x += (channels[i][j] * ch[j-1]);			
		}
		ich.push([i+360,x]);
	};
	return ich;
}

function findIn2dArray(arr_2d, val){
    var indexArr = $.map(arr_2d, function(arr, i) {
            if($.inArray(val, arr) != -1) {
                return 1;
            }

            return -1;
    });

    return indexArr.indexOf(1);
}

/*
function setWiFiSSID(a) {
	$("#input-ssid").attr("placeholder","");
    $("#input-ssid").val(a);
}
*/
$("#aps").on( 'click', 'div', function(e) {
	e.preventDefault();
	$("#input-ssid").attr("placeholder","").val($(this).find('label').text());

});

function createInputForAp(ap) {
	  if (ap.essid=="" && ap.rssi==0) return;

	  //var input = $("<input>", { type:"radio", name:"ssid", value:ap.essid, id:"opt-" + ap.essid});
	  //if (currAp == ap.essid) input.checked = "1";
	  var rssiVal = -Math.floor(ap.rssi/37)*32;
	  var bars    = $("<span>",{class:"lock-icon", css:{backgroundPosition:"0px "+rssiVal+"px;"} });	  

      var rssi    = $("<span>",{text: " " + ap.rssi +" dB "});	  
      
	  var encVal  = "-64"; //assume wpa/wpa2
	  if (ap.enc == "0") encVal = "0"; //open
	  if (ap.enc == "5") encVal = "-32"; //wep
  	  var encrypt = $("<span>",{class:"lock-icon",css:{backgroundPosition:"-32px "+encVal+"px;"}});
	
	  //var label =  $("<label>", {for:"opt-" + ap.essid});
	  var label =  $("<label>", {style:"cursor: pointer; text-decoration: underline;"});
	  //onclick:"setWiFiSSID('"+ap.essid+"');return false;", 
	  var div = $("<div>", {style:"cursor: pointer;"});

	  label.text(ap.essid);		  
	  div.append(label);		   
	  div.append(bars);	 
	  div.append(rssi);
	  div.append(encrypt);

  
  
	  //div.append(input);
	  
	  return div;
	}

function getSelectedEssid() {
	var e=document.forms.wifiform.elements;
	for (var i=0; i<e.length; i++) {
		if (e[i].type=="radio" && e[i].checked) return e[i].value;
	}
	return currAp;
}

function scanAPs() {
	$("#apscan").show();
	$.getJSON("wifiscan.cgi", function(data, status, xhr) {		
		//$(".aps").remove();		
		currAp = getSelectedEssid();
		if (data.result.inProgress == "0" && data.result.APs.length>1) {
			$("#aps").html("");
			$("#apscan").hide();
			for (var i=0; i<data.result.APs.length; i++) {
				if (data.result.APs[i].essid=="" && data.result.APs[i].rssi==0) continue;
				$("#aps").append(createInputForAp(data.result.APs[i]));
			}
			timersken = window.setTimeout(scanAPs, 60000);
		} else {
			timersken = window.setTimeout(scanAPs, 5000);
		}
	});
}

function getWifiInfo() {
	$.ajax({ url:'wifistatus.cgi',
		type:"GET",
	    dataType:"json",
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
				showWifiInfo(data);
		},
		error:function(xhr,type){
	    }
	});	
}

function showWifiInfo(data) {
	  Object.keys(data).forEach(function(v) {
	    $("#wifi-" + v).text(J42R.get(data[v]));;
	  });	 
	  $("#wifi-spinner").hide();
	  $("#wifi-table").show();
	  currAp = data.ssid;
	  if (data['mode'] == 'STA') {
	  	  if ($("#apmode .Switch").hasClass("Off")) {  	  	      	
		  	  $('#apmode .Switch').toggleClass('Off').toggleClass('On');
		  	  var text = J42R.get('wifi.assoc') + ' ' + currAp;
		  	  $('#wifi-assoc').text(text);		  	  		  	  
	  	  }
	  	  $("#setapip").hide();
  		  $(".setwifi").show();
		  //run scan
		  scanAPs();			  	  	  	    		  		  
	   } else {
	      $("#wifi-ap-ip").attr("placeholder","").val(data['apIp']);
	   }
	   
}

function populateSelectBox() {
	   pSelectBox('#dstStartDay',daysArr);
	   pSelectBox('#dstEndDay', daysArr);
	   pSelectBox('#mm',monthsArr);
	   pSelectBox('#dstStartMonth',monthsArr);
	   pSelectBox('#dstEndMonth',monthsArr);
	   pSelectBox('#dstStartWeek',weeksArr);
	   pSelectBox('#dstEndWeek',weeksArr);
	   pSelectBox('#dateFormat',dateFormat);
	   pSelectBox('#timeFormat',timeFormat);
}

$("select[name='lang']").on("change", function () {
   J42R.setLang(this.value,true).t();
   populateSelectBox();
   });


function rainbowPlotter(e) {
        var ctx = e.drawingContext;
        var points = e.points;

        var y_bottom = e.dygraph.toDomYCoord(0);
  /*
     	for (var i = 0; i < points.length; i++) {
          var p = points[i];
          var center_x = p.canvasx;

		  ctx.strokeStyle=clrs[(p.xval)-360];
          ctx.strokeRect(center_x, p.canvasy,
              1, y_bottom - p.canvasy);
        }
 */       
        ctx.beginPath();		
        ctx.moveTo(points[0].canvasx, points[0].canvasy); 
        ctx.closePath(); 
        var center_x = 0; var center_y = 0;
        var center_x_prev = points[0].canvasx; var center_y_prev =  points[0].canvasy;
     	for (var i = 0; i < points.length; i++) {
          var p = points[i];
          var center_x = p.canvasx; 
          var center_y = p.canvasy;
            
          ctx.beginPath();             
          ctx.lineTo(center_x,p.canvasy);
          ctx.lineTo(center_x,y_bottom);             
		  ctx.lineTo(center_x_prev,y_bottom);
		  ctx.lineTo(center_x_prev,center_y_prev);
		  center_x_prev = center_x; center_y_prev=center_y;
		  ctx.closePath();		    		  
		  ctx.strokeStyle=clrs[(p.xval)-360];
		  ctx.stroke();		  
		  ctx.fillStyle=clrs[(p.xval)-360];
		  ctx.fill();
        }        
}

$("div.slider input[type=range]").change(function( event ) {    
	  $('div.slider input[type=number]#'+this.id).val(this.value); 
	  g0.updateOptions( { 'file': reChannels() } );
	});

$("div.slider input[type=number]").change(function( event ) {
	  $('div.slider input[type=range]#'+this.id).val(this.value);  
	  g0.updateOptions( { 'file': reChannels() } );
	});

function reG1() {
  	  var mF = Number($("#ledsetup-filter-module").val());	  
	   if (mF != 0) {
    	   g1.updateOptions( { 'file': dtmo[mF-1], title: J42R.get('led.module.' + mF) } );	
       } else {
       	   g1.updateOptions( { 'file': dtmo[0],  title: J42R.get('led.module-all') } );	
       }   
}

$("#ledsetup-filter-module").change(function( event ) {
  	  valTable();
  	  reG1();	  
	});

$("#ledsetup-filter-ledchan").change(function( event ) {
	  valTable();  	  
	});
    
    
function valTable() {    
    //nastaveni filtru
    var mF = Number($("#ledsetup-filter-module").val());
    var chF = Number($("#ledsetup-filter-ledchan").val());
    var mS = 0;
    var mE = dtmo.length; 
    chS = 1;
    chE = 8;
    if (mF != 0) {
    	mS = mF-1;
    	mE = mF;	
    } 
    
    if (chF != 0) {
    	chS = chF;
    	chE = chF+1;
    }
    
	$('#chvals > tbody > tr').not($('#chvals > tbody > tr').eq(0)).remove();
	for (i=mS; i<mE;i++) {	   
	   for (x=1;x<dtmo[i].length-1;x++) {		 
		 for(y=chS;y<chE;y++) {
		   if (dtmo[i][x][y] !== null) {
			var div = $("<tr>");
			var modul = $("<td>",{text:""+(i+1)});
			modul.attr("data-label","Modul");
			var kanal = $("<td>",{text:""+y});
			kanal.attr("data-label","Channel");
			var cas = $("<td>",{text:""+dtmo[i][x][0]});
			cas.attr("data-label","Time");
			var intenzita = $("<td>",{text:""+dtmo[i][x][y]});	    
			intenzita.attr("data-label","Value");
			var efekt = $("<td>");
			efekt.attr("data-label","efect");
			var btn=$("<td>");
			var delled = $("<button>",{text:"-"});
			delled[0].addEventListener ("click", function() {
			  div.remove();
			  return(false);
			});
	
			btn.append(delled);		 	    
			div.append(modul);
			div.append(kanal);
			div.append(cas);
			div.append(intenzita);
			div.append(efekt);
			div.append(btn); 
			$('#chvals tr').last().after(div);
		   }
		 }
	   } 
	}
}

function saveInfo(data, sel) {
	var title;
	var opt;
	dtmo = [];
	modulesCount = 0;
	$('ul#ml').empty();
	if (manual == true) {
		title = 'led.all' ;
		opt = '<li id="mo-1" class="pure-menu-item'+(sel==-1?' pure-menu-selected':'')+ '"><a href="#" val="-1" class="pure-menu-link">'+J42R.get(title)+'</a></li>';
		$('ul#ml').append(opt);	
		
	}
	for (var key in data.timeSlotValues) {  
		var a = data.timeSlotValues[key];
		//var id = a.id;
		opt = '<li id="mo"'+a.id+'" class="pure-menu-item'+(a.id==sel?' pure-menu-selected':'')+ '"><a href="#" val="'+a.id+'" class="pure-menu-link">'+a.name+'</a></li>';
		//var opt=$("<option>",{value:""+key,text:a.name});
		$('ul#ml').append(opt);	
				
		if (a.id == sel) {
			var idx = 0;
			var b = data.timeSlotValues[key].ch;
			title = a.name ;//'led.m' + a.id;
			
			for (var t in b) {
				idx++;
				var v = b[t];
				var i = "#vch"+idx;
				$('input#vch'+idx).val(v.v);
			}	
		}
	}

	//$("select[name='module']").val(sel);
	
	g0.updateOptions( { 'file': reChannels(), 'title': J42R.get(title) } );
	
/*		
		dtmo.push(		
				[[0,0,0,0,0,0,0,0],
				[96,0,0,0,0,0,0,0]]);
		modulesCount++;
	}
	g1.updateOptions( { 'file': dtmo[0]} );
*/	
}


function getInfo() {
	$.ajax({ url:'getinfo.cgi',
		type:"GET",
	    dataType:"json",
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
				if (!manual) timersled = window.setTimeout(getInfo, 30000);
				saveInfo(data, selModule);				
		},
		error:function(xhr,type){
			console.log(xhr);
	    }
	});	
}

function getConfig() {
	$.ajax({ url:'getconfig.cgi',
		type:"GET",
	    dataType:"json",
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
			config = data;
			console.log(data);
			showConfigData();
		},
		error:function(xhr,type){
			console.log(xhr);
	    }
	});	
}

$("#addled").click(function( event ) {
        var modul = $('form#ledform select#ledmodul').val();
        var kanal = $('form#ledform select#ledchan').val();
        var time = $('form#ledform select#ledtime').val();
        var intenzita = $('form#ledform input#ledval').val();        
        
        //prepocet pole a zobrazeni bodu
        addPoint(modul, kanal, time,intenzita,true);   
	    valTable();	
	   	reG1();    
	    return(false);
});

function updLedCh(m, t, ch, v, d) {

	var idx = findIn2dArray(dtmo[m],t);
	if (d) {
		if (idx >= 0) {
			//update
			dtmo[m][idx][ch] = v;
		} else {
			//add
			dtmo[m].push([t,ch==1?v:null,ch==2?v:null,ch==3?v:null,ch==4?v:null,ch==5?v:null,ch==6?v:null,ch==7?v:null]); 								                	
		}
	} else {
		//delete
		if ((idx >= 0) && (idx != 0) && (idx != 95)) {
			var suma = 0;
			for (i = 1; i < 8; i++) {
		   		suma = suma + dtmo[m][idx][i]; 
			}
		
			if (suma > dtmo[m][idx][ch]) {
				dtmo[m][idx][ch] = null;
			} else {
				dtmo[m].splice(idx,1);	
			}
		}
	}
	dtmo[m].sort();
}

function addPoint(m, ch, t, v, a) {
	mo = Number(m);
	cha = Number(ch);
	time = Number(t)
	value= Number(v);	
	if (mo > 0) {
		if (cha > 0) {
			updLedCh(mo-1, time, cha, value, a);
		} else {
			for (i=1;i<8;i++) {
				updLedCh(mo-1, time, i, value, a);
			}
		}
	} else {	    		    	    
   		for (var i = 0; i < modulesCount; i++) {
			if (cha>0) {
				updLedCh(i, time, cha, value, a);
			} else {
				for (var x=1;x<8;x++) {
					updLedCh(i, time, x, value, a);
				}
			}				
		}		    	    					
	};
}

$('#autoOnOff .Switch').click(function() {
	$(this).toggleClass('On').toggleClass('Off');
	
	if ($("#autoOnOff .Switch").hasClass("On")) {
		$("div.slider input").prop('disabled',false);
		//pridame option all modules
		manual = true;
		$('#chv-submit').show();
		//stop timer reload
		if (isRealValue(timersled)) window.clearTimeout(timersled);
		selModule = -1;
		getInfo();
		g0.updateOptions( { 'file': reChannels() } );					
	} else {
		manual = false;
		selModule = 0;
		getInfo();
		$('#chv-submit').hide();
		//start timer reload		
		//if (isRealValue(timersled)) window.clearTimeout(timersled);
		$("div.slider input").prop('disabled',true);
		g0.updateOptions( { 'file': reChannels() } );		
	}	
});

$('#dhcpOnOff .Switch').click(function() {
	$('#dhcpOnOff .Switch').toggleClass('On').toggleClass('Off');
	if ($("#dhcpOnOff .Switch").hasClass("On")) {
		$("#setip").hide();
		$("#input-dhcponoff").val('1');
	} else {
		$("#setip").show();
		$("#input-dhcponoff").val('0');
	}		
});

$('#apExt .Switch').click(function() {
	$('#apExt .Switch').toggleClass('On').toggleClass('Off');
	if ($("#apExt .Switch").hasClass("On")) {
		$("#ap-ext").show();
	} else {
		$("#ap-ext").hide();
	}		
});

$('#apmode .Switch').click(function() {
	$('#apmode .Switch').toggleClass('On').toggleClass('Off');
	if ($("#apmode .Switch").hasClass("On")) {
		$(".setwifi").show();
		$("#setapip").hide();
		$("#input-apmode").val('1');	
		//run scan
		scanAPs();		
	} else {
		$(".setwifi").hide();
		$("#setip").hide();
		$("#setapip").show();
		if ($("#dhcpOnOff .Switch").hasClass("Off")) {
		   $('#dhcpOnOff .Switch').toggleClass('Off').toggleClass('On');
		}
		$("#input-apmode").val('2');	
		//stop scan
		 window.clearTimeout(timersken);
	}		
});

$('#wifiform').on('submit', function(e) { 
		e.preventDefault();
		//alert('test');
          //prevent form from submitting
       var data = $("#wifiform").serialize();		
		$.ajax({
            type: 'GET',
            url: 'wificonnect.cgi',
            data: data,
            success: function (data) {
                //TODO: show spin
                setTimeout(function () {
			       window.location.href = "/";
			    }, 15000);                
            }
         });       
    });

function display_ct() {	
	//todo: revize?
	$.ajax({
            type: 'GET',
            url: 'gettime.cgi',
            dataType:"json",
  	        contentType:"application/json; charset=utf-8",
		     success:function(data) {
		    	unixtime = data.utc;
		    	unixtimestamp = data.utc;
  		        show_ct();  		        
 			},
			error:function(xhr,type){
			  console.log(xhr);
	    	}
    }); 	
}

function show_ct() {	
	//var format = J42R.get('time.format')
	//TODO: format veymeme z konfigu
	//pokud neni, pak default
	var format = dateFormat[0] + " " + timeFormat[0];
	var x = new Date( unixtime * 1000) ;
	var m = x.getMonth() + 1;
	var mm = pad('00',m,true);
	var dd = pad('00',x.getDate(),true);
	var yyyy = x.getFullYear();
    var yy = yyyy - 2000;
    var mi = pad('00',x.getMinutes(),true);
    var hh24 = pad('00',x.getHours(),true);
    var hh  = pad('00',x.getHours() == 12?12:x.getHours() % 12,true);
    var ss  = pad('00',x.getSeconds(),true);
	var res = format.replace('YYYY',yyyy);
	var period = x.getHours() < 12?"am":"pm";
	res=res.replace('YY',yy);
	res=res.replace('DD',dd);
    res=res.replace('MM',mm);
    res=res.replace('MO',J42R.get('month.'+m));
    res=res.replace('HH24',hh24);    
    res=res.replace('HH',hh);    
    res=res.replace('MI',mi);    
    res=res.replace('SS',ss);
    res=res.replace('P',period);
	$("#showtime").text(res);
	if (unixtime++ == (unixtimestamp+60)) {
		if (isRealValue(timertime)) window.clearTimeout(timertime);
	    timertime=window.setTimeout('display_ct()',1000);
	} else {
		timertime=window.setTimeout('show_ct()',1000);
	}
}

$( document ).ready(function() {
	
	getConfig();
	
	J42R.t();

	$('select#lang').val(J42R.getLang());
	
	g0 = new Dygraph(document.getElementById("g0"),
					reChannels(),
					 {	 height:300,
  					 	 title: J42R.get('led.module.1'),
						 valueRange:[0,2400],
						 legend: 'never',				 
						 animatedZooms: false,
						 xlabel: "nm",
						 ylabel:  "power",
						 strokeWidth: 2,			 
						 plotter: rainbowPlotter     
					 });
			 
	$('div.slider input[type=range]').each(function(x, item){
	  $('div.slider input[type=number]#'+this.id).val(this.value);
	});
     
     
   g1 = new Dygraph(document.getElementById("g1"),
		dtmo[0],
		 {	 height:300,
			 title: J42R.get('led.module-all'),
			 labels:["Time","CH 1","CH 2","CH 3","CH 4","CH 5","CH 6","CH 7"],
			 valueRange:[0,110] ,
			 legend: 'never',
			 labelsDiv: 'lbls',    				 
			 animatedZooms: false,
			 xlabel: "Time",
			 ylabel:  "Brightness",
			 includeZero: true,
			 connectSeparatedPoints:true,
			 drawPoints: true,
			 pointSize: 5,
			 interactionModel:{},
			 axes: {
			  x: {
				axisLabelFormatter: function(x) {
				  return minToTime(x);
				},
				pixelsPerLabel:35,
				valueFormatter: function (y) {
					return "Time: "+minToTime(y);
				}
			  },
			  y: {
				axisLabelFormatter: function(y) {
				  return ''+y+'%';
				},
				 pixelsPerLabel:20,
				valueFormatter: function (y) {
					return ""+ y + "%";
				}                         
			  }
			}                     
		 });
		 

   getInfo();   
   populateSelectBox();     
   
   //je/li volano s parametrem stranky prepni
   if (QueryString.page == 'wifi') {
    	lastmenu = 'home';
    	curmenu  = 'wifi';
    	$(".pure-menu-item").removeClass("pure-menu-selected");
    	$('a#'+curmenu).parent(".pure-menu-item").addClass("pure-menu-selected");
    	if (lastmenu !== 'null')  {
    		$('div#'+lastmenu).toggle();
    	} 
    	$('div#'+curmenu).toggle();
    	lastmenu = curmenu;		
    	if (isRealValue(timersken)) window.clearTimeout(timersken);
    	getWifiInfo();
   };
    //nacteme cas z cipu a zobrazujeme
    timertime = window.setTimeout('display_ct()',1000);   
});

$('ul#ml').on('click', 'a', function(e){  
	if (!$(this).parent().hasClass('pure-menu-disabled')) {    		
    	selModule = $(this).attr('val');	    	
    	getInfo();
    	//hmf();
    	g0.updateOptions( { 'file': reChannels(), title: J42R.get('led.module.'+ selModule) } );    	
	}    	
	return false;    	
});

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();

//goto

  

$('#ntpOnOff .Switch').click(function() {
	$('#ntpOnOff .Switch').toggleClass('On').toggleClass('Off');
	if ($("#ntpOnOff .Switch").hasClass("On")) {
		$("#time-set").hide();
		$("#time-setntp").show();
	} else {
		$("#time-setntp").hide();
		$("#time-set").show();
	}		
});

function showCurrentTime() {
  	var d=new Date();
  	$("#dd").attr("placeholder","").val(d.getDate());
  	$("#mm").attr("placeholder","").val(d.getMonth());
  	$("#yy").attr("placeholder","").val(d.getFullYear()-2000);  
  	$("#hh").attr("placeholder","").val(d.getHours());
  	$("#mi").attr("placeholder","").val(d.getMinutes());  	
    //console.log(jstz.determine().name());
  	//$('#dd').val(d.getDate());
}

function pSelectBox(x, arr) {
	var i = 1;
	$(x).empty();
	$(x).append($('<option>').text("Select"));
	arr.forEach(function(entry) {
		$(x).append($('<option>').text(J42R.get(entry)).attr('value', i));
		i++;	    
	});
}
 	
 	
function setProfileList() {
	$.ajax({ url:'getTimeSlotProfiles.cgi',
		type:"GET",
	    dataType:"json",
	    contentType:"application/json; charset=utf-8",
		success:function(data) {
			$('#profileList').empty();
            $('#profileList').append($('<option>').text("Select"));
			$.each(data['arr'],function(k, v) {
			    var f = v.filename.substr(1).slice(0, -4);
			    $('#profileList').append($('<option>').text(f).attr('value', f));
			});						
		},
		error:function(xhr,type){
			  console.log(xhr);
	    }
	});	

}

$('#setProfile').on('submit', function(e) { 
		e.preventDefault();
        var d = $("#setProfile").serialize();		
		$.ajax({
            type: 'GET',
            url: 'setProfile.cgi',
            dataType:"json",
  	        contentType:"application/json; charset=utf-8",
		     success:function(data) {
  		        console.log(data);
 			},
			error:function(xhr,type){
			  console.log(xhr);
	    	}
         });       
});

$('#profileList').change(function() {
  var d = $("#setProfile").serialize();
	$.ajax({
		type: 'POST',
		url: 'getProfile.cgi',
		data: data,
		dataType:"json",
		contentType:"application/json; charset=utf-8",
		 success:function(data) {
			console.log(data);
		},
		error:function(xhr,type){
		  console.log(xhr);
		}
	 });  
  
});

//TODO: naplnit prislusne hodnoty z configu do pole
function showConfigData() {
	$('#ledprofile').text(config.profileFileName);
}