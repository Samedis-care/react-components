import React, { useCallback, useState } from "react";
import {
	Grid,
	IconButton,
	InputAdornment,
	styled,
	TextFieldProps,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
	useThemeProps,
} from "@mui/material";
import useCCTranslations, {
	useCCLanguagesTranslations,
} from "../../../utils/useCCTranslations";
import { useCurrentLanguage } from "../../../utils/useCurrentLocale";
import { Translate } from "@mui/icons-material";
import { TextFieldCC } from "../MuiFieldState";
import focusRing from "../../../utils/internal/focusRing";

// src/assets/data/languages.json
export type MultiLanguageInputSupportedLanguages =
	| "aa"
	| "ab"
	| "ae"
	| "af"
	| "ak"
	| "am"
	| "an"
	| "ar"
	| "as"
	| "av"
	| "ay"
	| "az"
	| "ba"
	| "be"
	| "bg"
	| "bi"
	| "bm"
	| "bn"
	| "bo"
	| "br"
	| "bs"
	| "ca"
	| "ce"
	| "ch"
	| "co"
	| "cr"
	| "cs"
	| "cu"
	| "cv"
	| "cy"
	| "da"
	| "de"
	| "dv"
	| "dz"
	| "ee"
	| "el"
	| "en"
	| "eo"
	| "es"
	| "et"
	| "eu"
	| "fa"
	| "ff"
	| "fi"
	| "fj"
	| "fo"
	| "fr"
	| "fy"
	| "ga"
	| "gd"
	| "gl"
	| "gn"
	| "gu"
	| "gv"
	| "ha"
	| "he"
	| "hi"
	| "ho"
	| "hr"
	| "ht"
	| "hu"
	| "hy"
	| "hz"
	| "ia"
	| "id"
	| "ie"
	| "ig"
	| "ii"
	| "ik"
	| "io"
	| "is"
	| "it"
	| "iu"
	| "ja"
	| "jv"
	| "ka"
	| "kg"
	| "ki"
	| "kj"
	| "kk"
	| "kl"
	| "km"
	| "kn"
	| "ko"
	| "kr"
	| "ks"
	| "ku"
	| "kv"
	| "kw"
	| "ky"
	| "la"
	| "lb"
	| "lg"
	| "li"
	| "ln"
	| "lo"
	| "lt"
	| "lu"
	| "lv"
	| "mg"
	| "mh"
	| "mi"
	| "mk"
	| "ml"
	| "mn"
	| "mr"
	| "ms"
	| "mt"
	| "my"
	| "na"
	| "nb"
	| "nd"
	| "ne"
	| "ng"
	| "nl"
	| "nn"
	| "no"
	| "nr"
	| "nv"
	| "ny"
	| "oc"
	| "oj"
	| "om"
	| "or"
	| "os"
	| "pa"
	| "pi"
	| "pl"
	| "ps"
	| "pt"
	| "qu"
	| "rm"
	| "rn"
	| "ro"
	| "ru"
	| "rw"
	| "sa"
	| "sc"
	| "sd"
	| "se"
	| "sg"
	| "sh"
	| "si"
	| "sk"
	| "sl"
	| "sm"
	| "sn"
	| "so"
	| "sq"
	| "sr"
	| "ss"
	| "st"
	| "su"
	| "sv"
	| "sw"
	| "ta"
	| "te"
	| "tg"
	| "th"
	| "ti"
	| "tk"
	| "tl"
	| "tn"
	| "to"
	| "tr"
	| "ts"
	| "tt"
	| "tw"
	| "ty"
	| "ug"
	| "uk"
	| "ur"
	| "uz"
	| "ve"
	| "vi"
	| "vo"
	| "wa"
	| "wo"
	| "xh"
	| "yi"
	| "yo"
	| "za"
	| "zh"
	| "zu";

export type MultiLanguageInputProps = Omit<
	TextFieldProps,
	| "value"
	| "onChange"
	| "onBlur"
	| "InputProps"
	| "label"
	| "name"
	| "required"
	| "fullWidth"
> & {
	/**
	 * The languages that can be edited: the default language first, then the
	 * others in this order. The default language is the components-care UI
	 * language when it is in this list and `ignoreI18nLocale` is not set,
	 * otherwise the first entry; it is the labelled and required field, and it
	 * follows later changes of this list and of the UI language. In multiline
	 * mode the textarea shows the default language until another language's
	 * button below it is pressed, and again when that language is no longer in
	 * this list.
	 */
	enabledLanguages: MultiLanguageInputSupportedLanguages[];
	/**
	 * Ignore i18n locale settings when determining default language
	 */
	ignoreI18nLocale?: boolean;
	/**
	 * The text per language, keyed by language code, e.g.
	 * `{ en: "Pump", de: "Pumpe" }`. Use `{}` for no text; must not be `null`
	 * or `undefined`. A language without a key (or with `null`) shows an empty
	 * field. Keys of languages that are not in `enabledLanguages` are kept by
	 * `onChange`.
	 */
	values: Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
	/**
	 * Change event
	 * @param newValues New values
	 */
	onChange: (
		newValues: Partial<Record<MultiLanguageInputSupportedLanguages, string>>,
	) => void;
	/**
	 * Label of the default language's field (single-line) or of the textarea
	 * (multiline), and the name of the group around all language fields. Each
	 * field is named with the label and its language, e.g. "Title (German)":
	 * the labelled field reads the language with its label (visually hidden),
	 * the other languages' fields, which show only their code, carry the name as
	 * `aria-label`. Without a label each field is named with its language only.
	 */
	label?: string;
	/**
	 * Disable red translate icon if translation is incomplete
	 */
	disableIncompleteMarker?: boolean;
	/**
	 * Name of the control (used for form engine)
	 */
	name?: string;
	/**
	 * Is the default language required
	 */
	required?: boolean;
	/**
	 * Blur event handler
	 */
	onBlur?: React.FocusEventHandler;
	/**
	 * Display error
	 */
	error?: boolean;
	/**
	 * Display warning
	 */
	warning?: boolean;
	/**
	 * Does the value differ from the server-side value?
	 * @remarks Presentational only; set by the form engine from `RenderParams.dirty`.
	 */
	dirty?: boolean;
};

/**
 * The `ownerState` of the `languageLabel` theme slot (a language button below
 * a multiline field).
 */
export interface MultiLanguageInputLanguageLabelOwnerState {
	/** The button's language is the one the textarea edits (pressed) */
	active: boolean;
}

/** The language buttons below a multiline field */
const LanguageSwitcher = styled(ToggleButtonGroup, {
	name: "CcMultiLanguageInput",
	slot: "languageSwitcher",
})(({ theme }) => ({
	flexWrap: "wrap",
	marginTop: theme.spacing(0.5),
}));

/** One language button of the multiline switcher, showing the language code */
const LanguageLabel = styled(ToggleButton, {
	name: "CcMultiLanguageInput",
	slot: "languageLabel",
})<{ ownerState: MultiLanguageInputLanguageLabelOwnerState }>(({ theme }) => ({
	// compact (about 29px high), the codes in the case they are written in
	padding: theme.spacing(0.25, 1),
	minWidth: 32,
	textTransform: "none",
	// inside the button: its neighbours overlap its border
	"&.Mui-focusVisible": focusRing(theme, -2),
}));

/** The field's language name, read with its label but not shown */
const LabelLanguageName = styled("span")({
	// visually hidden, as MUI's visuallyHidden
	border: 0,
	clipPath: "inset(50%)",
	height: 1,
	margin: -1,
	overflow: "hidden",
	padding: 0,
	position: "absolute",
	whiteSpace: "nowrap",
	width: 1,
});

const LanguageLabelInputAdornment = styled(Typography, {
	name: "CcMultiLanguageInput",
	slot: "languageLabelInputAdornment",
})({});

/**
 * Theme slots of `CcMultiLanguageInput`:
 * - `languageSwitcher`: the group of language buttons below a multiline field
 *   (a `ToggleButtonGroup`);
 * - `languageLabel`: one language button of that group (a `ToggleButton`,
 *   gets {@link MultiLanguageInputLanguageLabelOwnerState});
 * - `languageLabelInputAdornment`: the code adornment of a single-line field.
 */
export type MultiLanguageInputClassKey =
	"languageSwitcher" | "languageLabel" | "languageLabelInputAdornment";

const MultiLanguageInput = (inProps: MultiLanguageInputProps) => {
	const props = useThemeProps({ props: inProps, name: "CcMultiLanguageInput" });
	const {
		enabledLanguages,
		values,
		onChange,
		name,
		onBlur,
		label,
		disableIncompleteMarker,
		required,
		ignoreI18nLocale,
		warning,
		dirty,
		autoFocus,
		...textFieldProps
	} = props;
	const { t } = useCCLanguagesTranslations();
	const { t: tCC } = useCCTranslations();
	const language = useCurrentLanguage();

	// determine default language
	let defaultLanguage = language as MultiLanguageInputSupportedLanguages;
	const i18nLang = defaultLanguage;
	if (ignoreI18nLocale || !enabledLanguages.includes(defaultLanguage)) {
		defaultLanguage = enabledLanguages[0];
	}

	const [expanded, setExpanded] = useState(false); // if normal text field
	// the language code clicked in the multiline label, null until one is
	const [pickedLanguage, setPickedLanguage] =
		useState<MultiLanguageInputSupportedLanguages | null>(null);
	// the language the multiline textarea edits: the picked one while it is
	// enabled, otherwise (and in single-line mode) the default language
	const activeLanguage =
		textFieldProps.multiline &&
		pickedLanguage &&
		enabledLanguages.includes(pickedLanguage)
			? pickedLanguage
			: defaultLanguage;
	const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);

	const incomplete =
		!textFieldProps.disabled &&
		!disableIncompleteMarker &&
		enabledLanguages.map((lng) => (values[lng] ?? "").trim()).find((e) => !e) !=
			null;

	const handleChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const nameSplit = evt.target.name.split("-");
			const lang = nameSplit[
				nameSplit.length - 1
			] as MultiLanguageInputSupportedLanguages;
			if (!enabledLanguages.includes(lang)) {
				throw new Error("Language not supported");
			}
			const newValue = {
				...values,
				[lang]: evt.target.value,
			};
			if (!evt.target.value) delete newValue[lang];
			onChange(newValue);
		},
		[enabledLanguages, onChange, values],
	);

	const getLanguageName = (lang: string) =>
		[
			t(lang, {
				defaultValue: "",
			}),
			lang !== i18nLang && t(lang + "-native", { defaultValue: "" }),
		]
			.filter((e) => e)
			.join(" ");

	const handleLanguageSwitch = useCallback(
		(
			_evt: React.MouseEvent<HTMLElement>,
			lang: MultiLanguageInputSupportedLanguages | null,
		) => {
			// null: the pressed button was pressed again, which keeps its language
			if (lang) setPickedLanguage(lang);
		},
		[],
	);

	// a field's language in the UI language, e.g. "German"
	const getFieldLanguageName = (lang: MultiLanguageInputSupportedLanguages) =>
		lang ? t(lang, { defaultValue: lang }) : "";

	// the default language's field and the textarea show the label; the other
	// languages' fields show only their code, so their name is an aria-label
	const showsLabel = (lang: MultiLanguageInputSupportedLanguages) =>
		!!label && (!!textFieldProps.multiline || lang === defaultLanguage);

	const renderLanguage = (
		lang: MultiLanguageInputSupportedLanguages,
		focus: boolean,
	) => (
		<TextFieldCC
			{...textFieldProps}
			warning={warning}
			dirty={dirty}
			autoFocus={focus}
			fullWidth
			label={
				showsLabel(lang) ? (
					<>
						{label}
						{lang && (
							<LabelLanguageName>
								{" "}
								({getFieldLanguageName(lang)})
							</LabelLanguageName>
						)}
					</>
				) : undefined
			}
			required={
				defaultLanguage === lang && activeLanguage === defaultLanguage
					? required
					: undefined
			}
			value={values[lang] ?? ""}
			onChange={handleChange}
			name={`${name ?? "mli"}-${lang}`}
			slotProps={{
				inputLabel: {
					...textFieldProps.slotProps?.inputLabel,
					shrink: textFieldProps.multiline
						? true
						: ((textFieldProps.slotProps?.inputLabel as Record<string, unknown>)
								?.shrink as boolean | undefined),
				},
				htmlInput: showsLabel(lang)
					? undefined
					: {
							"aria-label": label
								? `${label} (${getFieldLanguageName(lang)})`
								: getFieldLanguageName(lang) || undefined,
						},
				input: {
					startAdornment: !textFieldProps.multiline ? (
						<InputAdornment position={"start"}>
							<Tooltip title={getLanguageName(lang)}>
								<LanguageLabelInputAdornment
									variant={"caption"}
									color={"textSecondary"}
								>
									{lang}
								</LanguageLabelInputAdornment>
							</Tooltip>
						</InputAdornment>
					) : undefined,
					endAdornment:
						defaultLanguage === lang && !textFieldProps.multiline ? (
							<InputAdornment position={"end"}>
								<IconButton
									onClick={toggleExpanded}
									size="large"
									aria-label={tCC(
										"standalone.uikit.multi-language-input.toggle-languages",
									)}
								>
									<Translate
										color={
											expanded ? "primary" : incomplete ? "error" : undefined
										}
									/>
								</IconButton>
							</InputAdornment>
						) : undefined,
				},
			}}
		/>
	);

	return (
		<Grid
			container
			spacing={2}
			data-name={name}
			onBlur={onBlur}
			role="group"
			aria-label={label || undefined}
		>
			<Grid size={12}>
				{renderLanguage(
					textFieldProps.multiline ? activeLanguage : defaultLanguage,
					!!autoFocus,
				)}
				{textFieldProps.multiline && (
					<LanguageSwitcher
						exclusive
						size="small"
						value={activeLanguage}
						onChange={handleLanguageSwitch}
						aria-label={
							label
								? tCC("standalone.uikit.multi-language-input.language-of", {
										label,
									})
								: tCC("standalone.uikit.multi-language-input.language")
						}
					>
						{[
							defaultLanguage,
							...enabledLanguages.filter((lang) => lang !== defaultLanguage),
						].map((lang) => (
							<Tooltip key={lang} title={getLanguageName(lang)}>
								<LanguageLabel
									value={lang}
									data-lang={lang}
									ownerState={{ active: activeLanguage === lang }}
								>
									{lang}
								</LanguageLabel>
							</Tooltip>
						))}
					</LanguageSwitcher>
				)}
			</Grid>
			{expanded &&
				!textFieldProps.multiline &&
				enabledLanguages
					.filter((lang) => lang !== defaultLanguage)
					.map((lang) => (
						<Grid key={lang} size={12}>
							{renderLanguage(lang, false)}
						</Grid>
					))}
		</Grid>
	);
};

export default React.memo(MultiLanguageInput);
