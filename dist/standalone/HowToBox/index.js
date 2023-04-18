var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { GroupBox } from "../index";
import useCCTranslations from "../../utils/useCCTranslations";
var useStyles = makeStyles({
    groupBox: {
        paddingLeft: "1.5rem",
    },
}, { name: "CcHowToBox" });
var HowToBox = function (props) {
    var titleLabel = props.titleLabel, labels = props.labels;
    var t = useCCTranslations().t;
    var classes = useStyles(props);
    if (!labels)
        return React.createElement(React.Fragment, null);
    return (React.createElement(GroupBox, { label: titleLabel !== null && titleLabel !== void 0 ? titleLabel : t("standalone.how-it-works.title") },
        React.createElement("ul", { className: classes.groupBox }, Array.isArray(labels) ? (labels.map(function (label, i) { return (React.createElement("li", { key: i.toString(16) }, label)); })) : (React.createElement("li", null, labels)))));
};
/**
 * i18n version of HowToBox
 * @param props The props
 * @see HowToBox
 */
export var HowToBoxTranslate = function (props) {
    var t = props.t, titleLabel = props.titleLabel, labels = props.labels, other = __rest(props, ["t", "titleLabel", "labels"]);
    // memo content because it's an array which gets re-created every render
    var content = useMemo(function () { return t(labels, { returnObjects: true }); }, [
        t,
        labels,
    ]);
    return (React.createElement(HowToBox, __assign({}, other, { titleLabel: titleLabel ? t(titleLabel) : undefined, labels: content })));
};
export default React.memo(HowToBox);
