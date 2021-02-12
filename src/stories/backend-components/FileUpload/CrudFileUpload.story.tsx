import React from "react";
import "../../../i18n";
import { boolean, number, select, text } from "@storybook/addon-knobs";
import { CrudFileUpload } from "../../../backend-components";
import LocalStorageConnector from "../../backend-integration/LocalStorageConnector";
import { fileToData } from "../../../utils";
import ErrorComponent from "../Form/ErrorComponent";

export const CrudFileUploadStory = (): React.ReactElement => {
	let acceptedType: string = select(
		"Accepted Filetypes",
		{
			Everything: "",
			Images: "image/*",
			Custom: "custom",
		},
		""
	);
	if (acceptedType === "custom") {
		acceptedType = text(
			"Accepted Filetypes (comma-separated)",
			".pdf,.docx,.xlsx,.pptx"
		);
	}

	return (
		<CrudFileUpload
			connector={new LocalStorageConnector("crud-file-upload")}
			serialize={async (data, id) => ({
				document: data.preview ?? (await fileToData(data.file)),
				name: data.file.name,
				id: id ?? undefined,
			})}
			deserialize={(data) => ({
				file: {
					id: data.id as string,
					name: data.name as string,
					downloadLink: data.document as string,
				},
			})}
			errorComponent={ErrorComponent}
			label={text("Upload Control Label", "Label")}
			maxFiles={number("Max files", 3, {
				range: true,
				min: 1,
				max: 100,
				step: 1,
			})}
			previewSize={number("Preview size (in px)", 128, {
				range: true,
				min: 16,
				max: 4096,
				step: 16,
			})}
			previewImages={boolean("Preview images", true)}
			accept={acceptedType}
			convertImagesTo={select(
				"Convert Images to",
				{
					"Don't convert": "",
					".png": "image/png",
					".jpg": "image/jpg",
				},
				""
			)}
			allowDuplicates={boolean("Allow duplicate files", false)}
			imageDownscaleOptions={
				boolean("Enable downscaling?", false)
					? {
							width: number("Max width", 1920, {
								range: true,
								min: 16,
								max: 4096,
								step: 16,
							}),
							height: number("Max height", 1080, {
								range: true,
								min: 16,
								max: 4096,
								step: 16,
							}),
							keepRatio: boolean("Keep aspect ratio when scaling", true),
					  }
					: undefined
			}
			readOnly={boolean("Read-only", false)}
		/>
	);
};

CrudFileUploadStory.storyName = "CrudFileUpload";
