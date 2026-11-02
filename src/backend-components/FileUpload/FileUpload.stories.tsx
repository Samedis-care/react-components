import React, { useCallback, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "@mui/material";
import LazyConnector from "../../backend-integration/Connector/LazyConnector";
import type ApiConnector from "../../backend-integration/Connector/ApiConnector";

import type { FileUploadDispatch } from "../../standalone/FileUpload/Generic";
import { Framework } from "../../framework";
import CrudFileUpload, { BackendFileMeta } from "./CrudFileUpload";
import CrudMultiImage, { BackendMultiImageImage } from "./CrudMultiImage";
import MockConnector from "../../stories/test-utils/MockConnector";
import { FileData } from "../../standalone/FileUpload/Generic";
import DefaultErrorComponent from "../Form/DefaultErrorComponent";
import Form, { PageProps } from "../Form/Form";
import FormCrudFileUpload from "../Form/CrudControls/FormCrudFileUpload";
import FormCrudMultiImage from "../Form/CrudControls/FormCrudMultiImage";
import createTestModel from "../../stories/test-utils/TestModel";
import type { MultiImageImage } from "../../standalone/FileUpload/MultiImage/MultiImage";

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

const serialize = (data: FileData<File>): Record<string, unknown> => ({
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

// The classic variant passes axe; the modern one does not yet (ISSUE-3489-ITEM-10, ISSUE-3489-ITEM-11), so the
// modern stories below stay at the global "todo".
const AXE_GATE = { a11y: { test: "error" } } as const;

/** Finds the field once it has loaded: the loader stands in for it until then */
const findField = (
	canvasElement: HTMLElement,
	label = "Attachments",
): Promise<HTMLElement> =>
	within(canvasElement).findByRole(
		"group",
		{ name: label },
		{ timeout: 10000 },
	);

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
			label={"Attachments"}
		/>
	);
};

/**
 * The files of a record, behind a connector that writes at once: a pick is uploaded, a
 * remove deletes the file on the server, and there is no restore.
 */
export const Basic: StoryObj = {
	parameters: AXE_GATE,
	render: () => <FileUploadStory />,
	play: async ({ canvasElement }) => {
		const field = within(await findField(canvasElement));
		await field.findByText("document.pdf");
		await expect(field.getByText("image.png")).toBeTruthy();
		await expect(field.getByRole("button", { name: "Upload" })).toBeTruthy();
	},
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
			label={"Attachments"}
			readOnly
		/>
	);
};

/** Read-only: the files are listed, with no way to add or remove one */
export const ReadOnly: StoryObj = {
	parameters: AXE_GATE,
	render: () => <ReadOnlyFileUploadStory />,
	play: async ({ canvasElement }) => {
		const field = within(await findField(canvasElement));
		await field.findByText("document.pdf");
		await expect(field.queryByRole("button", { name: "Upload" })).toBeNull();
		await expect(canvasElement.querySelector('input[type="file"]')).toBeNull();
	},
};

/**
 * A file the field does not accept is refused before anything is uploaded, and the
 * refusal goes to errorComponent. With DefaultErrorComponent that is an error dialog,
 * which takes the focus and gives it back to Upload when it closes.
 */
const RefusedTypeStory = () => {
	const connector = useMemo(() => new MockConnector(fileConnectorData), []);
	return (
		<>
			<Button>Before</Button>
			<CrudFileUpload
				connector={connector}
				errorComponent={DefaultErrorComponent}
				serialize={serialize}
				deserialize={deserialize}
				accept=".pdf"
				previewSize={64}
				label={"Attachments"}
			/>
		</>
	);
};

export const RefusedFileType: StoryObj = {
	name: "CrudFileUpload — a refused file type, by keyboard",
	parameters: AXE_GATE,
	render: () => <RefusedTypeStory />,
	play: async ({ canvas, canvasElement }) => {
		const field = within(await findField(canvasElement));
		await field.findByText("document.pdf");
		canvas.getByRole("button", { name: "Before" }).focus();
		await userEvent.tab();
		const upload = field.getByRole("button", { name: "Upload" });
		await expect(upload).toHaveFocus();

		// what the browser hands over once the user chose a file in its dialog
		const input =
			canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
		if (!input) throw new Error("no file input");
		const chosen = new DataTransfer();
		chosen.items.add(new File(["x"], "notes.txt", { type: "text/plain" }));
		input.files = chosen.files;
		input.dispatchEvent(new Event("change", { bubbles: true }));

		const dialog = await within(document.body).findByRole("dialog", {
			name: "An error occurred",
		});
		await expect(
			within(dialog).getByText("Unsupported file type selected"),
		).toBeTruthy();
		await waitFor(async () => {
			await expect(
				within(dialog).getByRole("button", { name: "OK" }),
			).toHaveFocus();
		});
		await userEvent.keyboard("{Escape}");
		await waitFor(async () => {
			await expect(within(document.body).queryByRole("dialog")).toBeNull();
		});
		await waitFor(async () => {
			await expect(upload).toHaveFocus();
		});
		// nothing was listed or uploaded
		await expect(field.queryByText("notes.txt")).toBeNull();
	},
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
		return new LazyConnector(mock as unknown as ApiConnector, false);
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

/** A connector whose index never answers, which holds the field in its loading state */
class NeverLoadingConnector extends MockConnector {
	index(): Promise<never> {
		return new Promise<never>(() => undefined);
	}
}

/** A connector whose index is refused */
class FailingConnector extends MockConnector {
	index(): Promise<never> {
		return Promise.reject(new Error("forbidden_error"));
	}
}

const LoadStateFileUploadStory = (props: { failing?: boolean }) => {
	const { failing } = props;
	const connector = useMemo(
		() => (failing ? new FailingConnector() : new NeverLoadingConnector()),
		[failing],
	);
	return (
		<CrudFileUpload
			connector={connector}
			errorComponent={DefaultErrorComponent}
			serialize={serialize}
			deserialize={deserialize}
			accept="*/*"
			previewSize={64}
			label={"Attachments"}
		/>
	);
};

/**
 * ISSUE-3511-ITEM-17: while the files load, the field keeps its label and is marked busy, with a
 * named spinner in it
 */
export const Issue3511Item17LoadingKeepsFieldLabel: StoryObj = {
	name: "CrudFileUpload — ISSUE-3511-ITEM-17: the field keeps its label while it loads",
	parameters: AXE_GATE,
	render: () => <LoadStateFileUploadStory />,
	play: async ({ canvas }) => {
		await canvas.findByRole("progressbar");
		const field = canvas.queryByRole("group", { name: "Attachments" });
		await expect(field).not.toBeNull();
		await expect(field).toHaveAttribute("aria-busy", "true");
	},
};

/**
 * ISSUE-3511-ITEM-17: a failed load keeps the field and its label, and says so in an alert, with
 * the error's message
 */
export const Issue3511Item17FailedLoadKeepsFieldLabel: StoryObj = {
	name: "CrudFileUpload — ISSUE-3511-ITEM-17: a failed load keeps the field and announces it",
	parameters: AXE_GATE,
	render: () => <LoadStateFileUploadStory failing />,
	play: async ({ canvas }) => {
		const alert = await canvas.findByRole("alert");
		await expect(alert).toHaveTextContent(
			"The attachments could not be loaded",
		);
		await expect(alert).toHaveTextContent("forbidden_error");
		const field = canvas.getByRole("group", { name: "Attachments" });
		await expect(field).toContainElement(alert);
		await expect(field).not.toHaveAttribute("aria-busy");
	},
};

// ---------------------------------------------------------------------------
// CrudMultiImage
// ---------------------------------------------------------------------------

const svgImage = (body: string, size = 160) =>
	"data:image/svg+xml;base64," +
	btoa(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${body}</svg>`,
	);
const solidImage = (color: string) =>
	svgImage(`<rect width="160" height="160" fill="${color}"/>`);
// graphics of the add and camera tiles: the library ships none, apps pass their own
const ADD_TILE = svgImage(
	'<rect width="64" height="64" fill="#eeeeee"/><path d="M32 16v32M16 32h32" stroke="#616161" stroke-width="6"/>',
	64,
);
const CAMERA_TILE = svgImage(
	'<rect width="64" height="64" fill="#eeeeee"/><circle cx="32" cy="34" r="12" fill="#616161"/>',
	64,
);

const imageConnectorData = [
	{ id: "1", name: "front.png", image_url: solidImage("#e53935") },
	{ id: "2", name: "back.png", image_url: solidImage("#1e88e5") },
];

/** The record an image is stored as: a URL to show, or the picked file to upload */
const serializeImage = (
	data: MultiImageImage,
	id: string | null,
): Record<string, unknown> => ({
	id: id ?? undefined,
	name: data.name,
	image_url:
		data.image instanceof Blob ? URL.createObjectURL(data.image) : data.image,
});

const deserializeImage = (
	data: Record<string, unknown>,
): BackendMultiImageImage => ({
	id: data.id as string,
	name: data.name as string,
	image: data.image_url as string,
});

/** A PNG the browser can decode, as a user would pick it */
const pngFile = (name: string, color: string) =>
	new Promise<File>((resolve, reject) => {
		const canvas = document.createElement("canvas");
		canvas.width = 32;
		canvas.height = 32;
		const context = canvas.getContext("2d");
		if (!context) throw new Error("no 2d context");
		context.fillStyle = color;
		context.fillRect(0, 0, 32, 32);
		canvas.toBlob((blob) => {
			if (blob) resolve(new File([blob], name, { type: "image/png" }));
			else reject(new Error("the canvas gave no PNG"));
		}, "image/png");
	});

// Every MultiImage image is alt="" with an aria-label from its file-name Tooltip, which axe
// reports as presentation-role-conflict (ISSUE-3491-ITEM-27). The other rules gate these stories.
const MULTI_IMAGE_AXE_GATE = {
	a11y: {
		test: "error",
		config: { rules: [{ id: "presentation-role-conflict", enabled: false }] },
	},
} as const;

/**
 * The images of a record behind a connector that writes at once. The owner keeps the
 * primary image, and counts the images through onChange.
 */
const CrudMultiImageStory = () => {
	const connector = useMemo(() => new MockConnector(imageConnectorData), []);
	const [primary, setPrimary] = useState<string | null>("1");
	const [count, setCount] = useState(0);
	const handleChange = useCallback(
		(_name: string | undefined, images: BackendMultiImageImage[]) =>
			setCount(images.length),
		[],
	);
	const handlePrimaryChange = useCallback(
		(_name: string | undefined, id: string | null) => setPrimary(id),
		[],
	);
	return (
		<>
			<span data-testid={"count"}>{count}</span>
			<div style={{ width: 300 }}>
				<CrudMultiImage
					connector={connector}
					errorComponent={DefaultErrorComponent}
					serialize={serializeImage}
					deserialize={deserializeImage}
					label={"Device images"}
					uploadImage={ADD_TILE}
					captureImage={CAMERA_TILE}
					primary={primary}
					onPrimaryChange={handlePrimaryChange}
					onChange={handleChange}
				/>
			</div>
		</>
	);
};

export const MultiImageBasic: StoryObj = {
	name: "CrudMultiImage — editable",
	parameters: MULTI_IMAGE_AXE_GATE,
	render: () => <CrudMultiImageStory />,
	play: async ({ canvas, canvasElement }) => {
		const field = await findField(canvasElement, "Device images");
		await waitFor(async () => {
			await expect(canvas.getByTestId("count").textContent).toBe("2");
		});

		// a real PNG through the real image pipeline, which jsdom cannot run
		const input =
			canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
		if (!input) throw new Error("no file input");
		await userEvent.upload(input, await pngFile("new.png", "#43a047"));
		await waitFor(
			async () => {
				await expect(canvas.getByTestId("count").textContent).toBe("3");
			},
			{ timeout: 5000 },
		);

		// the edit dialog by keyboard: Enter on Edit opens it, Escape gives focus back. Found
		// by its text: the link becomes a button with the fix of ISSUE-3491-ITEM-28
		const edit = within(field).getByText("Edit");
		edit.focus();
		await userEvent.keyboard("{Enter}");
		const dialog = await within(document.body).findByRole("dialog");
		await expect(
			dialog.querySelectorAll('[class*="CcImageDialogEntry-root"]'),
		).toHaveLength(3);
		await userEvent.keyboard("{Escape}");
		await waitFor(async () => {
			await expect(within(document.body).queryByRole("dialog")).toBeNull();
		});
		await expect(edit).toHaveFocus();
	},
};

// an image of the parent record, shown first and never written (module level: the
// control matches additional images by identity)
const TYPE_PLATE: MultiImageImage[] = [
	{
		id: "plate",
		name: "type-plate.png",
		image: solidImage("#fdd835"),
		readOnly: true,
	},
];

const ReadOnlyCrudMultiImageStory = () => {
	const connector = useMemo(() => new MockConnector(imageConnectorData), []);
	return (
		<div style={{ width: 300 }}>
			<CrudMultiImage
				connector={connector}
				errorComponent={DefaultErrorComponent}
				serialize={serializeImage}
				deserialize={deserializeImage}
				label={"Inventory images"}
				uploadImage={ADD_TILE}
				captureImage={CAMERA_TILE}
				additionalImages={TYPE_PLATE}
				primary={"plate"}
				readOnly
			/>
		</div>
	);
};

/**
 * Read-only, with an image of the parent record (a device model's type plate) listed
 * first and shown as the primary image
 */
export const MultiImageReadOnlyWithAdditionalImages: StoryObj = {
	name: "CrudMultiImage — read-only, with additional images",
	parameters: MULTI_IMAGE_AXE_GATE,
	render: () => <ReadOnlyCrudMultiImageStory />,
	play: async ({ canvasElement }) => {
		const field = await findField(canvasElement, "Inventory images");
		// no Edit control, whatever its role (ISSUE-3491-ITEM-28)
		await expect(within(field).queryByText("Edit")).toBeNull();
		// the page shows the primary image, which is the additional one
		await expect(
			canvasElement
				.querySelector('[class*="CcMultiImage-root"] img')
				?.getAttribute("src"),
		).toBe(TYPE_PLATE[0].image);
	},
};

// ---------------------------------------------------------------------------
// In a Form
// ---------------------------------------------------------------------------

/**
 * The API a LazyConnector writes to once the form saved: MockConnector holds the records,
 * and the endpoint it is pointed at only matters to a real backend
 */
class CollectionApi extends MockConnector {
	setApiEndpoint() {}
}

interface CollectionApis {
	files: CollectionApi;
	images: CollectionApi;
}

const CollectionsPage = (props: PageProps<never, CollectionApis>) => {
	const { files, images } = props.customProps;
	const getFilesApi = useCallback(
		() => files as unknown as ApiConnector,
		[files],
	);
	const getImagesApi = useCallback(
		() => images as unknown as ApiConnector,
		[images],
	);
	return (
		<>
			<FormCrudFileUpload
				field={"attachments"}
				initialId={"1"}
				getEndpoint={(id) => `records/${id}/attachments`}
				getConnector={getFilesApi}
				serialize={serialize}
				deserialize={deserialize}
				accept="*/*"
				previewSize={24}
				label={"Attachments"}
			/>
			<FormCrudMultiImage
				field={"photos"}
				initialId={"1"}
				getEndpoint={(id) => `records/${id}/photos`}
				getConnector={getImagesApi}
				serialize={serializeImage}
				deserialize={deserializeImage}
				primary={null}
				uploadImage={ADD_TILE}
				captureImage={CAMERA_TILE}
				label={"Photos"}
			/>
		</>
	);
};

interface InFormArgs {
	/** The Form's readOnly, which both controls follow */
	readOnly: boolean;
	/** The Form's showDirtyState, which FormCrudFileUpload follows */
	showDirtyState: boolean;
}

const InFormStory = (props: InFormArgs) => {
	const model = useMemo(createTestModel, []);
	const apis = useMemo(
		(): CollectionApis => ({
			files: new CollectionApi(fileConnectorData),
			images: new CollectionApi([
				{ id: "1", name: "blue.svg", image_url: solidImage("#1e88e5") },
			]),
		}),
		[],
	);
	return (
		<Form
			model={model}
			id={"1"}
			errorComponent={DefaultErrorComponent}
			customProps={apis}
			disableRouting
			readOnly={props.readOnly}
			showDirtyState={props.showDirtyState}
		>
			{CollectionsPage}
		</Form>
	);
};

/**
 * FormCrudFileUpload and FormCrudMultiImage in a Form: their writes are queued until the
 * Form saves, and they follow the Form's readOnly (and FormCrudFileUpload its
 * showDirtyState)
 */
export const InForm: StoryObj<InFormArgs> = {
	name: "FormCrudFileUpload and FormCrudMultiImage — in a Form",
	parameters: MULTI_IMAGE_AXE_GATE,
	args: { readOnly: false, showDirtyState: true },
	render: (args) => <InFormStory {...args} />,
	play: async ({ canvas }) => {
		await canvas.findByText("document.pdf");
		const attachments = canvas.getByRole("group", { name: "Attachments" });
		await expect(
			attachments.querySelector('input[type="file"]'),
		).not.toBeNull();
		await expect(await canvas.findByText("Edit")).toBeVisible();
	},
};

/**
 * The same Form read-only: neither control offers a change
 */
export const InReadOnlyForm: StoryObj<InFormArgs> = {
	name: "FormCrudFileUpload and FormCrudMultiImage — in a read-only Form",
	parameters: MULTI_IMAGE_AXE_GATE,
	args: { readOnly: true, showDirtyState: true },
	render: (args) => <InFormStory {...args} />,
	play: async ({ canvas }) => {
		await canvas.findByText("document.pdf");
		const attachments = canvas.getByRole("group", { name: "Attachments" });
		await expect(attachments.querySelector('input[type="file"]')).toBeNull();
		await expect(
			attachments.querySelector('[data-testid="CancelOutlinedIcon"]'),
		).toBeNull();
		await waitFor(() =>
			expect(
				canvas.getByRole("group", { name: "Photos" }).querySelector("img"),
			).not.toBeNull(),
		);
		await expect(canvas.queryByText("Edit")).toBeNull();
	},
};
