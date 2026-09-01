import React, { useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor } from "storybook/test";
import { Button } from "@mui/material";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import type ApiConnector from "../../backend-integration/Connector/ApiConnector";
import type { PageVisibility } from "../../backend-integration";
import type { FileUploadDispatch } from "../../standalone/FileUpload/Generic";
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

/**
 * With a LazyConnector — what a form uses — an upload or a removal is only queued until
 * the form submits. That pending state is what the control shows: a queued upload is
 * green, a queued removal is struck through and offers a restore, and restoring drops
 * the queued request again.
 */
const LazyFileUploadStory = () => {
	const lazy = useMemo(() => {
		const mock = new MockConnector(fileConnectorData);
		// fakeReads false is what a form uses for an existing record: reads go to the
		// backend, writes are queued. MockConnector stands in for the API connector,
		// whose endpoint handling only matters once the queue is worked.
		return new LazyConnector<string, PageVisibility, unknown>(
			mock as unknown as ApiConnector<string, PageVisibility, unknown>,
			false,
		);
	}, []);
	const dispatch = useRef<FileUploadDispatch>(null);
	// stands in for the form submitting: the queue is worked, and something re-renders
	const [submitted, setSubmitted] = useState(false);
	return (
		<>
			<Button
				onClick={() =>
					void lazy.workQueue().then(() => {
						setSubmitted(true);
					})
				}
			>
				{submitted ? "Submitted" : "Submit"}
			</Button>
			<Button
				onClick={() =>
					void dispatch.current?.addFile(
						new File(["x"], "addendum.docx", {
							type: "application/msword",
						}),
					)
				}
			>
				Add a file
			</Button>
			<CrudFileUpload
				ref={dispatch}
				connector={lazy}
				errorComponent={DefaultErrorComponent}
				serialize={serialize}
				deserialize={deserialize}
				accept="*/*"
				previewSize={24}
				variant={"modern"}
				label={"Attachments"}
			/>
		</>
	);
};

export const LazyPendingChanges: StoryObj = {
	name: "CrudFileUpload — queued uploads and removals",
	render: () => <LazyFileUploadStory />,
	play: async ({ canvas, canvasElement }) => {
		const changeOf = (name: string) =>
			canvas.getByText(name).getAttribute("data-cc-change");
		const byTestId = (id: string) =>
			Array.from(canvasElement.querySelectorAll(`[data-testid="${id}"]`));
		// the modern variant renders its remove control as a filled Cancel icon
		const removeBtns = () => byTestId("CancelIcon");
		const restoreBtns = () => byTestId("RestoreFromTrashIcon");

		// the control's own label carries the field level dirty marker, which for a
		// custom field like this one comes from the connector queue rather than the form
		const labelMarkers = () =>
			canvasElement.querySelector("legend")?.querySelectorAll("span").length ??
			0;

		await canvas.findByText("document.pdf", undefined, { timeout: 10000 });
		await expect(changeOf("document.pdf")).toBe(null);
		await expect(restoreBtns()).toHaveLength(0);
		await expect(labelMarkers()).toBe(0);

		// a queued upload reads as added
		canvas.getByRole("button", { name: "Add a file" }).click();
		await waitFor(async () => {
			await expect(changeOf("addendum.docx")).toBe("added");
		});
		// ...and the queued upload makes the whole field dirty
		await expect(labelMarkers()).toBe(1);

		// a queued removal stays in the list, struck through, and offers a restore
		removeBtns()[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
		await waitFor(async () => {
			await expect(changeOf("document.pdf")).toBe("removed");
		});
		await expect(restoreBtns()).toHaveLength(1);

		// restoring drops the queued delete
		restoreBtns()[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
		await waitFor(async () => {
			await expect(changeOf("document.pdf")).toBe(null);
		});
		await expect(restoreBtns()).toHaveLength(0);

		// submitting works the queue, and the markers clear on the next render without
		// anything telling the control to clear them - which is why the pending state is
		// derived from the queue rather than stored on the files
		await expect(changeOf("addendum.docx")).toBe("added");
		canvas.getByRole("button", { name: "Submit" }).click();
		await waitFor(async () => {
			await expect(changeOf("addendum.docx")).toBe(null);
		});
		await expect(labelMarkers()).toBe(0);
	},
};
