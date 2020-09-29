import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import ImageSelector from "../../../../standalone/FileUpload/Image/ImageSelector";
import ccI18n from "../../../../i18n";
import TypeImage from "../TypeImage";

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
			return (
				<FormControl
					onBlur={handleBlur}
					error={!!errorMsg}
					required={visibility.required}
					fullWidth
				>
					<FormLabel component={"legend"}>{label}</FormLabel>
					<ImageSelector
						name={field}
						value={value}
						readOnly={visibility.readOnly}
						onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
							handleChange(evt.target.name, evt.target.value);
						}}
						alt={label}
					/>
					<FormHelperText error={!!errorMsg}>{errorMsg}</FormHelperText>
				</FormControl>
			);
		}
		return (
			<FormControl>
				<FormLabel>{label}</FormLabel>
				{value ? (
					<img src={value} alt={label} />
				) : (
					ccI18n.t("backend-integration.model.types.renderers.image.not-set")
				)}
			</FormControl>
		);
	}
}

export default RendererImage;
