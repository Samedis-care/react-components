import React, { useCallback, useMemo, useRef, useState } from "react";
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
	// what onDirtyChange reports, which a form page would feed to its own dirty state
	const [pending, setPending] = useState(false);
	// stands in for anything which throws the control away and builds it again: a
	// language switch, a route change, a tab
	const [instance, setInstance] = useState(0);
	return (
		<>
			<span data-testid={"pending"}>{String(pending)}</span>
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
			<Button onClick={() => setInstance((instance) => instance + 1)}>
				Remount
			</Button>
			<CrudFileUpload
				key={instance}
				ref={dispatch}
				connector={lazy}
				errorComponent={DefaultErrorComponent}
				serialize={serialize}
				deserialize={deserialize}
				accept="*/*"
				previewSize={24}
				variant={"modern"}
				label={"Attachments"}
				showDirtyState
				onDirtyChange={setPending}
			/>
		</>
	);
};

/**
 * A connector whose uploads only finish when the story says so, to hold open the window
 * in which the control has handed a picked file to the backend but has not yet heard
 * back — which is exactly when a user removes something else.
 */
class GatedConnector extends MockConnector {
	public creates = 0;
	private release: (() => void) | null = null;
	private readonly gate = new Promise<void>((resolve) => {
		this.release = resolve;
	});

	async create(data: Record<string, unknown>) {
		this.creates++;
		await this.gate;
		return super.create(data);
	}

	finish() {
		this.release?.();
	}
}

/**
 * Removing a file while another one is still uploading. The control hands the list back
 * as it last saw it, picked file included, so the upload must not be started a second
 * time.
 */
const RaceFileUploadStory = () => {
	const connector = useMemo(() => new GatedConnector(fileConnectorData), []);
	const dispatch = useRef<FileUploadDispatch>(null);
	// how many uploads the backend was asked for, which is the thing at stake: a second
	// one leaves a second copy on the server and only one row in the list
	const [creates, setCreates] = useState(0);
	const handleChange = useCallback(
		() => setCreates(connector.creates),
		[connector],
	);
	return (
		<>
			<span data-testid={"creates"}>{creates}</span>
			<Button
				onClick={() =>
					void dispatch.current?.addFile(
						new File(["x"], "race.txt", { type: "text/plain" }),
					)
				}
			>
				Add a file
			</Button>
			<Button onClick={() => connector.finish()}>Finish upload</Button>
			<CrudFileUpload
				ref={dispatch}
				connector={connector}
				errorComponent={DefaultErrorComponent}
				serialize={serialize}
				deserialize={deserialize}
				onChange={handleChange}
				accept="*/*"
				previewSize={24}
				variant={"modern"}
				label={"Attachments"}
			/>
		</>
	);
};

export const UploadRace: StoryObj = {
	name: "CrudFileUpload — removing during an upload",
	render: () => <RaceFileUploadStory />,
	play: async ({ canvas, canvasElement }) => {
		const byTestId = (id: string) =>
			Array.from(canvasElement.querySelectorAll(`[data-testid="${id}"]`));
		const btnOf = (name: string, testId: string) => {
			let el: Element | null = canvas.getByText(name);
			while (el && !el.querySelector(`[data-testid="${testId}"]`))
				el = el.parentElement;
			const btn = el?.querySelector(`[data-testid="${testId}"]`);
			if (!btn) throw new Error(`no ${testId} for ${name}`);
			return btn;
		};

		await canvas.findByText("document.pdf", undefined, { timeout: 10000 });

		// the upload starts and hangs
		canvas.getByRole("button", { name: "Add a file" }).click();
		await canvas.findByText("race.txt");

		// removing another file in the meantime hands the picked file back untouched
		btnOf("document.pdf", "CancelIcon").dispatchEvent(
			new MouseEvent("click", { bubbles: true }),
		);

		canvas.getByRole("button", { name: "Finish upload" }).click();
		await waitFor(async () => {
			await expect(canvas.queryByText("document.pdf")).toBe(null);
		});

		// one upload, one row
		await expect(
			canvasElement.querySelectorAll('[aria-label="race.txt"]'),
		).toHaveLength(1);
		await expect(byTestId("CancelIcon")).toHaveLength(2);
		// the list cannot show a second copy on the server, so ask the backend
		await expect(canvas.getByTestId("creates").textContent).toBe("1");
	},
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
		const restoreBtns = () => byTestId("RestoreFromTrashIcon");
		// by file rather than by position: a file whose removal is pending is listed
		// wherever the control has it, which is not where it started
		const btnOf = (name: string, testId: string) => {
			let el: Element | null = canvas.getByText(name);
			while (el && !el.querySelector(`[data-testid="${testId}"]`))
				el = el.parentElement;
			const btn = el?.querySelector(`[data-testid="${testId}"]`);
			if (!btn) throw new Error(`no ${testId} for ${name}`);
			return btn;
		};
		const click = (el: Element) =>
			el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

		// the control's own label carries the field level dirty marker, which for a
		// custom field like this one comes from the connector queue rather than the form
		const labelMarkers = () =>
			canvasElement.querySelector("legend")?.querySelectorAll("span").length ??
			0;

		const pending = () => canvas.getByTestId("pending").textContent;

		await canvas.findByText("document.pdf", undefined, { timeout: 10000 });
		await expect(changeOf("document.pdf")).toBe(null);
		await expect(restoreBtns()).toHaveLength(0);
		await expect(labelMarkers()).toBe(0);
		await waitFor(async () => {
			await expect(pending()).toBe("false");
		});

		// a queued upload reads as added
		canvas.getByRole("button", { name: "Add a file" }).click();
		await waitFor(async () => {
			await expect(changeOf("addendum.docx")).toBe("added");
		});
		// ...and the queued upload makes the whole field dirty, which onDirtyChange
		// reports whether or not the marker is shown
		await expect(labelMarkers()).toBe(1);
		await waitFor(async () => {
			await expect(pending()).toBe("true");
		});

		// a queued removal stays in the list, struck through, and offers a restore
		click(btnOf("document.pdf", "CancelIcon"));
		await waitFor(async () => {
			await expect(changeOf("document.pdf")).toBe("removed");
		});
		await expect(restoreBtns()).toHaveLength(1);

		// the pending state lives on the connector queue, not in the control, so it
		// survives the control being thrown away and built again
		canvas.getByRole("button", { name: "Remount" }).click();
		await waitFor(async () => {
			await expect(changeOf("document.pdf")).toBe("removed");
		});
		await expect(restoreBtns()).toHaveLength(1);
		// ...and so does the queued upload's mark
		await expect(changeOf("addendum.docx")).toBe("added");
		// exactly once: a change made while the upload was still running used to hand
		// the picked file back and queue a second upload of it
		await expect(
			canvasElement.querySelectorAll('[aria-label="addendum.docx"]'),
		).toHaveLength(1);

		// restoring drops the queued delete
		click(btnOf("document.pdf", "RestoreFromTrashIcon"));
		await waitFor(async () => {
			await expect(changeOf("document.pdf")).toBe(null);
		});
		await expect(restoreBtns()).toHaveLength(0);

		// submitting works the queue, and the marks clear once it is empty
		await expect(changeOf("addendum.docx")).toBe("added");
		canvas.getByRole("button", { name: "Submit" }).click();
		await waitFor(async () => {
			await expect(changeOf("addendum.docx")).toBe(null);
		});
		await expect(labelMarkers()).toBe(0);
		await waitFor(async () => {
			await expect(pending()).toBe("false");
		});

		// a removal which is actually submitted leaves the list: the file is gone from
		// the server, and a row left behind reads as an existing file, so removing it
		// again would send the same delete against an id the backend no longer knows
		click(btnOf("document.pdf", "CancelIcon"));
		await waitFor(async () => {
			await expect(changeOf("document.pdf")).toBe("removed");
		});
		// the button renames itself after the first submit
		canvas.getByRole("button", { name: "Submitted" }).click();
		await waitFor(async () => {
			await expect(canvas.queryByText("document.pdf")).toBe(null);
		});
		// ...while the file which was added stays
		await expect(canvas.getByText("addendum.docx")).toBeTruthy();
		await waitFor(async () => {
			await expect(pending()).toBe("false");
		});
	},
};
