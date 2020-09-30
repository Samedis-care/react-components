import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import ccI18n from "../../../../i18n";
import TypeFiles from "../TypeFiles";
import FileUpload, {
	FileData,
} from "../../../../standalone/FileUpload/Generic";
import GroupBox from "../../../../standalone/GroupBox";

class RendererFiles extends TypeFiles {
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
					value={value.map((entry) => entry.file.name).join(",")}
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
			<GroupBox label={label}>
				<ul>
					{value.map((entry, index) => (
						<li key={index}>
							{entry.preview && (
								<img src={entry.preview} alt={entry.file.name} />
							)}
							{!entry.preview && "downloadLink" in entry.file && (
								<a href={entry.file.downloadLink}>{entry.file.name}</a>
							)}
						</li>
					))}
				</ul>
				{value.length === 0 &&
					ccI18n.t("backend-integration.model.types.renderers.files.no-file")}
			</GroupBox>
		);
	}
}

export default RendererFiles;
