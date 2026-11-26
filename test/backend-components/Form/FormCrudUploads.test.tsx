import { describe, it, expect, beforeAll, vi } from "vitest";
import React from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import FormCrudFileUpload, {
	FormCrudFileUploadProps,
} from "../../../src/backend-components/Form/CrudControls/FormCrudFileUpload";
import FormCrudMultiImage, {
	FormCrudMultiImageProps,
} from "../../../src/backend-components/Form/CrudControls/FormCrudMultiImage";
import type { ErrorComponentProps } from "../../../src/backend-components/Form";
import type { BackendFileMeta } from "../../../src/backend-components/FileUpload/CrudFileUpload";
import type { BackendMultiImageImage } from "../../../src/backend-components/FileUpload/CrudMultiImage";
import type ApiConnector from "../../../src/backend-integration/Connector/ApiConnector";
import type { FileData } from "../../../src/standalone/FileUpload/Generic";
import type { MultiImageImage } from "../../../src/standalone/FileUpload/MultiImage/MultiImage";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import ccI18n from "../../../src/i18n";
import PartialApplyError, {
	isPartialApplyError,
} from "../../../src/backend-components/Form/PartialApplyError";
import {
	capture,
	loaded,
	makeModel,
	mountForm,
	setupFormTests,
	Sink,
	TestFormProps,
	trySubmit,
} from "./formFixture";

// jsdom has no canvas, so the image pipeline itself is replaced (as in
// test/standalone/MultiImage.test.tsx): a picked file is used as it is
const processImageMock = vi.hoisted(() => vi.fn());
vi.mock("../../../src/utils/processImage", () => ({
	default: processImageMock,
}));

setupFormTests();
beforeAll(() => {
	// jsdom has no layout, so it ships no Element.scrollTo, which ImageBox calls on mount
	(Element.prototype as unknown as { scrollTo: unknown }).scrollTo ??= () =>
		undefined;
});

/**
 * The collection's backend, as the API connector the LazyConnector writes to after the
 * save: it records the endpoint it is pointed at, every create and every delete, and
 * refuses the creates and updates of the names in `refused` with "File too large"
 */
class CollectionApi extends MockConnector {
	public endpoints: string[] = [];
	public creates: Record<string, unknown>[] = [];
	public deletes: string[] = [];
	public refused = new Set<string>();

	setApiEndpoint(url: string) {
		this.endpoints.push(url);
	}

	create(data: Record<string, unknown>) {
		this.creates.push(data);
		if (this.refused.has(data.name as string))
			return Promise.reject(new Error("File too large"));
		return super.create(data);
	}

	update(data: Record<string, unknown>) {
		if (this.refused.has(data.name as string))
			throw new Error("File too large");
		return super.update(data);
	}

	delete(id: string) {
		this.deletes.push(id);
		super.delete(id);
	}
}

/**
 * What a save's PartialApplyError lists: each refused write's name, action and reason
 */
const failuresOf = <EntryT,>(
	error: unknown,
	nameOf: (entry: EntryT) => string,
) =>
	(error as PartialApplyError<EntryT>).failures.map((failure) => [
		nameOf(failure.entry),
		failure.action,
		failure.error.message,
	]);

const lazyParams = (api: CollectionApi) => ({
	field: "attachments",
	initialId: "1",
	getEndpoint: (id: string) => `records/${id}/attachments`,
	getConnector: () => api as unknown as ApiConnector,
});

const ErrorSink = (props: ErrorComponentProps) => (
	<span id={props.id} data-testid={"error"}>
		{props.error.message}
	</span>
);

const t = (key: string) => ccI18n.t(key);

describe("FormCrudFileUpload", () => {
	const STORED = [
		{
			id: "f1",
			name: "document.pdf",
			type: "application/pdf",
			downloadLink: "#document",
		},
	];
	const serialize = (data: FileData<File>): Record<string, unknown> => ({
		name: data.file.name,
		type: data.file.type,
		downloadLink: `#${data.file.name}`,
	});
	const deserialize = (
		data: Record<string, unknown>,
	): FileData<BackendFileMeta> => ({
		file: {
			id: data.id as string,
			name: data.name as string,
			type: data.type as string,
			downloadLink: data.downloadLink as string,
		},
	});

	const mount = (
		api: CollectionApi,
		props: Partial<FormCrudFileUploadProps> = {},
		formProps: TestFormProps = {},
	) => {
		const sink: Sink = {};
		const page = capture(sink, () => (
			<FormCrudFileUpload
				{...lazyParams(api)}
				label={"Attachments"}
				previewSize={24}
				serialize={serialize}
				deserialize={deserialize}
				{...props}
			/>
		));
		const ui = mountForm(makeModel(), page, formProps);
		const names = () =>
			Array.from(ui.container.querySelectorAll('[class*="CcFile-label"]')).map(
				(label) => label.textContent,
			);
		const pick = (name: string) =>
			act(async () => {
				fireEvent.change(
					ui.container.querySelector<HTMLInputElement>('input[type="file"]')!,
					{ target: { files: [new File(["content"], name)] } },
				);
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
		return { ...ui, sink, names, pick };
	};

	it("[ISSUE-3511-ITEM-23] is read-only while the Form is", async () => {
		const ui = mount(new CollectionApi(STORED), {}, { readOnly: true });
		await loaded(ui.sink);
		await waitFor(() => expect(ui.names()).toEqual(["document.pdf"]));

		expect(ui.container.querySelector('input[type="file"]')).toBe(null);
		expect(
			ui.container.querySelector('[data-testid="CancelOutlinedIcon"]'),
		).toBe(null);
	});

	it("[ISSUE-3511-ITEM-23] shows a refused selection through the Form's errorComponent", async () => {
		const ui = mount(
			new CollectionApi(STORED),
			{ maxFiles: 1 },
			{ errorComponent: ErrorSink },
		);
		await loaded(ui.sink);
		await waitFor(() => expect(ui.names()).toEqual(["document.pdf"]));

		await ui.pick("notes.txt");

		expect(screen.getByTestId("error")).toHaveTextContent(
			t("standalone.file-upload.error.too-many"),
		);
	});

	it("[ISSUE-3511-ITEM-23] marks a queued change while the Form shows dirty state", async () => {
		const ui = mount(new CollectionApi(STORED), {}, { showDirtyState: true });
		await loaded(ui.sink);
		await waitFor(() => expect(ui.names()).toEqual(["document.pdf"]));
		const marker = () =>
			ui.container.querySelector('[class*="CcDirtyMarker-root"]');
		expect(marker()).toBe(null);

		await ui.pick("notes.txt");

		await waitFor(() => expect(marker()).not.toBe(null));
	});

	it("[ISSUE-3511-ITEM-23] its own showDirtyState wins over the Form's", async () => {
		const ui = mount(
			new CollectionApi(STORED),
			{ showDirtyState: false },
			{ showDirtyState: true },
		);
		await loaded(ui.sink);
		await waitFor(() => expect(ui.names()).toEqual(["document.pdf"]));

		await ui.pick("notes.txt");
		await waitFor(() => expect(ui.names()).toContain("notes.txt"));

		expect(ui.container.querySelector('[class*="CcDirtyMarker-root"]')).toBe(
			null,
		);
	});

	it("[ISSUE-3511-ITEM-23] queues a pick and uploads it once the Form saved the record", async () => {
		const api = new CollectionApi(STORED);
		const ui = mount(api);
		await loaded(ui.sink);
		await waitFor(() => expect(ui.names()).toEqual(["document.pdf"]));

		await ui.pick("notes.txt");
		await waitFor(() => expect(ui.names()).toContain("notes.txt"));
		expect(api.creates).toEqual([]);

		expect(await trySubmit(ui.sink)).toBe(null);

		expect(api.creates.map((data) => data.name)).toEqual(["notes.txt"]);
		expect(api.endpoints).toContain("records/1/attachments");
	});

	it("[ISSUE-3511-ITEM-27] a save the backend refuses in part names each refused file, and not the stored one", async () => {
		const api = new CollectionApi(STORED);
		api.refused.add("bad.txt").add("bad2.txt");
		const ui = mount(api);
		await loaded(ui.sink);
		await waitFor(() => expect(ui.names()).toEqual(["document.pdf"]));
		await ui.pick("good.txt");
		await ui.pick("bad.txt");
		await ui.pick("bad2.txt");
		await waitFor(() =>
			expect(ui.names()).toEqual([
				"document.pdf",
				"good.txt",
				"bad.txt",
				"bad2.txt",
			]),
		);

		const error = await trySubmit(ui.sink);

		expect(api.creates.map((data) => data.name)).toEqual([
			"good.txt",
			"bad.txt",
			"bad2.txt",
		]);
		const message =
			"Could not upload bad.txt: File too large. Could not upload bad2.txt: File too large.";
		expect((error as Error).message).toBe(message);
		expect(isPartialApplyError(error as Error)).toBe(true);
		expect(
			failuresOf(error, (file: FileData<BackendFileMeta>) => file.file.name),
		).toEqual([
			["bad.txt", "create", "File too large"],
			["bad2.txt", "create", "File too large"],
		]);
		// the Form shows it in its error dialog
		expect(await screen.findByRole("dialog")).toHaveTextContent(message);
	});

	it("[ISSUE-3511-ITEM-27] a refused replacement is named, and the file it was to replace stays on the server", async () => {
		const api = new CollectionApi(STORED);
		api.refused.add("document.pdf");
		const ui = mount(api);
		await loaded(ui.sink);
		await waitFor(() => expect(ui.names()).toEqual(["document.pdf"]));
		await ui.pick("document.pdf");
		await waitFor(() =>
			expect(ui.names()).toEqual(["document.pdf", "document.pdf"]),
		);

		const error = await trySubmit(ui.sink);

		expect((error as Error).message).toBe(
			"Could not upload document.pdf: File too large.",
		);
		expect(api.deletes).toEqual([]);
		expect((await api.index())[0].map((record) => record.id)).toEqual(["f1"]);
	});
});

describe("FormCrudMultiImage", () => {
	const OWN = [{ id: "i1", name: "a", image_url: "a.png" }];
	const serialize = vi.fn((data: MultiImageImage): Record<string, unknown> => ({
		name: data.name,
		image_url: data.image,
	}));
	const deserialize = (
		data: Record<string, unknown>,
	): BackendMultiImageImage => ({
		id: data.id as string,
		name: data.name as string,
		image: data.image_url as string,
	});

	const mount = (
		api: CollectionApi,
		props: Partial<FormCrudMultiImageProps> = {},
		formProps: TestFormProps = {},
	) => {
		const sink: Sink = {};
		const page = capture(sink, () => (
			<FormCrudMultiImage
				{...lazyParams(api)}
				label={"Images"}
				uploadImage={"upload.png"}
				captureImage={"capture.png"}
				primary={null}
				serialize={serialize}
				deserialize={deserialize}
				{...props}
			/>
		));
		const ui = mountForm(makeModel(), page, formProps);
		const edit = () =>
			screen.queryByText(t("standalone.file-upload.multi-image.edit"));
		const add = (name: string) =>
			act(async () => {
				fireEvent.change(
					ui.container.querySelector<HTMLInputElement>('input[type="file"]')!,
					{
						target: { files: [new File([name], name, { type: "image/png" })] },
					},
				);
				await new Promise((resolve) => setTimeout(resolve, 0));
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
		return { ...ui, sink, edit, add };
	};

	it("[ISSUE-3511-ITEM-23] is read-only while the Form is", async () => {
		const ui = mount(new CollectionApi(OWN), {}, { readOnly: true });
		await loaded(ui.sink);
		await waitFor(() =>
			expect(ui.container.querySelector('img[src="a.png"]')).not.toBe(null),
		);

		expect(ui.edit()).toBe(null);
	});

	it("[ISSUE-3511-ITEM-23] shows a refused write through the Form's errorComponent", async () => {
		processImageMock.mockImplementation((file: File) => Promise.resolve(file));
		serialize.mockImplementationOnce(() => {
			throw new Error("serialize refused");
		});
		const ui = mount(new CollectionApi(OWN), {}, { errorComponent: ErrorSink });
		await loaded(ui.sink);
		await waitFor(() => expect(ui.edit()).not.toBe(null));

		await ui.add("new.png");

		await waitFor(() =>
			expect(screen.getByTestId("error")).toHaveTextContent(
				"serialize refused",
			),
		);
	});

	it("[ISSUE-3511-ITEM-23] queues an added image and creates it once the Form saved the record", async () => {
		processImageMock.mockImplementation((file: File) => Promise.resolve(file));
		const api = new CollectionApi(OWN);
		const ui = mount(api);
		await loaded(ui.sink);
		await waitFor(() => expect(ui.edit()).not.toBe(null));

		await ui.add("new.png");
		await waitFor(() => expect(serialize).toHaveBeenCalled());
		expect(api.creates).toEqual([]);

		expect(await trySubmit(ui.sink)).toBe(null);

		expect(api.creates.map((data) => data.name)).toEqual(["new.png"]);
		expect(api.endpoints).toContain("records/1/attachments");
	});

	it("[ISSUE-3511-ITEM-27] a save the backend refuses in part names each refused image, and not the stored one", async () => {
		processImageMock.mockImplementation((file: File) => Promise.resolve(file));
		serialize.mockClear();
		const api = new CollectionApi(OWN);
		api.refused.add("bad.png").add("bad2.png");
		const ui = mount(api);
		await loaded(ui.sink);
		await waitFor(() => expect(ui.edit()).not.toBe(null));
		await ui.add("good.png");
		await ui.add("bad.png");
		await ui.add("bad2.png");
		await waitFor(() => expect(serialize).toHaveBeenCalledTimes(3));
		await act(async () => {});

		const error = await trySubmit(ui.sink);

		expect(api.creates.map((data) => data.name)).toEqual([
			"good.png",
			"bad.png",
			"bad2.png",
		]);
		const message =
			"Could not upload bad.png: File too large. Could not upload bad2.png: File too large.";
		expect((error as Error).message).toBe(message);
		expect(isPartialApplyError(error as Error)).toBe(true);
		expect(
			failuresOf(error, (image: BackendMultiImageImage) => image.name),
		).toEqual([
			["bad.png", "create", "File too large"],
			["bad2.png", "create", "File too large"],
		]);
		// the Form shows it in its error dialog
		expect(await screen.findByRole("dialog")).toHaveTextContent(message);
	});
});
