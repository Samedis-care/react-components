import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	createEvent,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { Framework } from "../../../src/framework";
import CrudMultiImage, {
	BackendMultiImageImage,
	CrudMultiImageProps,
} from "../../../src/backend-components/FileUpload/CrudMultiImage";
import type { MultiImageImage } from "../../../src/standalone/FileUpload/MultiImage/MultiImage";
import type { ErrorComponentProps } from "../../../src/backend-components/Form";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import Connector from "../../../src/backend-integration/Connector/Connector";
import LazyConnector from "../../../src/backend-integration/Connector/LazyConnector";
import type ApiConnector from "../../../src/backend-integration/Connector/ApiConnector";
import ccI18n from "../../../src/i18n";

// jsdom has no canvas, so the image pipeline itself is replaced (as in
// test/standalone/MultiImage.test.tsx): a picked file is used as it is
const processImageMock = vi.hoisted(() => vi.fn());
vi.mock("../../../src/utils/processImage", () => ({
	default: processImageMock,
}));

beforeAll(async () => {
	await ccI18n.init();
	// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
	// jsdom has no layout, so it ships no Element.scrollTo, which ImageBox calls on mount
	(Element.prototype as unknown as { scrollTo: unknown }).scrollTo ??= () =>
		undefined;
});

afterEach(() => {
	cleanup();
	processImageMock.mockReset();
	serialize.mockClear();
});

const t = (key: string) => ccI18n.t(key);
const png = (name: string) => new File([name], name, { type: "image/png" });
// ImageDialogEntry reads a dropped list with files.item(0)
const fileList = (files: File[]) =>
	Object.assign([...files], {
		item: (i: number) => files[i] ?? null,
	}) as unknown as FileList;
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const settle = () =>
	act(async () => {
		await tick();
		await tick();
	});

/** A promise the test resolves when it wants to */
const gate = () => {
	let release!: () => void;
	const promise = new Promise<void>((resolve) => {
		release = resolve;
	});
	return { promise, release };
};

/** serialize as SCF writes it (`serializeImageData`): async, a Blob or a URL */
const serialize = vi.fn(async (data: MultiImageImage, id: string | null) => {
	await Promise.resolve();
	return {
		...data,
		image: data.image instanceof Blob ? data.image : undefined,
		image_url: data.image instanceof Blob ? undefined : data.image,
		id: id ?? undefined,
	};
});
const deserialize = (
	data: Record<string, unknown>,
): BackendMultiImageImage => ({
	id: data.id as string,
	name: data.name as string,
	image: (data.image_url ?? data.image) as string,
});

/**
 * An image backend that records what it was asked to do, refuses what it is told to, and
 * holds requests behind gates
 * @remarks A created image gets the URL `<name>.url`, an updated one `<name>.upd`, so
 *          the dialog shows which response an entry came from. MockConnector only stores
 *          the records.
 */
class Backend extends Connector {
	/** The payload of every create that went through */
	public creates: Record<string, unknown>[] = [];
	/** The payload of every update */
	public updates: Record<string, unknown>[] = [];
	/** The ids of every delete attempt, refused or not */
	public deleteCalls: string[] = [];
	public indexParams: unknown[] = [];
	public rejectCreates = new Set<string>();
	public rejectDeletes = new Set<string>();
	public indexGate: Promise<void> | null = null;
	public indexError: Error | null = null;
	/** one gate per create call, in order; a call without one goes through at once */
	public createGates: Promise<void>[] = [];
	public deleteGate: Promise<void> | null = null;
	private readonly store: MockConnector;

	constructor(data: Record<string, unknown>[]) {
		super();
		this.store = new MockConnector(data);
	}

	async index(params?: Parameters<MockConnector["index"]>[0]) {
		this.indexParams.push(params);
		if (this.indexGate) await this.indexGate;
		if (this.indexError) throw this.indexError;
		return this.store.index(params);
	}

	read(id: string) {
		return this.store.read(id);
	}

	async create(data: Record<string, unknown>) {
		const createGate = this.createGates.shift();
		if (createGate) await createGate;
		const name = data.name as string;
		if (this.rejectCreates.has(name))
			throw new Error(`upload of ${name} refused`);
		this.creates.push(data);
		return this.store.create({
			...data,
			image: undefined,
			image_url: `${name}.url`,
		});
	}

	async update(data: Record<string, unknown>) {
		await Promise.resolve();
		this.updates.push(data);
		return this.store.update({
			...data,
			image: undefined,
			image_url: `${data.name as string}.upd`,
		});
	}

	async delete(id: string) {
		this.deleteCalls.push(id);
		if (this.deleteGate) await this.deleteGate;
		if (this.rejectDeletes.has(id)) throw new Error(`delete of ${id} refused`);
		this.store.delete(id);
	}
}

/** The names of the images the backend holds, in the order it lists them */
const onServer = async (connector: Connector) =>
	(await connector.index({ rows: Number.MAX_SAFE_INTEGER }))[0].map(
		(record) => record.name as string,
	);

const OWN = [
	{ id: "1", name: "a", image_url: "a.png" },
	{ id: "2", name: "b", image_url: "b.png" },
];

/**
 * What the control could not write, where a test can read it
 * @remarks An alert, as an inline error component should be. DefaultErrorComponent
 *          pushes a dialog and renders nothing.
 */
const ErrorSink = (props: ErrorComponentProps) => (
	<div role={"alert"} data-testid={"error"}>
		{props.error.message}
	</div>
);

type ControlProps = Partial<CrudMultiImageProps> &
	Pick<CrudMultiImageProps, "connector">;

const renderMI = (props: ControlProps) => {
	const element = (extra?: Partial<CrudMultiImageProps>) => (
		<Framework>
			<CrudMultiImage
				label={"Images"}
				uploadImage={"upload.png"}
				captureImage={"capture.png"}
				errorComponent={ErrorSink}
				serialize={serialize}
				deserialize={deserialize}
				primary={null}
				{...props}
				{...extra}
			/>
		</Framework>
	);
	const utils = render(element());
	return {
		...utils,
		/** Renders the same control again with these props changed */
		update: (extra: Partial<CrudMultiImageProps>) =>
			utils.rerender(element(extra)),
	};
};

/**
 * Holds the primary like SamedisCrudMultiImage: what onPrimaryChange reports is stored and
 * passed back (as it is, "" included)
 */
interface PrimaryLog {
	/** every id onPrimaryChange reported, in order */
	reported: (string | null)[];
	/** the primary the owner holds now */
	current: string | null;
}
const Owner = (
	props: Omit<ControlProps, "primary" | "onPrimaryChange"> & {
		initialPrimary: string | null;
		log: PrimaryLog;
	},
) => {
	const { initialPrimary, log, ...rest } = props;
	const [primary, setPrimary] = React.useState(initialPrimary);
	log.current = primary;
	const onPrimaryChange = React.useCallback(
		(_name: string | undefined, id: string | null) => {
			log.reported.push(id);
			setPrimary(id);
		},
		[log],
	);
	return (
		<CrudMultiImage
			label={"Images"}
			uploadImage={"upload.png"}
			captureImage={"capture.png"}
			errorComponent={ErrorSink}
			serialize={serialize}
			deserialize={deserialize}
			primary={primary}
			onPrimaryChange={onPrimaryChange}
			{...rest}
		/>
	);
};
const renderOwner = (
	props: Omit<ControlProps, "primary" | "onPrimaryChange"> & {
		initialPrimary: string | null;
	},
) => {
	const log: PrimaryLog = { reported: [], current: null };
	return {
		...render(
			<Framework>
				<Owner log={log} {...props} />
			</Framework>,
		),
		log,
	};
};

/** Loaded: the field (with its file input) replaced the Loader */
const ready = (container: HTMLElement) =>
	waitFor(() =>
		expect(container.querySelector('input[type="file"]')).not.toBe(null),
	);
// found by its text, so it keeps working once the link becomes a button (ISSUE-3491-ITEM-28)
const openEdit = () => {
	fireEvent.click(
		screen.getByText(t("standalone.file-upload.multi-image.edit")),
	);
	return screen.getByRole("dialog");
};
const entries = (dialog: HTMLElement) =>
	Array.from(
		dialog.querySelectorAll<HTMLElement>('[class*="CcImageDialogEntry-root"]'),
	);
/** The image of each dialog entry, in order */
const srcs = (dialog: HTMLElement) =>
	entries(dialog).map((entry) =>
		entry.querySelector("img")!.getAttribute("src"),
	);
const pick = (container: HTMLElement, files: File[]) =>
	act(async () => {
		fireEvent.change(
			container.querySelector<HTMLInputElement>('input[type="file"]')!,
			{ target: { files } },
		);
		await tick();
		await tick();
	});
/** Drops files on a dialog entry, which replaces its image */
const dropOn = (entry: HTMLElement, files: File[]) =>
	act(async () => {
		const target = entry
			.querySelector("img")!
			.closest<HTMLElement>('[class*="CcImageBox-root"]')!;
		fireEvent(
			target,
			createEvent.drop(target, { dataTransfer: { files: fileList(files) } }),
		);
		await tick();
		await tick();
	});
// Remove is visibility: hidden until hovered (ISSUE-3491-ITEM-1), so it is found by its label
const removeEntry = (dialog: HTMLElement, index: number) =>
	act(async () => {
		fireEvent.click(
			within(entries(dialog)[index]).getByLabelText(
				t("standalone.file-upload.multi-image.remove"),
			),
		);
		await tick();
		await tick();
	});
// the "make primary" row has no role (ISSUE-3491-ITEM-1, ISSUE-3491-ITEM-10)
const makePrimary = (dialog: HTMLElement, index: number) =>
	act(async () => {
		fireEvent.click(
			entries(dialog)[index].querySelector<HTMLElement>(
				'[class*="CcImageDialogEntry-makePrimary"]',
			)!,
		);
		await tick();
	});
const usePassThroughImages = () =>
	processImageMock.mockImplementation((file: File) => Promise.resolve(file));

describe("CrudMultiImage", () => {
	it("lists every image of the connector in one request, after a Loader", async () => {
		const backend = new Backend(OWN);
		const onChange = vi.fn();
		const { container } = renderMI({
			connector: backend,
			name: "pics",
			onChange,
		});
		expect(screen.getByRole("progressbar")).toBeInTheDocument();

		await ready(container);

		expect(backend.indexParams).toEqual([
			{ page: 1, rows: Number.MAX_SAFE_INTEGER },
		]);
		expect(srcs(openEdit())).toEqual(["a.png", "b.png"]);
		const [name, images] = onChange.mock.calls.at(-1)! as [
			string,
			BackendMultiImageImage[],
		];
		expect(name).toBe("pics");
		expect(images.map((img) => img.id)).toEqual(["1", "2"]);
	});

	it("is a group named by its label, with an Edit control", async () => {
		const { container } = renderMI({ connector: new Backend(OWN) });
		await ready(container);

		const group = screen.getByRole("group", { name: "Images" });
		// by its text: the link becomes a button with the fix of ISSUE-3491-ITEM-28
		expect(
			within(group).getByText(t("standalone.file-upload.multi-image.edit")),
		).toBeInTheDocument();
	});

	it("creates a picked image once, with its position and no primary flag", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const { container } = renderMI({ connector: backend });
		await ready(container);

		await pick(container, [png("c.png")]);

		await waitFor(() => expect(backend.creates).toHaveLength(1));
		expect(backend.creates[0]).toMatchObject({
			name: "c.png",
			index: 2,
			primary: false,
		});
		expect(backend.creates[0].image).toBeInstanceOf(File);
		expect(backend.updates).toEqual([]);
		expect(backend.deleteCalls).toEqual([]);
		await waitFor(() =>
			expect(srcs(openEdit())).toEqual(["a.png", "b.png", "c.png.url"]),
		);
	});

	it("deletes only the removed image", async () => {
		const backend = new Backend(OWN);
		const { container } = renderMI({ connector: backend });
		await ready(container);
		const dialog = openEdit();

		await removeEntry(dialog, 0);

		await waitFor(() => expect(backend.deleteCalls).toEqual(["1"]));
		expect(backend.creates).toEqual([]);
		expect(backend.updates).toEqual([]);
		await waitFor(() => expect(srcs(dialog)).toEqual(["b.png"]));
		expect(await onServer(backend)).toEqual(["b"]);
	});

	it("updates a replaced image in place", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const { container } = renderMI({ connector: backend });
		await ready(container);
		const dialog = openEdit();

		await dropOn(entries(dialog)[1], [png("new.png")]);

		await waitFor(() => expect(backend.updates).toHaveLength(1));
		expect(backend.updates[0].id).toBe("2");
		expect((backend.updates[0].image as File).name).toBe("new.png");
		expect(backend.creates).toEqual([]);
		expect(backend.deleteCalls).toEqual([]);
		// the entry shows the update's response, in place; its name is ISSUE-3491-ITEM-16's to settle
		await waitFor(() => expect(srcs(dialog)[1]).toMatch(/\.upd$/));
		expect(srcs(dialog)).toHaveLength(2);
		expect(srcs(dialog)[0]).toBe("a.png");
	});

	it("lists read-only additional images first and never writes them", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const extras = [{ id: "x1", name: "x1", image: "x1.png", readOnly: true }];
		const { container } = renderMI({
			connector: backend,
			additionalImages: extras,
		});
		await ready(container);

		await pick(container, [png("c.png")]);

		await waitFor(() => expect(backend.creates).toHaveLength(1));
		expect(backend.creates.map((data) => data.name)).toEqual(["c.png"]);
		expect(backend.updates).toEqual([]);
		expect(backend.deleteCalls).toEqual([]);
		await waitFor(() =>
			expect(srcs(openEdit())).toEqual([
				"x1.png",
				"a.png",
				"b.png",
				"c.png.url",
			]),
		);
	});

	it("queues a pick on a LazyConnector until the queue is worked", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const lazy = new LazyConnector(backend as unknown as ApiConnector, false);
		const { container } = renderMI({ connector: lazy });
		await ready(container);

		await pick(container, [png("c.png")]);
		await waitFor(() => expect(lazy.isQueueEmpty()).toBe(false));
		expect(backend.creates).toEqual([]);

		await act(async () => {
			await lazy.workQueue();
		});

		expect(backend.creates.map((data) => data.name)).toEqual(["c.png"]);
		expect(await onServer(backend)).toEqual(["a", "b", "c.png"]);
	});

	it("reports a refused upload through errorComponent", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		backend.rejectCreates.add("bad.png");
		const { container } = renderMI({ connector: backend });
		await ready(container);

		await pick(container, [png("bad.png")]);

		await waitFor(() =>
			expect(screen.getByTestId("error").textContent).toBe(
				"upload of bad.png refused",
			),
		);
		expect(await onServer(backend)).toEqual(["a", "b"]);
	});

	it("keeps the primary when another image is added", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const { container, log } = renderOwner({
			connector: backend,
			initialPrimary: "2",
		});
		await ready(container);

		await pick(container, [png("c.png")]);
		await waitFor(() => expect(backend.creates).toHaveLength(1));
		await settle();

		expect(backend.creates[0].primary).toBe(false);
		expect(log.current).toBe("2");
		expect(log.reported.filter((id) => id !== "2")).toEqual([]);
	});
});

describe("CrudMultiImage: bugs", () => {
	it("[ISSUE-3511-ITEM-9] a later connector changes neither the list nor where writes go", async () => {
		const first = new Backend(OWN);
		const second = new Backend([
			{ id: "1", name: "other", image_url: "other.png" },
		]);
		const { container, update } = renderMI({ connector: first });
		await ready(container);

		update({ connector: second });
		await settle();
		const dialog = openEdit();
		expect(srcs(dialog)).toEqual(["a.png", "b.png"]);
		await removeEntry(dialog, 0);

		await waitFor(() => expect(first.deleteCalls).toEqual(["1"]));
		expect(second.deleteCalls).toEqual([]);
		expect(second.indexParams).toEqual([]);
	});

	it("[ISSUE-3511-ITEM-10] onChange never reports an empty list for a field that has images", async () => {
		const onChange = vi.fn();
		const { container } = renderMI({ connector: new Backend(OWN), onChange });
		await ready(container);
		await waitFor(() => expect(onChange).toHaveBeenCalled());

		expect(
			onChange.mock.calls.map(([, images]) => (images as unknown[]).length),
		).not.toContain(0);
	});

	it("[ISSUE-3511-ITEM-10] onChange is not called again when only the handler changes", async () => {
		const calls: number[] = [];
		let rerenderOwner!: () => void;
		const InlineOwner = () => {
			const [, setCount] = React.useState(0);
			rerenderOwner = () => setCount((count) => count + 1);
			return (
				<CrudMultiImage
					label={"Images"}
					uploadImage={"upload.png"}
					captureImage={"capture.png"}
					errorComponent={ErrorSink}
					serialize={serialize}
					deserialize={deserialize}
					primary={"1"}
					connector={backend}
					// inline, so a new function on every render
					onChange={(_name, images) => calls.push(images.length)}
				/>
			);
		};
		const backend = new Backend(OWN);
		const { container } = render(
			<Framework>
				<InlineOwner />
			</Framework>,
		);
		await ready(container);
		await waitFor(() => expect(calls).toContain(2));
		const before = calls.length;

		act(() => rerenderOwner());
		act(() => rerenderOwner());

		expect(calls).toHaveLength(before);
	});

	it("[ISSUE-3511-ITEM-11] an error is cleared by a later change that goes through", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		backend.rejectCreates.add("bad.png");
		const { container } = renderMI({ connector: backend });
		await ready(container);
		await pick(container, [png("bad.png")]);
		await waitFor(() =>
			expect(screen.getByTestId("error")).toBeInTheDocument(),
		);

		await pick(container, [png("ok.png")]);
		await waitFor(() => expect(backend.creates).toHaveLength(1));
		await settle();

		expect(screen.queryByTestId("error")).toBe(null);
	});

	it("[ISSUE-3511-ITEM-12] a primary among the additional images stays primary when an own image is added", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const extras = [
			{ id: "x1", name: "x1", image: "x1.png", readOnly: true },
			{ id: "x2", name: "x2", image: "x2.png", readOnly: true },
		];
		const { container, log } = renderOwner({
			connector: backend,
			additionalImages: extras,
			initialPrimary: "x2",
		});
		await ready(container);

		await pick(container, [png("c.png")]);
		await waitFor(() => expect(backend.creates).toHaveLength(1));
		await settle();

		expect(log.current).toBe("x2");
	});

	it("[ISSUE-3511-ITEM-12] a primary chosen while an upload runs is not reverted when it lands", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const uploading = gate();
		backend.createGates.push(uploading.promise);
		const { container, log } = renderOwner({
			connector: backend,
			initialPrimary: "2",
		});
		await ready(container);
		await pick(container, [png("c.png")]);

		await makePrimary(openEdit(), 0);
		expect(log.current).toBe("1");
		await act(async () => {
			uploading.release();
			await tick();
		});
		await waitFor(() => expect(backend.creates).toHaveLength(1));
		await settle();

		expect(log.current).toBe("1");
	});

	it("[ISSUE-3511-ITEM-12] no primary is reported as null, never as an empty id", async () => {
		usePassThroughImages();
		const backend = new Backend([]);
		const { container, log } = renderOwner({
			connector: backend,
			initialPrimary: null,
		});
		await ready(container);

		await pick(container, [png("c.png")]);
		await waitFor(() => expect(backend.creates).toHaveLength(1));
		await settle();

		expect(log.reported).not.toContain("");
	});

	it("[ISSUE-3511-ITEM-12] a primary that is no longer listed (an image deleted elsewhere) is left alone by a change", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const { container, log } = renderOwner({
			connector: backend,
			additionalImages: [
				{ id: "x1", name: "x1", image: "x1.png", readOnly: true },
			],
			initialPrimary: "x9",
		});
		await ready(container);
		await settle();
		// what MultiImage itself makes of the unknown id is ISSUE-3491-ITEM-6
		const before = log.reported.length;

		await pick(container, [png("c.png")]);
		await waitFor(() => expect(backend.creates).toHaveLength(1));
		await settle();

		expect(log.reported.slice(before)).toEqual([]);
	});

	it("[ISSUE-3511-ITEM-12] removing the primary image reports no primary, as null", async () => {
		const backend = new Backend(OWN);
		const { container, log } = renderOwner({
			connector: backend,
			initialPrimary: "2",
		});
		await ready(container);
		await settle();
		const before = log.reported.length;

		await removeEntry(openEdit(), 1);
		await waitFor(() => expect(backend.deleteCalls).toEqual(["2"]));
		await settle();

		// which image is shown as primary then is ISSUE-3491-ITEM-40
		expect(log.reported[before]).toBe(null);
	});

	it("[ISSUE-3511-ITEM-13] two removals in a row both leave the list", async () => {
		const backend = new Backend([
			...OWN,
			{ id: "3", name: "c", image_url: "c.png" },
		]);
		const deleting = gate();
		backend.deleteGate = deleting.promise;
		const { container } = renderMI({ connector: backend });
		await ready(container);
		const dialog = openEdit();

		await removeEntry(dialog, 0);
		// the first removal is still being written, so a is still listed first
		await removeEntry(dialog, 1);
		await act(async () => {
			deleting.release();
			await tick();
		});
		await settle();

		expect(await onServer(backend)).toEqual(["c"]);
		expect(srcs(dialog)).toEqual(["c.png"]);
	});

	it("[ISSUE-3511-ITEM-13] two picks in a row are both listed", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const uploading = gate();
		backend.createGates.push(uploading.promise);
		const { container } = renderMI({ connector: backend });
		await ready(container);

		await pick(container, [png("c.png")]);
		await pick(container, [png("d.png")]);
		await act(async () => {
			uploading.release();
			await tick();
		});
		await waitFor(() => expect(backend.creates).toHaveLength(2));
		await settle();

		expect(srcs(openEdit())).toEqual([
			"a.png",
			"b.png",
			"c.png.url",
			"d.png.url",
		]);
	});

	it("[ISSUE-3511-ITEM-14] the uploads of a selection that went through are listed when another is refused", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		backend.rejectCreates.add("bad.png");
		const { container } = renderMI({ connector: backend });
		await ready(container);

		await pick(container, [png("good.png"), png("bad.png")]);
		await waitFor(() =>
			expect(screen.getByTestId("error")).toBeInTheDocument(),
		);
		await settle();

		expect(await onServer(backend)).toEqual(["a", "b", "good.png"]);
		expect(srcs(openEdit())).toEqual(["a.png", "b.png", "good.png.url"]);
	});

	it("[ISSUE-3511-ITEM-15] a removal does not serialize the images it leaves untouched", async () => {
		const backend = new Backend(OWN);
		const { container } = renderMI({ connector: backend });
		await ready(container);
		const dialog = openEdit();

		await removeEntry(dialog, 0);
		await waitFor(() => expect(backend.deleteCalls).toEqual(["1"]));
		await settle();

		expect(serialize).not.toHaveBeenCalled();
	});

	it("[ISSUE-3511-ITEM-13] replacing an image an earlier change removed writes nothing", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const deleting = gate();
		backend.deleteGate = deleting.promise;
		const { container } = renderMI({ connector: backend });
		await ready(container);
		const dialog = openEdit();

		await removeEntry(dialog, 0);
		// the removal is still being written, so a is still listed and takes a drop
		await dropOn(entries(dialog)[0], [png("new.png")]);
		await act(async () => {
			deleting.release();
			await tick();
		});
		await settle();

		expect(backend.updates).toEqual([]);
		expect(backend.creates).toEqual([]);
		expect(await onServer(backend)).toEqual(["b"]);
		expect(srcs(dialog)).toEqual(["b.png"]);
	});

	it("[ISSUE-3511-ITEM-14] a refused removal keeps the image listed", async () => {
		const backend = new Backend(OWN);
		backend.rejectDeletes.add("1");
		const { container } = renderMI({ connector: backend });
		await ready(container);
		const dialog = openEdit();

		await removeEntry(dialog, 0);
		await waitFor(() => expect(backend.deleteCalls).toEqual(["1"]));
		await settle();

		expect(screen.getByTestId("error")).toHaveTextContent(
			"delete of 1 refused",
		);
		expect(srcs(dialog)).toEqual(["a.png", "b.png"]);
	});

	it("[ISSUE-3511-ITEM-16] replacing an additional image that is not marked read-only creates no copy here", async () => {
		usePassThroughImages();
		const backend = new Backend(OWN);
		const extras = [{ id: "x1", name: "x1", image: "x1.png" }];
		const { container } = renderMI({
			connector: backend,
			additionalImages: extras,
		});
		await ready(container);
		const dialog = openEdit();

		await dropOn(entries(dialog)[0], [png("new.png")]);
		await settle();

		expect(backend.creates).toEqual([]);
		expect(await onServer(backend)).toEqual(["a", "b"]);
	});

	it("[ISSUE-3511-ITEM-16] an additional image that is not marked read-only offers no Remove", async () => {
		const { container } = renderMI({
			connector: new Backend(OWN),
			additionalImages: [{ id: "x1", name: "x1", image: "x1.png" }],
		});
		await ready(container);
		const dialog = openEdit();
		const remove = t("standalone.file-upload.multi-image.remove");

		// the additional images come first
		expect(within(entries(dialog)[0]).queryByLabelText(remove)).toBe(null);
		expect(within(entries(dialog)[1]).queryByLabelText(remove)).not.toBe(null);
	});
});
