import React from "react";
import { FormHelperText } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import ccI18n from "../../../../i18n";
import TypeFiles from "../TypeFiles";
import FileUpload, {
	FileData,
} from "../../../../standalone/FileUpload/Generic";
import GroupBox from "../../../../standalone/GroupBox";

/**
 * Renders a file selector
 */
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
			setError,
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
				<>
					<FileUpload
						label={label}
						files={value}
						readOnly={visibility.readOnly}
						onChange={(files) => {
							handleChange(field, files);
						}}
						onBlur={handleBlur}
						handleError={(_, msg) => setError(new Error(msg))}
						maxFiles={this.params?.maxFiles}
						accept={this.params?.accept}
						acceptLabel={this.params?.acceptLabel}
						imageDownscaleOptions={this.params?.imageDownscaleOptions}
						convertImagesTo={this.params?.convertImagesTo}
						previewSize={this.params?.previewSize || 96}
						previewImages={this.params?.previewImages}
						allowDuplicates={this.params?.allowDuplicates}
					/>
					<FormHelperText error={!!errorMsg}>{errorMsg}</FormHelperText>
				</>
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
