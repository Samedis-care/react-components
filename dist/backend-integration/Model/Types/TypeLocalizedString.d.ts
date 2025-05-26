import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { MultiLanguageInputSupportedLanguages } from "../../../standalone/UIKit/InputControls/MultiLanguageInput";
/**
 * Type to handle localized strings
 */
declare abstract class TypeLocalizedString implements Type<Partial<Record<MultiLanguageInputSupportedLanguages, string>>> {
    protected multiline: boolean;
    constructor(multiline?: boolean);
    abstract render(params: ModelRenderParams<Partial<Record<MultiLanguageInputSupportedLanguages, string>>>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
    stringify(value: Partial<Record<MultiLanguageInputSupportedLanguages, string>>): string;
    deserialize: (value: unknown) => Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
}
export default TypeLocalizedString;
