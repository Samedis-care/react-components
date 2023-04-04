/*! For license information please see 2138.494008cc.iframe.bundle.js.LICENSE.txt */
(self.webpackChunkcomponents_care=self.webpackChunkcomponents_care||[]).push([[2138],{"./node_modules/moment/locale/hu.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(moment){"use strict";var weekEndings="vasárnap hétfőn kedden szerdán csütörtökön pénteken szombaton".split(" ");function translate(number,withoutSuffix,key,isFuture){var num=number;switch(key){case"s":return isFuture||withoutSuffix?"néhány másodperc":"néhány másodperce";case"ss":return num+(isFuture||withoutSuffix)?" másodperc":" másodperce";case"m":return"egy"+(isFuture||withoutSuffix?" perc":" perce");case"mm":return num+(isFuture||withoutSuffix?" perc":" perce");case"h":return"egy"+(isFuture||withoutSuffix?" óra":" órája");case"hh":return num+(isFuture||withoutSuffix?" óra":" órája");case"d":return"egy"+(isFuture||withoutSuffix?" nap":" napja");case"dd":return num+(isFuture||withoutSuffix?" nap":" napja");case"M":return"egy"+(isFuture||withoutSuffix?" hónap":" hónapja");case"MM":return num+(isFuture||withoutSuffix?" hónap":" hónapja");case"y":return"egy"+(isFuture||withoutSuffix?" év":" éve");case"yy":return num+(isFuture||withoutSuffix?" év":" éve")}return""}function week(isFuture){return(isFuture?"":"[múlt] ")+"["+weekEndings[this.day()]+"] LT[-kor]"}moment.defineLocale("hu",{months:"január_február_március_április_május_június_július_augusztus_szeptember_október_november_december".split("_"),monthsShort:"jan._feb._márc._ápr._máj._jún._júl._aug._szept._okt._nov._dec.".split("_"),monthsParseExact:!0,weekdays:"vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat".split("_"),weekdaysShort:"vas_hét_kedd_sze_csüt_pén_szo".split("_"),weekdaysMin:"v_h_k_sze_cs_p_szo".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"YYYY.MM.DD.",LL:"YYYY. MMMM D.",LLL:"YYYY. MMMM D. H:mm",LLLL:"YYYY. MMMM D., dddd H:mm"},meridiemParse:/de|du/i,isPM:function(input){return"u"===input.charAt(1).toLowerCase()},meridiem:function(hours,minutes,isLower){return hours<12?!0===isLower?"de":"DE":!0===isLower?"du":"DU"},calendar:{sameDay:"[ma] LT[-kor]",nextDay:"[holnap] LT[-kor]",nextWeek:function(){return week.call(this,!0)},lastDay:"[tegnap] LT[-kor]",lastWeek:function(){return week.call(this,!1)},sameElse:"L"},relativeTime:{future:"%s múlva",past:"%s",s:translate,ss:translate,m:translate,mm:translate,h:translate,hh:translate,d:translate,dd:translate,M:translate,MM:translate,y:translate,yy:translate},dayOfMonthOrdinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}})}(__webpack_require__("./node_modules/moment/moment.js"))}}]);