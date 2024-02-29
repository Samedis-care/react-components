import React from "react";
import ModelRenderParams from "../../RenderParams";
import ccI18n from "../../../../i18n";
import TypeFiles from "../TypeFiles";
import FileUpload, {
	FileData,
} from "../../../../standalone/FileUpload/Generic";
import GroupBox from "../../../../standalone/GroupBox";
import { FormHelperTextCC } from "../../../../standalone/UIKit/MuiWarning";

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
			warningMsg,
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
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<div>
						<FileUpload
							name={field}
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
							smallLabel={this.params?.smallLabel}
						/>
					</div>
					<FormHelperTextCC error={!!errorMsg} warning={!!warningMsg}>
						{errorMsg || warningMsg}
					</FormHelperTextCC>
				</>
			);
		}

		const content = (
			<>
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
			</>
		);

		return visibility.grid ? (
			content
		) : (
			<GroupBox label={label}>{content}</GroupBox>
		);
	}
}

export default RendererFiles;
