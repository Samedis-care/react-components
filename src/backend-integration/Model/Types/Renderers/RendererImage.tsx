import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import ImageSelector from "../../../../standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";

/**
 * Renders an image selector
 */
class RendererImage extends TypeImage {
	render(params: ModelRenderParams<string>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={value}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<ImageSelector
						name={field}
						value={value}
						label={label}
						readOnly={visibility.readOnly}
						onChange={(name, value) => {
							handleChange(name, value);
						}}
						onBlur={handleBlur}
						alt={label}
						capture={this.params?.capture ?? false}
						uploadLabel={this.params?.uploadLabel}
						convertImagesTo={this.params?.convertImagesTo}
						downscale={this.params?.downscale}
					/>
					<FormHelperText error={!!errorMsg}>{errorMsg}</FormHelperText>
				</>
			);
		}

		const content = value ? (
			<img
				src={value}
				alt={label}
				style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
			/>
		) : (
			<>{ccI18n.t("backend-integration.model.types.renderers.image.not-set")}</>
		);

		return visibility.grid ? (
			content
		) : (
			<FormControl>
				<FormLabel>{label}</FormLabel>
				{content}
			</FormControl>
		);
	}
}

export default RendererImage;
