import React from "react";
import Type from "../Type";
import ModelRenderParams from "../RenderParams";
import FilterType from "../FilterType";
import ccI18n from "../../../i18n";

/**
 * A type to handle signatures (for electronic signing)
 * @remarks The value is the signature as PNG data URI, empty if not signed
 */
abstract class TypeSignature implements Type<string | null> {
	abstract render(params: ModelRenderParams<string | null>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return null;
	}

	getDefaultValue(): string | null {
		return "";
	}

	stringify(value: string | null): string {
		return value
			? ccI18n.t("backend-integration.model.types.image.set")
			: ccI18n.t("backend-integration.model.types.image.not-set");
	}
}

export default TypeSignature;
