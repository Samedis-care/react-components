import React, { Suspense } from "react";
import { Dialog, DialogContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { DialogTitle } from "../Dialog";
import Loader from "../../standalone/Loader";
import useCCTranslations from "../../utils/useCCTranslations";

const LanguageSelectorDialogContent = React.lazy(
	() => import("./LanguageSelectorDialogContent")
);

const useStyles = makeStyles(
	{
		dialog: {
			paddingLeft: 0,
			paddingRight: 0,
		},
	},
	{ name: "CcLanguageSelectorDialog" }
);

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
const LanguageSelectorDialog = () => {
	const [, popDialog] = useDialogContext();

	const { t } = useCCTranslations();
	const classes = useStyles();

	return (
		<Dialog open={true} onClose={popDialog}>
			<DialogTitle onClose={popDialog}>
				{t("non-standalone.language-switcher.title")}
			</DialogTitle>
			<DialogContent className={classes.dialog}>
				<Suspense fallback={<Loader />}>
					<LanguageSelectorDialogContent close={popDialog} />
				</Suspense>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(LanguageSelectorDialog);
