/*! For license information please see 5044.b001a3dc.iframe.bundle.js.LICENSE.txt */
(self.webpackChunkcomponents_care=self.webpackChunkcomponents_care||[]).push([[5044],{"./node_modules/moment/locale/fy.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(moment){"use strict";var monthsShortWithDots="jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.".split("_"),monthsShortWithoutDots="jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_");moment.defineLocale("fy",{months:"jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber".split("_"),monthsShort:function(m,format){return m?/-MMM-/.test(format)?monthsShortWithoutDots[m.month()]:monthsShortWithDots[m.month()]:monthsShortWithDots},monthsParseExact:!0,weekdays:"snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon".split("_"),weekdaysShort:"si._mo._ti._wo._to._fr._so.".split("_"),weekdaysMin:"Si_Mo_Ti_Wo_To_Fr_So".split("_"),weekdaysParseExact:!0,longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD-MM-YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[hjoed om] LT",nextDay:"[moarn om] LT",nextWeek:"dddd [om] LT",lastDay:"[juster om] LT",lastWeek:"[ôfrûne] dddd [om] LT",sameElse:"L"},relativeTime:{future:"oer %s",past:"%s lyn",s:"in pear sekonden",ss:"%d sekonden",m:"ien minút",mm:"%d minuten",h:"ien oere",hh:"%d oeren",d:"ien dei",dd:"%d dagen",M:"ien moanne",MM:"%d moannen",y:"ien jier",yy:"%d jierren"},dayOfMonthOrdinalParse:/\d{1,2}(ste|de)/,ordinal:function(number){return number+(1===number||8===number||number>=20?"ste":"de")},week:{dow:1,doy:4}})}(__webpack_require__("./node_modules/moment/moment.js"))}}]);