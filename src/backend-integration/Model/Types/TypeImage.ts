import React from "react";
import Type from "../Type";
import ModelRenderParams from "../RenderParams";
import FilterType from "../FilterType";
import { ImageSelectorProps } from "../../../standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../../i18n";

export type TypeImageParams = Partial<
	Pick<
		ImageSelectorProps,
		| "uploadLabel"
		| "convertImagesTo"
		| "downscale"
		| "capture"
		| "variant"
		| "postEditCallback"
		| "disableRotation"
	>
> & {
	/**
	 * Fallback image to display
	 */
	placeholder?: string;
};

/**
 * A type to handle images
 * @remarks The value is the image's URL (or data URI), empty for no image, or an image the
 *          user picked as Blob (a File). The Blob is sent as it is: RailsApiClient uploads it
 *          as a file.
 */
abstract class TypeImage implements Type<string | Blob> {
	protected params?: TypeImageParams;

	constructor(params?: TypeImageParams) {
		this.params = params;
	}

	public getParams(): TypeImageParams {
		return this.params ?? {};
	}

	abstract render(params: ModelRenderParams<string | Blob>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return null;
	}

	getDefaultValue(): string | Blob {
		return "";
	}

	stringify(value: string | Blob): string {
		return value
			? ccI18n.t("backend-integration.model.types.image.set")
			: ccI18n.t("backend-integration.model.types.image.not-set");
	}
}

export default TypeImage;
