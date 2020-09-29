import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import ccI18n from "../../../../i18n";
import TypeFiles from "../TypeFiles";
import FileUpload, {
	FileData,
} from "../../../../standalone/FileUpload/Generic";

class RendererString extends TypeFiles {
	render(params: ModelRenderParams<FileData[]>): React.ReactElement {
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
					<FileUpload
						files={value}
						readOnly={visibility.readOnly}
						onChange={(files) => {
							handleChange(field, files);
						}}
						previewSize={96}
						handleError={console.error} // TODO: Error handling
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

export default RendererString;
