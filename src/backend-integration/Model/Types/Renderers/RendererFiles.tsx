import React from "react";
import ModelRenderParams from "../../RenderParams";
import ccI18n from "../../../../i18n";
import TypeFiles from "../TypeFiles";
import FileUpload, {
	FileData,
} from "../../../../standalone/FileUpload/Generic";
import GroupBox from "../../../../standalone/GroupBox";
import { FormHelperTextCC } from "../../../../standalone/UIKit/MuiFieldState";
import ObjectUrlImage from "../../../../standalone/FileUpload/Image/ObjectUrlImage";
import ObjectUrlLink from "../../../../standalone/FileUpload/Generic/ObjectUrlLink";
import FilesGrid from "./FilesGrid/FilesGrid";

/**
 * Renders a file selector
 * @remarks In a grid cell (overview visibility with `grid`) the files take one
 *          line (FilesGrid): "No files present", the only file's name as a link
 *          to it, or for more files their count ("2 files") as a button that
 *          opens a menu of the files.
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
			dirty,
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
							dirty={dirty}
							files={value}
							readOnly={visibility.readOnly}
							onChange={(files) => {
								handleChange(field, files);
							}}
							onBlur={handleBlur}
							handleError={(_, msg) => setError(new Error(msg))}
							maxFiles={this.params?.maxFiles}
							minFileSize={this.params?.minFileSize}
							maxFileSize={this.params?.maxFileSize}
							maxTotalFileSize={this.params?.maxTotalFileSize}
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

		if (visibility.grid) return <FilesGrid files={value} />;

		const content = (
			<>
				<ul>
					{value.map((entry, index) => (
						<li key={index}>
							{entry.preview && (
								<ObjectUrlImage src={entry.preview} alt={entry.file.name} />
							)}
							{!entry.preview && "downloadLink" in entry.file && (
								<ObjectUrlLink href={entry.file.downloadLink}>
									{entry.file.name}
								</ObjectUrlLink>
							)}
						</li>
					))}
				</ul>
				{value.length === 0 &&
					ccI18n.t("backend-integration.model.types.renderers.files.no-file")}
			</>
		);

		return <GroupBox label={label}>{content}</GroupBox>;
	}
}

export default RendererFiles;
