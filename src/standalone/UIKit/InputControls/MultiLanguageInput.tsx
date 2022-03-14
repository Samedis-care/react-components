import React, { useCallback, useState } from "react";
import {
	Grid,
	IconButton,
	InputAdornment,
	TextField,
	TextFieldProps,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { useCCLanguagesTranslations } from "../../../utils/useCCTranslations";
import { Translate } from "@material-ui/icons";

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
	 * The languages shown
	 * First entry is fallback default language
	 */
	enabledLanguages: MultiLanguageInputSupportedLanguages[];
	/**
	 * Ignore i18n locale settings when determining default language
	 */
	ignoreI18nLocale?: boolean;
	/**
	 * The current values
	 */
	values: Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
	/**
	 * Change event
	 * @param newValues New values
	 */
	onChange: (
		newValues: Partial<Record<MultiLanguageInputSupportedLanguages, string>>
	) => void;
	/**
	 * Label for the text field
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
};

const MultiLanguageInput = (props: MultiLanguageInputProps) => {
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
		...textFieldProps
	} = props;
	const { t, i18n } = useCCLanguagesTranslations();
	const [expanded, setExpanded] = useState(false);
	const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), []);

	const incomplete =
		!textFieldProps.disabled &&
		!disableIncompleteMarker &&
		enabledLanguages.map((lng) => (values[lng] ?? "").trim()).find((e) => !e) !=
			null;

	// determine default language
	let defaultLanguage = i18n.language.split(
		"-"
	)[0] as MultiLanguageInputSupportedLanguages;
	const i18nLang = defaultLanguage;
	if (ignoreI18nLocale || !enabledLanguages.includes(defaultLanguage)) {
		defaultLanguage = enabledLanguages[0];
	}

	const handleChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const nameSplit = evt.target.name.split("-");
			const lang = nameSplit[
				nameSplit.length - 1
			] as MultiLanguageInputSupportedLanguages;
			if (!enabledLanguages.includes(lang)) {
				throw new Error("Language not supported");
			}
			onChange({
				...values,
				[lang]: evt.target.value,
			});
		},
		[enabledLanguages, onChange, values]
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

	return (
		<Grid container spacing={2} data-name={name} onBlur={onBlur}>
			<Grid item xs={12}>
				<TextField
					{...textFieldProps}
					fullWidth
					label={label}
					value={values[defaultLanguage] ?? ""}
					name={`${name ?? "mli"}-${defaultLanguage}`}
					onChange={handleChange}
					required={required}
					InputProps={{
						startAdornment: expanded && (
							<InputAdornment position={"start"}>
								<Tooltip title={getLanguageName(defaultLanguage)}>
									<Typography variant={"caption"} color={"textSecondary"}>
										{defaultLanguage}
									</Typography>
								</Tooltip>
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position={"end"}>
								<IconButton onClick={toggleExpanded}>
									<Translate
										color={
											expanded ? "primary" : incomplete ? "error" : undefined
										}
									/>
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			</Grid>
			{expanded &&
				enabledLanguages
					.filter((lang) => lang !== defaultLanguage)
					.map((lang) => (
						<Grid item xs={12} key={lang}>
							<TextField
								{...textFieldProps}
								fullWidth
								value={values[lang] ?? ""}
								onChange={handleChange}
								name={`${name ?? "mli"}-${lang}`}
								InputProps={{
									startAdornment: (
										<InputAdornment position={"start"}>
											<Tooltip title={getLanguageName(lang)}>
												<Typography variant={"caption"} color={"textSecondary"}>
													{lang}
												</Typography>
											</Tooltip>
										</InputAdornment>
									),
								}}
							/>
						</Grid>
					))}
		</Grid>
	);
};

export default React.memo(MultiLanguageInput);
