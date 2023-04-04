/*! For license information please see 3168.41623913.iframe.bundle.js.LICENSE.txt */
(self.webpackChunkcomponents_care=self.webpackChunkcomponents_care||[]).push([[3168],{"./node_modules/moment/locale/gom-latn.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(moment){"use strict";function processRelativeTime(number,withoutSuffix,key,isFuture){var format={s:["thoddea sekondamni","thodde sekond"],ss:[number+" sekondamni",number+" sekond"],m:["eka mintan","ek minut"],mm:[number+" mintamni",number+" mintam"],h:["eka voran","ek vor"],hh:[number+" voramni",number+" voram"],d:["eka disan","ek dis"],dd:[number+" disamni",number+" dis"],M:["eka mhoinean","ek mhoino"],MM:[number+" mhoineamni",number+" mhoine"],y:["eka vorsan","ek voros"],yy:[number+" vorsamni",number+" vorsam"]};return isFuture?format[key][0]:format[key][1]}moment.defineLocale("gom-latn",{months:{standalone:"Janer_Febrer_Mars_Abril_Mai_Jun_Julai_Agost_Setembr_Otubr_Novembr_Dezembr".split("_"),format:"Janerachea_Febrerachea_Marsachea_Abrilachea_Maiachea_Junachea_Julaiachea_Agostachea_Setembrachea_Otubrachea_Novembrachea_Dezembrachea".split("_"),isFormat:/MMMM(\s)+D[oD]?/},monthsShort:"Jan._Feb._Mars_Abr._Mai_Jun_Jul._Ago._Set._Otu._Nov._Dez.".split("_"),monthsParseExact:!0,weekdays:"Aitar_Somar_Mongllar_Budhvar_Birestar_Sukrar_Son'var".split("_"),weekdaysShort:"Ait._Som._Mon._Bud._Bre._Suk._Son.".split("_"),weekdaysMin:"Ai_Sm_Mo_Bu_Br_Su_Sn".split("_"),weekdaysParseExact:!0,longDateFormat:{LT:"A h:mm [vazta]",LTS:"A h:mm:ss [vazta]",L:"DD-MM-YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY A h:mm [vazta]",LLLL:"dddd, MMMM Do, YYYY, A h:mm [vazta]",llll:"ddd, D MMM YYYY, A h:mm [vazta]"},calendar:{sameDay:"[Aiz] LT",nextDay:"[Faleam] LT",nextWeek:"[Fuddlo] dddd[,] LT",lastDay:"[Kal] LT",lastWeek:"[Fattlo] dddd[,] LT",sameElse:"L"},relativeTime:{future:"%s",past:"%s adim",s:processRelativeTime,ss:processRelativeTime,m:processRelativeTime,mm:processRelativeTime,h:processRelativeTime,hh:processRelativeTime,d:processRelativeTime,dd:processRelativeTime,M:processRelativeTime,MM:processRelativeTime,y:processRelativeTime,yy:processRelativeTime},dayOfMonthOrdinalParse:/\d{1,2}(er)/,ordinal:function(number,period){return"D"===period?number+"er":number},week:{dow:0,doy:3},meridiemParse:/rati|sokallim|donparam|sanje/,meridiemHour:function(hour,meridiem){return 12===hour&&(hour=0),"rati"===meridiem?hour<4?hour:hour+12:"sokallim"===meridiem?hour:"donparam"===meridiem?hour>12?hour:hour+12:"sanje"===meridiem?hour+12:void 0},meridiem:function(hour,minute,isLower){return hour<4?"rati":hour<12?"sokallim":hour<16?"donparam":hour<20?"sanje":"rati"}})}(__webpack_require__("./node_modules/moment/moment.js"))}}]);