var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useCallback } from "react";
import { Grid, ListItemButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import useCCTranslations from "../../utils/useCCTranslations";
import CountryFlags from "../../standalone/CountryFlags";
var useStyles = makeStyles({
    root: {
        height: "100%",
        display: "block",
    },
    container: {
        width: "100%",
        height: "100%",
        margin: 0,
    },
    imageWrapper: {
        height: 30,
        position: "relative",
    },
    image: {
        height: "100%",
        width: "auto",
        maxWidth: "100%",
        objectFit: "contain",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        position: "absolute",
        border: "1px solid lightgray",
    },
}, { name: "CcLanguageSelectorEntry" });
var LanguageSelectorEntry = function (props) {
    var locale = props.locale, currentLanguage = props.currentLanguage, close = props.close;
    var i18n = useCCTranslations().i18n;
    var classes = useStyles();
    var sameLang = locale.language_short === currentLanguage;
    var handleClick = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, i18n.changeLanguage(locale.locale)];
                case 1:
                    _a.sent();
                    close();
                    return [2 /*return*/];
            }
        });
    }); }, [i18n, locale, close]);
    var flag = CountryFlags[locale.country_short];
    return (React.createElement(ListItemButton, { onClick: handleClick, className: classes.root },
        React.createElement(Grid, { container: true, spacing: 2, className: classes.container, alignItems: "stretch" },
            React.createElement(Grid, { item: true, xs: 4, className: classes.imageWrapper },
                React.createElement("img", { alt: locale.country, src: flag, className: classes.image })),
            React.createElement(Grid, { item: true, xs: 8, container: true },
                React.createElement(Grid, { item: true, xs: 6 }, locale.country),
                React.createElement(Grid, { item: true, xs: 6 }, locale.language),
                !sameLang && (React.createElement(React.Fragment, null,
                    React.createElement(Grid, { item: true, xs: 6 }, locale.native_country),
                    React.createElement(Grid, { item: true, xs: 6 }, locale.native_language)))))));
};
// virtualization remounts the component every time, so no need for memo here
export default LanguageSelectorEntry;
