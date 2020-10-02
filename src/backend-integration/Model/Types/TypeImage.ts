import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { ImageSelectorProps } from "../../../standalone/FileUpload/Image/ImageSelector";

export type TypeImageParams = Partial<
	Pick<ImageSelectorProps, "uploadLabel" | "convertImagesTo" | "downscale">
>;

/**
 * A type to handle images
 */
abstract class TypeImage implements Type<string> {
	protected params?: TypeImageParams;

	constructor(params?: TypeImageParams) {
		this.params = params;
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
}

export default TypeImage;
