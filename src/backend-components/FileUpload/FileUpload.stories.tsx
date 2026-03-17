import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Framework } from "../../framework";
import CrudFileUpload, { BackendFileMeta } from "./CrudFileUpload";
import MockConnector from "../../stories/test-utils/MockConnector";
import { FileData } from "../../standalone/FileUpload/Generic";
import DefaultErrorComponent from "../Form/DefaultErrorComponent";

const FrameworkDecorator = (Story: React.ComponentType) => (
	<Framework>
		<div style={{ padding: 24, maxWidth: 600 }}>
			<Story />
		</div>
	</Framework>
);

const meta: Meta = {
	title: "Backend-Components/FileUpload",
	decorators: [FrameworkDecorator],
};

export default meta;

const fileConnectorData = [
	{
		id: "1",
		name: "document.pdf",
		type: "application/pdf",
		downloadLink: "#",
	},
	{
		id: "2",
		name: "image.png",
		type: "image/png",
		downloadLink: "#",
	},
];

const serialize = (
	data: FileData<File>,
	id: string | null,
): Record<string, unknown> => ({
	...(id ? { id } : {}),
	name: data.file.name,
	type: data.file.type,
	downloadLink: URL.createObjectURL(data.file),
});

const deserialize = (
	data: Record<string, unknown>,
): FileData<BackendFileMeta> => ({
	file: {
		name: data.name as string,
		type: data.type as string,
		downloadLink: data.downloadLink as string,
		id: data.id as string,
	},
	canBeUploaded: false,
	delete: false,
});

const FileUploadStory = () => {
	const connector = useMemo(() => new MockConnector(fileConnectorData), []);
	return (
		<CrudFileUpload
			connector={connector}
			errorComponent={DefaultErrorComponent}
			serialize={serialize}
			deserialize={deserialize}
			accept="*/*"
			previewSize={64}
		/>
	);
};

export const Basic: StoryObj = {
	render: () => <FileUploadStory />,
};

const ReadOnlyFileUploadStory = () => {
	const connector = useMemo(() => new MockConnector(fileConnectorData), []);
	return (
		<CrudFileUpload
			connector={connector}
			errorComponent={DefaultErrorComponent}
			serialize={serialize}
			deserialize={deserialize}
			accept="*/*"
			previewSize={64}
			readOnly
		/>
	);
};

export const ReadOnly: StoryObj = {
	render: () => <ReadOnlyFileUploadStory />,
};
