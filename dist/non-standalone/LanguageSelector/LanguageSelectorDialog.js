import React, { Suspense } from "react";
import { Dialog, DialogContent } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { DialogTitle } from "../Dialog";
import Loader from "../../standalone/Loader";
import useCCTranslations from "../../utils/useCCTranslations";
const LanguageSelectorDialogContent = React.lazy(() => import("./LanguageSelectorDialogContent"));
const useStyles = makeStyles({
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
const LanguageSelectorDialog = (props) => {
    const [, popDialog] = useDialogContext();
    const { t } = useCCTranslations();
    const classes = useStyles();
    return (React.createElement(Dialog, { open: true, onClose: popDialog },
        React.createElement(DialogTitle, { onClose: popDialog }, t("non-standalone.language-switcher.title")),
        React.createElement(DialogContent, { className: classes.dialog },
            React.createElement(Suspense, { fallback: React.createElement(Loader, null) },
                React.createElement(LanguageSelectorDialogContent, { ...props, close: popDialog })))));
};
export default React.memo(LanguageSelectorDialog);
