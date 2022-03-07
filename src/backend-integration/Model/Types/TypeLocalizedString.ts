import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { MultiLanguageInputSupportedLanguages } from "../../../standalone/UIKit/InputControls/MultiLanguageInput";
import ccI18n from "../../../i18n";

/**
 * Type to handle localized strings
 */
abstract class TypeLocalizedString
	implements
		Type<Partial<Record<MultiLanguageInputSupportedLanguages, string>>> {
	protected multiline: boolean;

	constructor(multiline = false) {
		this.multiline = multiline;
	}

	abstract render(
		params: ModelRenderParams<
			Partial<Record<MultiLanguageInputSupportedLanguages, string>>
		>
	): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return "string";
	}

	getDefaultValue(): Partial<
		Record<MultiLanguageInputSupportedLanguages, string>
	> {
		return {};
	}

	stringify(
		value: Partial<Record<MultiLanguageInputSupportedLanguages, string>>
	): string {
		if (!value) return "";
		const currentLang = ccI18n.language.split(
			"-"
		)[0] as MultiLanguageInputSupportedLanguages;
		return value[currentLang] ?? "";
	}
}

export default TypeLocalizedString;
