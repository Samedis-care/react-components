import React, { Suspense } from "react";
import { Dialog, DialogContent, styled, useThemeProps } from "@mui/material";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { DialogTitle } from "../Dialog";
import Loader from "../../standalone/Loader";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";

const LocaleSelectorDialogContent = React.lazy(
	() => import("./LocaleSelectorDialogContent"),
);

const StyledDialog = styled(Dialog, {
	name: "CcLocaleSelectorDialog",
	slot: "root",
})({
	"& .MuiPaper-root": {
		width: 400,
	},
});
const StyledDialogTitle = styled(DialogTitle, {
	name: "CcLocaleSelectorDialog",
	slot: "title",
})({});
const StyledDialogContent = styled(DialogContent, {
	name: "CcLocaleSelectorDialog",
	slot: "contentWrapper",
})({
	paddingLeft: 0,
	paddingRight: 0,
});
const StyledLocaleSelectorDialogContent = styled(LocaleSelectorDialogContent, {
	name: "CcLocaleSelectorDialog",
	slot: "content",
})({});

export type LocaleSelectorDialogClassKey =
	| "root"
	| "title"
	| "contentWrapper"
	| "content";

export interface LocaleSelectorDialogCommonProps {
	/**
	 * List of supported locales and/or languages
	 * Examples:
	 * - en-US # allow en-US
	 * - en    # allow all en based locales
	 * - de-DE # allow de-DE
	 * - de    # allow all de based languages
	 */
	supportedLocales?: string[];
}

export interface LocaleSelectorDialogProps
	extends LocaleSelectorDialogCommonProps {
	className?: string;
	classes?: Partial<Record<LocaleSelectorDialogClassKey, string>>;
}

/**
 * Locale selector dialog
 * @usage `pushDialog(<LocaleSelectorDialog \>)`
 * @remarks You should add the following code snipped into your app entry point to enable locale synchronization.
 * ```ts
 * // Components-Care i18n locale sync
 * ComponentsCareI18n.on("languageChanged", (language) => {
 *   moment.locale(language);
 *   i18n.changeLanguage(language);
 * });
 * ```
 */
const LocaleSelectorDialog = (inProps: LocaleSelectorDialogProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcLocaleSelectorDialog",
	});
	const { className, classes, ...contentProps } = props;
	const [, popDialog] = useDialogContext();

	const { t } = useCCTranslations();

	return (
		<StyledDialog
			open={true}
			onClose={popDialog}
			className={combineClassNames([className, classes?.root])}
		>
			<StyledDialogTitle onClose={popDialog} className={classes?.title}>
				{t("non-standalone.language-switcher.title")}
			</StyledDialogTitle>
			<StyledDialogContent className={classes?.contentWrapper}>
				<Suspense fallback={<Loader />}>
					<StyledLocaleSelectorDialogContent
						{...contentProps}
						className={classes?.content}
						close={popDialog}
					/>
				</Suspense>
			</StyledDialogContent>
		</StyledDialog>
	);
};

export default React.memo(LocaleSelectorDialog);
