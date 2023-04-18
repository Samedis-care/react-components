import { useEffect, useState } from "react";
var MS_PER_DAY = 86400000; // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
var MS_PER_MIN = 60000; // 60 seconds * 1000 milliseconds
/**
 * React hook to provide the current date
 * @returns The current date (updates every day)
 */
export var useDate = function () {
    var _a = useState(function () { return new Date(); }), date = _a[0], setDate = _a[1];
    useEffect(function () {
        var timezoneTimestamp = date.getTime() - date.getTimezoneOffset() * MS_PER_MIN;
        var msTillNextDay = MS_PER_DAY - (timezoneTimestamp % MS_PER_DAY);
        var timer = window.setTimeout(function () {
            setDate(new Date());
        }, msTillNextDay + 100 /* safety */);
        return function () { return window.clearTimeout(timer); };
    }, [date]);
    return date;
};
/**
 * React hook to provide the current date, hour and minute
 * @returns The current date (updates every minute)
 */
export var useDateHM = function () {
    var _a = useState(function () { return new Date(); }), date = _a[0], setDate = _a[1];
    useEffect(function () {
        var msTillNextMinute = MS_PER_MIN - (date.getTime() % MS_PER_MIN);
        var timer = window.setTimeout(function () {
            setDate(new Date());
        }, msTillNextMinute + 100 /* safety */);
        return function () { return window.clearTimeout(timer); };
    }, [date]);
    return date;
};
/**
 * React hook to provide the current date, hour, minute and second
 * @returns The current date (UPDATES EVERY SECOND)
 */
export var useDateHMS = function () {
    var _a = useState(function () { return new Date(); }), date = _a[0], setDate = _a[1];
    useEffect(function () {
        var timer = window.setInterval(function () {
            setDate(new Date());
        }, 1000);
        return function () { return window.clearInterval(timer); };
    }, []);
    return date;
};
