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
import React, { Suspense } from "react";
import { Dialog, DialogContent } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { DialogTitle } from "../Dialog";
import Loader from "../../standalone/Loader";
import useCCTranslations from "../../utils/useCCTranslations";
var LanguageSelectorDialogContent = React.lazy(function () { return import("./LanguageSelectorDialogContent"); });
var useStyles = makeStyles({
    dialog: {
        paddingLeft: 0,
        paddingRight: 0,
    },
}, { name: "CcLanguageSelectorDialog" });
/**
 * Locale selector dialog
 * @usage `pushDialog(<LanguageSelectorDialog \>)`
 * @remarks You should add the following code snipped into your app entry point to enable locale synchronization.
 * ```ts
 * // Components-Care i18n locale sync
 * ComponentsCareI18n.on("languageChanged", (language) => {
 *   moment.locale(language);
 *   i18n.changeLanguage(language);
 * });
 * ```
 */
var LanguageSelectorDialog = function (props) {
    var _a = useDialogContext(), popDialog = _a[1];
    var t = useCCTranslations().t;
    var classes = useStyles();
    return (React.createElement(Dialog, { open: true, onClose: popDialog },
        React.createElement(DialogTitle, { onClose: popDialog }, t("non-standalone.language-switcher.title")),
        React.createElement(DialogContent, { className: classes.dialog },
            React.createElement(Suspense, { fallback: React.createElement(Loader, null) },
                React.createElement(LanguageSelectorDialogContent, __assign({}, props, { close: popDialog }))))));
};
export default React.memo(LanguageSelectorDialog);
