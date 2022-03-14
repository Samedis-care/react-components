import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { ImageSelectorProps } from "../../../standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../../i18n";

export type TypeImageParams = Partial<
	Pick<
		ImageSelectorProps,
		"uploadLabel" | "convertImagesTo" | "downscale" | "capture" | "variant"
	>
>;

/**
 * A type to handle images
 */
abstract class TypeImage implements Type<string> {
	protected params?: TypeImageParams;

	constructor(params?: TypeImageParams) {
		this.params = params;
	}

	public getParams(): TypeImageParams {
		return this.params ?? {};
	}

	abstract render(params: ModelRenderParams<string>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return null;
	}

	getDefaultValue(): string {
		return "";
	}

	stringify(value: string): string {
		return value
			? ccI18n.t("backend-integration.model.types.image.set")
			: ccI18n.t("backend-integration.model.types.image.not-set");
	}
}

export default TypeImage;
