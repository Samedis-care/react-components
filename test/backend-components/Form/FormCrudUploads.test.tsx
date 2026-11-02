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
 * save: it records the endpoint it is pointed at and every create
 */
class CollectionApi extends MockConnector {
	public endpoints: string[] = [];
	public creates: Record<string, unknown>[] = [];

	setApiEndpoint(url: string) {
		this.endpoints.push(url);
	}

	create(data: Record<string, unknown>) {
		this.creates.push(data);
		return super.create(data);
	}
}

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
});
